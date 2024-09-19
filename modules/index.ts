import { ContentManager } from './ContentManager';
import { ServerManager } from './ServerManager';
import { config } from '../config';

export { ContentManager, ServerManager };

export function initializeModules() {
  const { options } = config;
  
  const contentManager = new ContentManager(options[0]);
  const serverManager = new ServerManager(contentManager);

  return { contentManager, serverManager };
}