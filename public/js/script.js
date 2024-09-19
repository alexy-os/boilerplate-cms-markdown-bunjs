document.addEventListener('DOMContentLoaded', () => {
  const contentElement = document.getElementById('content');
  const menuElement = document.getElementById('menu');

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
      
      if (contentElement) {
        contentElement.innerHTML = data.content;
      }
      
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

  document.body.addEventListener('click', (event) => {
    const target = event.target;
    if (target.tagName === 'A' && target.getAttribute('href')) {
      event.preventDefault();
      const url = target.getAttribute('href');
      loadPage(url);
    }
  });

  // Load initial page
  loadPage(window.location.pathname);
});