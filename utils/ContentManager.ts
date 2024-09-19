import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { TemplateEngine } from './TemplateEngine';
import { DatabaseManager } from './DatabaseManager';
import { config } from '../config';

/**
 * The ContentManager class is responsible for managing the content.
 */
export class ContentManager {
  private templateEngine: TemplateEngine;
  private dbManager: DatabaseManager;

  /**
   * Constructor for the ContentManager class.
   * @param {TemplateEngine} templateEngine - The TemplateEngine instance.
   * @param {DatabaseManager} dbManager - The DatabaseManager instance.
   */
  constructor(templateEngine: TemplateEngine, dbManager: DatabaseManager) {
    this.templateEngine = templateEngine;
    this.dbManager = dbManager;
  }

  /**
   * Compiles the content from the specified file path.
   * @param {string} filePath - The path to the file containing the content.
   * @returns {Promise<string>} - A promise that resolves to the compiled content.
   */
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

  /**
   * Initializes the content by compiling and saving all pages to the database.
   */
  async initializeContent() {
    const contentDir = path.join(process.cwd(), config.contentDirectory);
    const pages = fs.readdirSync(contentDir).filter(file => file.endsWith('.md')).map(file => file.replace('.md', ''));
    
    for (const page of pages) {
      await this.updatePageContent(page);
    }
  }

  /**
   * Updates the content for a specific page by compiling it and saving it to the database.
   * @param {string} page - The name of the page to update.
   */
  async updatePageContent(page: string) {
    const filePath = path.join(process.cwd(), config.contentDirectory, `${page}.md`);
    const compiledContent = await this.compileContent(filePath);
    await this.dbManager.saveCompiledContent(page, compiledContent);
    console.log(`${page} content compiled and saved to database`);
  }

  /**
   * Retrieves the list of pages from the content directory.
   * @returns {string[]} - An array of page names.
   */
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

  /**
   * Retrieves the menu items for the navigation bar.
   * @returns {Array<{ url: string; title: string }>} - An array of menu items.
   */
  getMenu(): { url: string; title: string }[] {
    return this.getPages().map(page => ({
      url: page === config.defaultPage ? '/' : `/${page}`,
      title: page === config.defaultPage ? config.defaultPage : this.capitalizeFirstLetter(page)
    }));
  }

  /**
   * Capitalizes the first letter of a string.
   * @param {string} string - The string to capitalize.
   * @returns {string} - The capitalized string.
   */
  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}