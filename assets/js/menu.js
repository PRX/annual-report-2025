document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('nav-toggle');
  const body = document.body;
  const main = document.getElementById('layout-content');

  // set initial state
  const setInitialState = () => {
    const isMenuOpen = body.dataset.menuOpen === 'true';
    if (isMenuOpen && window.innerWidth < 768) {
      main.setAttribute('inert', ''); // desktop default open
    } else {
      main.removeAttribute('inert'); // mobile default closed
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
    body.setAttribute('data-menu-open', String(!isOpen));
  });
});
