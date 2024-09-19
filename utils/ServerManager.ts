import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { ContentManager } from './ContentManager';
import { DatabaseManager } from './DatabaseManager';

export class ServerManager {
  private contentManager: ContentManager;
  private dbManager: DatabaseManager;
  private layoutHtml: string;

  constructor(contentManager: ContentManager, dbManager: DatabaseManager) {
    this.contentManager = contentManager;
    this.dbManager = dbManager;
    this.layoutHtml = fs.readFileSync(path.join(process.cwd(), config.layoutFile), 'utf-8');
  }

  private async handleStaticFile(url: URL): Promise<Response | null> {
    const publicPath = path.join(process.cwd(), config.publicDirectory);
    const filePath = path.join(publicPath, url.pathname);

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      try {
        const content = await fs.promises.readFile(filePath);
        const contentType = this.getContentType(path.extname(filePath));
        return new Response(content, {
          headers: { 'Content-Type': contentType },
        });
      } catch (error) {
        console.error(`Error reading file: ${filePath}`, error);
      }
    }
    return null;
  }

  private getContentType(extension: string): string {
    const contentTypes: { [key: string]: string } = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };
    return contentTypes[extension] || 'application/octet-stream';
  }

  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
    // Обработка статических файлов
    const staticResponse = await this.handleStaticFile(url);
    if (staticResponse) return staticResponse;
    
    const pages = this.contentManager.getPages();
    
    let page = url.pathname.slice(1);
    if (url.pathname === '/') {
      page = config.defaultPage;
    }
    
    if (pages.includes(page)) {
      const content = await this.dbManager.getCompiledContent(page);
      
      if (!content) {
        return new Response('Content not found', { status: 404 });
      }
      
      const menu = this.contentManager.getMenu();
      
      if (req.headers.get('X-Requested-With') === 'XMLHttpRequest') {
        return new Response(JSON.stringify({ content, menu }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(this.layoutHtml, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }

  startServer(port: number) {
    return Bun.serve({
      port: port,
      fetch: (req) => this.handleRequest(req),
    });
  }
}