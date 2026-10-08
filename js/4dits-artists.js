(() => {
  'use strict';
  const names = ['구태양','장건우','표성호','윤승호'];
  const english = ['TAEYANG','GEONWOO','SEONGHO','SEUNGHO'];
  const photos = ['taeyang-studio.webp','geonwoo-cobalt.webp','seongho-rooftop.webp','seungho-coast.webp'];
  const moods = ['네이비와 크림, 자연스러운 온기의 스튜디오 컷.','코발트 재킷과 실버 체인, 무대의 빛을 담은 포즈.','브라운 재킷과 푸른 하늘, 도시의 저녁을 담은 장면.','블랙 실루엣과 푸른 바다, 황혼의 해변에서.'];
  const labels = ['STUDIO','COBALT','BLUE HOUR','COAST'];
  const base = 'assets/4-dits-771/';
  document.querySelectorAll('[data-member]').forEach(button => button.addEventListener('click', () => {
    const i = Number(button.dataset.member);
    document.querySelectorAll('.member-tabs button').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.member) === i)));
    const pose = document.getElementById('memberPose');
    pose.src = base + photos[i]; pose.alt = names[i] + ' ' + labels[i] + ' 화보';
    const portrait = document.getElementById('memberPortrait');
    portrait.src = base + 'member-v2-' + (i+1) + '.png'; portrait.alt = names[i] + ' 클로즈업';
    document.getElementById('memberName').textContent = names[i];
    document.getElementById('memberEnglish').textContent = english[i];
    document.getElementById('memberMood').textContent = moods[i];
    document.getElementById('memberCaption').textContent = labels[i] + ' / ' + names[i];
    if (button.classList.contains('artist-panel')) document.getElementById('members').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  }));
  const dialog = document.querySelector('.artist-lightbox');
  let opener;
  document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click', () => {
    opener = button;
    const image = button.querySelector('img');
    dialog.querySelector('img').src = image.src;
    dialog.querySelector('img').alt = image.alt;
    dialog.querySelector('p').textContent = image.alt;
    dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { if(opener) opener.focus(); });
})();
