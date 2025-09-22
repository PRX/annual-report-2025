document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav-drawer');
  const content = document.getElementById('layout-content');
  const toggleBtn = document.getElementById('nav-toggle');

  // Function to check if we're on mobile
  const isMobile = () => window.innerWidth < 768;

  // Function to set initial state based on screen size
  const setInitialState = () => {
    if (isMobile()) {
      // On mobile, nav should be collapsed by default
      nav.classList.add('collapsed');
      nav.classList.remove('expanded');
      content.classList.add('collapsed');
      content.classList.remove('expanded');
    } else {
      // On desktop, nav should be expanded by default
      nav.classList.add('expanded');
      nav.classList.remove('collapsed');
      content.classList.add('expanded');
      content.classList.remove('collapsed');
    }
  };

  // Set initial state on load
  setInitialState();

  // Handle window resize
  window.addEventListener('resize', () => {
    setInitialState();
  });

  // Toggle functionality - works on all screen sizes
  toggleBtn.addEventListener('click', () => {
    nav.classList.toggle('collapsed');
    nav.classList.toggle('expanded');

    content.classList.toggle('collapsed');
    content.classList.toggle('expanded');
  });
});
