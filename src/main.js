import { createSidebar, createContent, createHeader, createMain } from './components/layout.js';
import { setupThemeToggle, setupMenuToggle } from './core/events.js';
import { renderContent } from './core/navigation.js';

function initLayout() {
  const container = document.getElementById('container');
  const sidebar = createSidebar();
  const content = createContent();
  const header = createHeader();
  const mainContainer = createMain();

  container.innerHTML = '';
  container.appendChild(sidebar);
  container.appendChild(content);
  content.appendChild(header);
  content.appendChild(mainContainer);

  return { container, sidebar, content, header, mainContainer };
}

function initApp() {
  const { mainContainer } = initLayout();

  setupThemeToggle();
  setupMenuToggle();
  renderContent(mainContainer);

  window.addEventListener("hashchange", () => renderContent(mainContainer));
}

window.addEventListener("DOMContentLoaded", initApp);
