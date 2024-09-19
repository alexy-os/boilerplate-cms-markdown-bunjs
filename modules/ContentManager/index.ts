import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { marked } from 'marked';
import { TemplateEngine } from '../../utils/TemplateEngine';
import { DatabaseManager } from '../../utils/DatabaseManager';
import { config } from '../../config';

interface ContentManagerOptions {
  isEngine: boolean;
  saveDb: boolean;
}

export class ContentManager {
  private templateEngine: TemplateEngine | null;
  private databaseManager: DatabaseManager | null;
  private options: ContentManagerOptions;

  constructor(options: ContentManagerOptions) {
    this.options = options;
    console.log('ContentManager initialized with options:', options);
    this.templateEngine = options.isEngine ? new TemplateEngine() : null;
    this.databaseManager = options.saveDb ? new DatabaseManager() : null;
  }

  async getContent(pageName: string): Promise<string> {
    console.log(`Processing content for page: ${pageName}`);
    console.log(`isEngine: ${this.options.isEngine}, saveDb: ${this.options.saveDb}`);

    if (this.options.saveDb && this.databaseManager) {
      const savedContent = await this.databaseManager.getCompiledContent(pageName);
      if (savedContent) {
        console.log(`Retrieved content for ${pageName} from database`);
        return savedContent;
      }
    }

    const filePath = path.join(process.cwd(), config.contentDirectory, `${pageName}.md`);
    const content = await fs.promises.readFile(filePath, 'utf-8');

    if (this.options.isEngine) {
      return this.processWithTemplateEngine(pageName, content);
    } else {
      return this.processMarkdown(pageName, content);
    }
  }

  private async processWithTemplateEngine(pageName: string, content: string): Promise<string> {
    const parts = content.split(/---\s*\n/);
    
    if (parts.length < 3) {
      return this.processMarkdown(pageName, content);
    }

    const frontMatter = parts[1];
    const templateParse = parts.slice(2).join('---\n');

    let context: Record<string, unknown>;
    try {
      context = yaml.load(frontMatter) as Record<string, unknown>;
    } catch (error) {
      console.error('Error parsing front matter:', error);
      context = {};
    }

    const compiledContent = await this.templateEngine!.compile(templateParse, context);

    if (this.options.saveDb && this.databaseManager) {
      await this.databaseManager.saveCompiledContent(pageName, compiledContent);
    }

    return compiledContent;
  }

  private async processMarkdown(pageName: string, content: string): Promise<string> {
    const htmlContent = await marked.parse(content);

    if (this.options.saveDb && this.databaseManager) {
      await this.databaseManager.saveCompiledContent(pageName, htmlContent);
    }

    return htmlContent;
  }

  getPages(): string[] {
    const contentDir = path.join(process.cwd(), config.contentDirectory);
    const pages = fs.readdirSync(contentDir)
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''));

    if (!pages.includes(config.defaultPage)) {
      pages.push(config.defaultPage);
    }

    return pages;
  }

  getMenu(): { url: string; title: string }[] {
    return this.getPages().map(page => ({
      url: page === config.defaultPage ? '/' : `/${page}`,
      title: page === config.defaultPage ? config.defaultPage : this.capitalizeFirstLetter(page)
    }));
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}