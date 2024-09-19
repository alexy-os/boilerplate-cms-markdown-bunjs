import Handlebars from 'handlebars';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

/**
 * The TemplateEngine class is responsible for compiling and rendering templates using Handlebars.
 */
export class TemplateEngine {
  /**
   * Compiles a template with the given context.
   * @param {string} template - The template to compile.
   * @param {Record<string, unknown>} context - The context to use for the template.
   * @returns {string} The compiled template.
   */
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