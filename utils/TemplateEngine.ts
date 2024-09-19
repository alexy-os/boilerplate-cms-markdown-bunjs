import Handlebars from 'handlebars';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

export class TemplateEngine {
  compile(template: string, context: Record<string, unknown>): string {
    const compiledTemplate = Handlebars.compile(template);
    return compiledTemplate(context);
  }

  // use {{{content}}} in your templates (with triple curly braces)
  render(content: string, data: Record<string, unknown> = {}): string {
    const layoutPath = path.join(process.cwd(), config.layoutFile);
    const layout = fs.readFileSync(layoutPath, 'utf-8');
    
    // Compile the content
    const compiledContent = this.compile(content, data);
    
    // Create a context for the template, including the compiled content
    const context = {
      ...data,
      content: compiledContent
    };
    
    // Compile and render the entire template
    return this.compile(layout, context);
  }
}