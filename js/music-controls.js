(() => {
  const audio = document.getElementById('mainAudio');
  const controls = document.createElement('div');
  controls.className = 'music-controls';
  controls.innerHTML = '<button type="button" aria-label="재생">▶</button><input type="range" min="0" max="100" value="0" step="0.1" aria-label="재생 위치"><span class="music-time">0:00 / 0:00</span>';
  audio.insertAdjacentElement('afterend', controls);
  audio.removeAttribute('controls');
  audio.hidden = true;
  const button = controls.querySelector('button');
  const seek = controls.querySelector('input');
  const time = controls.querySelector('span');
  const charm = document.querySelector('.record-charm');
  document.querySelectorAll('[data-cover-track]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      const row = document.querySelector('[data-track="' + trigger.dataset.coverTrack + '"]');
      if (!row) return;
      if (row.getAttribute('aria-pressed') !== 'true') row.click();
      else if (audio.paused) audio.play().catch(() => { document.getElementById('playerStatus').textContent = '재생하지 못했습니다. 다시 시도해주세요.'; });
    });
  });
  audio.addEventListener('play', () => {
    if (!charm || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    charm.classList.remove('charm-swing');
    void charm.offsetWidth;
    charm.classList.add('charm-swing');
  });
  if (charm) charm.addEventListener('animationend', () => charm.classList.remove('charm-swing'));
  const format = value => { const seconds = Math.max(0, Math.floor(value || 0)); return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2,'0'); };
  const update = () => {
    const playing = !audio.paused && !audio.ended;
    button.textContent = playing ? 'Ⅱ' : '▶';
    button.setAttribute('aria-label', playing ? '일시정지' : '재생');
    document.getElementById('playState').textContent = playing ? 'NOW PLAYING' : 'SELECTED';
    const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
    seek.disabled = !duration;
    seek.value = duration ? audio.currentTime / duration * 100 : 0;
    seek.setAttribute('aria-valuetext', format(audio.currentTime) + ' / ' + format(duration));
    time.textContent = format(audio.currentTime) + ' / ' + format(duration);
  };
  button.addEventListener('click', () => { if(audio.paused) audio.play().catch(() => { document.getElementById('playerStatus').textContent = '재생하지 못했습니다. 다시 시도해주세요.'; }); else audio.pause(); });
  seek.addEventListener('input', () => { if(Number.isFinite(audio.duration)) audio.currentTime = Number(seek.value) / 100 * audio.duration; });
  ['play','pause','ended','timeupdate','loadedmetadata','emptied'].forEach(event => audio.addEventListener(event, update));
  const top = document.querySelector('.return-top');
  const scroll = () => { const visible = window.scrollY > window.innerHeight; top.classList.toggle('is-visible',visible); top.tabIndex = visible ? 0 : -1; };
  window.addEventListener('scroll',scroll,{passive:true});
  update(); scroll();
})();
