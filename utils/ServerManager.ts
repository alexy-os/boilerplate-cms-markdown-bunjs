import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { ContentManager } from './ContentManager';
import { DatabaseManager } from './DatabaseManager';

/**
 * The ServerManager class is responsible for handling HTTP requests and serving static files.
 */
export class ServerManager {
  private contentManager: ContentManager;
  private dbManager: DatabaseManager;
  private layoutHtml: string;

  /**
   * Constructor for the ServerManager class.
   * @param {ContentManager} contentManager - The ContentManager instance.
   * @param {DatabaseManager} dbManager - The DatabaseManager instance.
   */
  constructor(contentManager: ContentManager, dbManager: DatabaseManager) {
    this.contentManager = contentManager;
    this.dbManager = dbManager;
    this.layoutHtml = fs.readFileSync(path.join(process.cwd(), config.layoutFile), 'utf-8');
  }

  /**
   * Handles static file requests.
   * @param {URL} url - The URL object representing the requested file.
   * @returns {Promise<Response | null>} - A promise that resolves to the Response object if the file exists, or null if it does not.
   */
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

  /**
   * Gets the content type for a given file extension.
   * @param {string} extension - The file extension.
   * @returns {string} - The content type.
   */
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

  /**
   * Handles the incoming request and returns the appropriate response.
   * @param {Request} req - The incoming request.
   * @returns {Promise<Response>} - A promise that resolves to the Response object.
   */
  async handleRequest(req: Request): Promise<Response> {
    const url = new URL(req.url);
    
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

  /**
   * Starts the server on the specified port.
   * @param {number} port - The port number to listen on.
   * @returns {Bun.Server} - The Bun server instance.
   */
  startServer(port: number) {
    return Bun.serve({
      port: port,
      fetch: (req) => this.handleRequest(req),
    });
  }
}