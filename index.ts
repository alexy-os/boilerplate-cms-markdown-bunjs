import { initializeModules } from './modules';

const { serverManager } = initializeModules();
serverManager.start();