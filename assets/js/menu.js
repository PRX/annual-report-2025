document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('nav-toggle');
  const body = document.body;
  const main = document.getElementById('layout-content');
  const navDrawer = document.getElementById('nav-drawer');

  // set initial state
  const setInitialState = () => {
    const isMenuOpen = body.dataset.menuOpen === 'true';
    if (isMenuOpen && window.innerWidth < 768) {
      main.setAttribute('inert', ''); // desktop default open
    } else {
      main.removeAttribute('inert'); // mobile default closed
    }

    // sync ARIA states for accessibility
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', String(isMenuOpen));
    }
    if (navDrawer) {
      navDrawer.setAttribute('aria-hidden', String(!isMenuOpen));
    }
  };

  function handleResize(){
    setInitialState();
  };

  setInitialState();
  window.addEventListener('resize', handleResize);

  // toggle handler
  toggleBtn.addEventListener('click', () => {
    const isOpen = body.getAttribute('data-menu-open') === 'true';
    const newOpen = !isOpen;
    body.setAttribute('data-menu-open', String(newOpen));

    // update ARIA states
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', String(newOpen));
    }
    if (navDrawer) {
      navDrawer.setAttribute('aria-hidden', String(!newOpen));
    }
  });
});
