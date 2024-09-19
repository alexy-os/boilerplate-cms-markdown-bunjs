document.addEventListener('DOMContentLoaded', () => {
  const contentElement = document.getElementById('content');
  const menuElement = document.getElementById('menu');

  /**
   * Loads the page content from the server and updates the DOM.
   * @param {string} url - The URL of the page to load.
   */
  async function loadPage(url) {
    try {
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.ok) {
        throw new Error('Page not found');
      }

      const data = await response.json();
      
      // Update the content element with the page content.
      if (contentElement) {
        contentElement.innerHTML = data.content;
      }

      // Update the menu element with the menu items.
      if (menuElement) {
        const menuHtml = data.menu.map(item => 
          `<li><a href="${item.url}">${item.title}</a></li>`
        ).join('');
        menuElement.innerHTML = menuHtml;
      }

      history.pushState(null, '', url);
    } catch (error) {
      console.error('Error loading page:', error);
    }
  }

  /**
   * Handles click events on menu items.
   * @param {Event} event - The click event object.
   */
  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A' && target.getAttribute('href')) {
      event.preventDefault();
      const url = target.getAttribute('href');
      loadPage(url);
    }
  });

  /**
   * Loads the initial page when the document is ready.
   */
  loadPage(window.location.pathname);
});