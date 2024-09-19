import { ContentManager } from './utils/ContentManager';
import { DatabaseManager } from './utils/DatabaseManager';
import { TemplateEngine } from './utils/TemplateEngine';
import { ServerManager } from './utils/ServerManager';
import { config } from './config';

async function main() {
  const dbManager = new DatabaseManager();
  const templateEngine = new TemplateEngine();
  const contentManager = new ContentManager(templateEngine, dbManager);
  const serverManager = new ServerManager(contentManager, dbManager);

  await contentManager.initializeContent();

  const server = serverManager.startServer(config.port);
  console.log(`Listening on http://localhost:${server.port}`);
}

main().catch(console.error);