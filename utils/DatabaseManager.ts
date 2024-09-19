import { open, RootDatabase } from 'lmdb';
import path from 'path';
import { config } from '../config';

/**
 * The DatabaseManager class is responsible for managing the database.
 */
export class DatabaseManager {
  private db: RootDatabase;

  /**
   * Constructor for the DatabaseManager class.
   * Initializes the database with the specified path.
   */
  constructor() {
    const dbPath = path.join(process.cwd(), config.dbDirectory, config.dbFileName);
    this.db = open({
      path: dbPath,
      compression: true,
    });
  }

  /**
   * Saves the compiled content to the database.
   * @param {string} key - The key to save the content under.
   * @param {string} content - The content to save.
   */
  async saveCompiledContent(key: string, content: string) {
    await this.db.put(key, content);
  }

  /**
   * Retrieves the compiled content from the database.
   * @param {string} key - The key to retrieve the content from.
   * @returns {Promise<string | undefined>} - A promise that resolves to the content if found, or undefined if not found.
   */
  async getCompiledContent(key: string): Promise<string | undefined> {
    return await this.db.get(key);
  }

  /**
   * Updates the compiled content in the database if it has changed.
   * @param {string} key - The key to update the content for.
   * @param {string} newContent - The new content to save.
   * @returns {Promise<boolean>} - A promise that resolves to true if the content was updated, or false if it was not.
   */
  async updateIfChanged(key: string, newContent: string): Promise<boolean> {
    const existingContent = await this.getCompiledContent(key);
    if (existingContent !== newContent) {
      await this.saveCompiledContent(key, newContent);
      return true;
    }
    return false;
  }
}