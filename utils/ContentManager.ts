import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { TemplateEngine } from './TemplateEngine';
import { DatabaseManager } from './DatabaseManager';
import { config } from '../config';

export class ContentManager {
  private templateEngine: TemplateEngine;
  private dbManager: DatabaseManager;

  constructor(templateEngine: TemplateEngine, dbManager: DatabaseManager) {
    this.templateEngine = templateEngine;
    this.dbManager = dbManager;
  }

  async compileContent(filePath: string): Promise<string> {
    const content = await Bun.file(filePath).text();
    const parts = content.split(/---\s*\n/);
    
    if (parts.length < 3) {
      throw new Error('Invalid markdown file format');
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

    return this.templateEngine.compile(templateParse, context);
  }

  async initializeContent() {
    const contentDir = path.join(process.cwd(), config.contentDirectory);
    const pages = fs.readdirSync(contentDir).filter(file => file.endsWith('.md')).map(file => file.replace('.md', ''));
    
    for (const page of pages) {
      await this.updatePageContent(page);
    }
  }

  async updatePageContent(page: string) {
    const filePath = path.join(process.cwd(), config.contentDirectory, `${page}.md`);
    const compiledContent = await this.compileContent(filePath);
    await this.dbManager.saveCompiledContent(page, compiledContent);
    console.log(`${page} content compiled and saved to database`);
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