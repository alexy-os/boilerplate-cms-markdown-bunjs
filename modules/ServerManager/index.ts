import fs from 'fs';
import path from 'path';
import { ContentManager } from '../ContentManager';
import { config } from '../../config';

export class ServerManager {
  private contentManager: ContentManager;
  private layoutHtml: string;

  constructor(contentManager: ContentManager) {
    this.contentManager = contentManager;
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
    
    const staticResponse = await this.handleStaticFile(url);
    if (staticResponse) return staticResponse;
    
    let pageName = url.pathname.slice(1) || config.defaultPage;
    
    try {
      const content = await this.contentManager.getContent(pageName);
      const menu = this.contentManager.getMenu();
      
      if (req.headers.get('X-Requested-With') === 'XMLHttpRequest') {
        return new Response(JSON.stringify({ content, menu }), {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        const fullHtml = this.layoutHtml.replace('{{content}}', content);
        return new Response(fullHtml, {
          headers: { 'Content-Type': 'text/html' },
        });
      }
    } catch (error) {
      console.error(`Error handling request for page ${pageName}:`, error);
      return new Response('Not Found', { status: 404 });
    }
  }

  start() {
    Bun.serve({
      port: config.port,
      fetch: (req) => this.handleRequest(req),
    });
    console.log(`Server is running on port ${config.port}`);
  }
}