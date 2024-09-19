# Simple Content Management System

This project is a lightweight Content Management System (CMS) built with Bun, a fast all-in-one JavaScript runtime. It features dynamic routing, static file serving, and Markdown content management.

## Project Structure

```
├── content/ # Markdown content files
│ ├── about.md
│ └── home.md
├── public/ # Static assets
│ └── js/
│ └── script.js
├── views/ # HTML templates
│ └── layout.html
├── config.ts # Configuration file
├── index.ts # Main application file
├── package.json # Project dependencies and scripts
```

## Features

- Dynamic routing based on Markdown files
- Static file serving
- Simple and customizable HTML layout
- Configuration options for easy customization

## Installation

To install dependencies, run:

```bash
bun install
```

## Running the Application

To start the application, use:

```bash
bun run index.ts
```

The server will start, and you can access the CMS at `http://localhost:3000` (or the port specified in your configuration).

## Configuration

You can customize the application behavior by modifying the `config.ts` file. This includes setting the port, content directory, and other options.

## Adding Content

To add new pages or blog posts, simply create new Markdown files in the `content/` directory. The routing will automatically pick up these files and create corresponding routes.

## Customization

- Modify the `views/layout.html` file to change the overall structure of your pages.
- Update the `public/js/script.js` file to add custom JavaScript functionality.
- Adjust styles by adding a CSS file in the `public/` directory and linking it in the layout.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)

---

This project was created using `bun init` in Bun v1.1.27. For more information, visit [Bun](https://bun.sh).