document.querySelectorAll('[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.content-card.is-hidden video').forEach(video => video.pause());
  });
});
