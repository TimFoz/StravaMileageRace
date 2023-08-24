'use strict';


const overlay = document.querySelector('.modal');
const milestone_message_h1 = document.querySelector('.milestone-message');

// Figure out who just broke a milestone
const users_broken_2000 = users.filter(user => (user.mileage / 1609.344) > 2000 & (user.mileage / 1609.344) < 2025).map(user => user.first_name);
const users_broken_3000 = users.filter(user => (user.mileage / 1609.344) > 3000 & (user.mileage / 1609.344)).map(user => user.first_name);
// Let's flash the message for whoever has broken the greatest milestone
const users_broken = users_broken_3000.length ? users_broken_3000 : users_broken_2000
const milestone_message = users_broken.length ?
  `🥳 ${users_broken.join(" & ")} ${users_broken.length > 1 ? "have" : "has"} broken ${users_broken_3000.length ? 3000 : 2000} miles!!! 🥳`
  : undefined

if (milestone_message) {
  //show modal window
  overlay.classList.add('is-active')
  console.log(milestone_message)
  milestone_message_h1.innerHTML = milestone_message

  // TODO - move this mess out and import as a neat "fire_confetti" function
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


  setTimeout(function () {
    overlay.classList.remove('is-active');
  }, 15000); // 15 seconds in milliseconds
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