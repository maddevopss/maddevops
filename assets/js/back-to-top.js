const backToTopButton = document.querySelector('#back-to-top');

if (backToTopButton) {
  const updateBackToTopVisibility = () => {
    const shouldBeVisible = window.scrollY > 300;

    backToTopButton.hidden = false;
    backToTopButton.classList.toggle('is-visible', shouldBeVisible);
    backToTopButton.setAttribute('aria-hidden', String(!shouldBeVisible));
  };

  backToTopButton.addEventListener('click', () => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  });

  window.addEventListener('scroll', updateBackToTopVisibility, {
    passive: true,
  });

  updateBackToTopVisibility();
}
