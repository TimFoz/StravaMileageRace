'use strict';


let overlay = document.querySelector('.modal');
let broken_2000 = users.filter(user => (user.mileage / 1609.344) > 2000 & (user.mileage / 1609.344) < 2025).map(user => user.first_name);
let broken_3000 = users.filter(user => (user.mileage / 1609.344) > 3000 & (user.mileage / 1609.344)).map(user => user.first_name);

if (broken_2000.length) {
  overlay.classList.add('is-active')
  const duration = 15 * 1000,
    animationEnd = Date.now() + duration,
    defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 500);

  // TODO - This is all a bit hacky, better to add a class to the overlay, or destroy it entirely
  setTimeout(function () {
    overlay.classList.remove('is-active');
  }, 15000); // 20 seconds in milliseconds
}
else {
  overlay.classList.remove('is-active');
}

document.addEventListener('DOMContentLoaded', () => {
  function closeModal($el) {
    $el.classList.remove('is-active');
  }

  const modal = document.querySelector('.modal');
  const modal_bg = document.querySelector('.modal-background');

  modal_bg.addEventListener('click', () => {
    closeModal(modal);
  });

});