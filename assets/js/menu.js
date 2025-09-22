document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-drawer');
  const content = document.getElementById('layout-content');
  const toggleBtn = document.getElementById('nav-toggle');

  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('collapsed');
    nav.classList.toggle('expanded');

    content.classList.toggle('collapsed');
    content.classList.toggle('expanded');
  });
});
