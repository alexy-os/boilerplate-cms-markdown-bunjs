import { ContentManager } from './utils/ContentManager';
import { DatabaseManager } from './utils/DatabaseManager';
import { TemplateEngine } from './utils/TemplateEngine';
import { ServerManager } from './utils/ServerManager';
import { config } from './config';

/**
 * The main function the application.
 * 
 * Initializes the database, template engine, content manager, and server manager.
 * Start the server and log the listening port to the console.
 */
async function main() {
  
  const dbManager = new DatabaseManager();
  const templateEngine = new TemplateEngine();
  const contentManager = new ContentManager(templateEngine, dbManager);
  const serverManager = new ServerManager(contentManager, dbManager);

  // Initialize the content
  await contentManager.initializeContent();

  // Start the server on the configured port
  const server = serverManager.startServer(config.port);
  console.log(`Listening on http://localhost:${server.port}`);
}

// Call the main function and catch any errors that might occur
main().catch(console.error);