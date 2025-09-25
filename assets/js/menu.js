document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('nav-toggle');
  const body = document.body;

  // set initial state
  const setInitialState = () => {
    if (window.innerWidth >= 768) {
      body.setAttribute('data-menu-open', 'true'); // desktop default open
    } else {
      body.setAttribute('data-menu-open', 'false'); // mobile default closed
    }
  };

  setInitialState();
  window.addEventListener('resize', setInitialState);

  // toggle handler
  toggleBtn.addEventListener('click', () => {
    const isOpen = body.getAttribute('data-menu-open') === 'true';
    body.setAttribute('data-menu-open', String(!isOpen));
  });
});
