import { open, RootDatabase } from 'lmdb';
import path from 'path';
import { config } from '../config';

export class DatabaseManager {
  private db: RootDatabase;

  constructor() {
    const dbPath = path.join(process.cwd(), config.dbDirectory, config.dbFileName);
    this.db = open({
      path: dbPath,
      compression: true,
    });
  }

  async saveCompiledContent(key: string, content: string) {
    await this.db.put(key, content);
  }

  async getCompiledContent(key: string): Promise<string | undefined> {
    return await this.db.get(key);
  }

  async updateIfChanged(key: string, newContent: string): Promise<boolean> {
    const existingContent = await this.getCompiledContent(key);
    if (existingContent !== newContent) {
      await this.saveCompiledContent(key, newContent);
      return true;
    }
    return false;
  }
}