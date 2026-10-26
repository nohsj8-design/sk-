document.addEventListener('DOMContentLoaded', async () => {
  const feeds = [...document.querySelectorAll('[data-vb-feed]')];
  if (!feeds.length) return;
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  try {
    const response = await fetch('assets/virtual-busan/videos.json?v=1');
    if (!response.ok) throw new Error('Video catalog unavailable');
    const data = await response.json();
    const labels = new Map(data.categories.map(category => [category.id, category.label]));
    for (const feed of feeds) {
      const scope = feed.closest('[data-vb-catalog]');
      let items = data.items.filter(item => /^[A-Za-z0-9_-]{11}$/.test(item.id));
      if (feed.dataset.vbIds) {
        const ids = feed.dataset.vbIds.split(',');
        items = ids.map(id => items.find(item => item.id === id)).filter(Boolean);
      }
      if (feed.dataset.vbLimit) items = items.slice(0, Number(feed.dataset.vbLimit));
      const cards = items.map(item => {
        const card = make('article', 'vb-video');
        card.dataset.vbCategory = item.category;
        const link = make('a', 'vb-video-link');
        link.href = `https://www.youtube.com/${item.format === 'short' ? `shorts/${item.id}` : `watch?v=${item.id}`}`;
        link.target = '_blank'; link.rel = 'noopener noreferrer';
        const visual = make('div', 'vb-video-image');
        const img = make('img');
        img.src = `assets/virtual-busan/${item.id}.jpg`;
        img.alt = ''; img.loading = 'lazy'; img.width = 1280; img.height = 720;
        visual.append(img, make('span', 'vb-video-format', item.format === 'short' ? 'SHORTS' : 'FILM'), make('span', 'vb-play', '↗'));
        const body = make('div', 'vb-video-body');
        body.append(make('span', 'vb-kicker', labels.get(item.category)), make('h3', '', item.title), make('p', '', item.description), make('span', 'vb-watch', 'YouTube에서 보기 ↗'));
        link.append(visual, body); card.append(link); feed.append(card);
        return card;
      });
      feed.querySelector('[data-vb-loading]')?.remove();
      const count = scope?.querySelector('[data-vb-count]');
      if (count) count.textContent = `${cards.length}편의 선정 작품`;
      scope?.querySelectorAll('[data-vb-filter]').forEach(button => {
        button.addEventListener('click', () => {
          scope.querySelectorAll('[data-vb-filter]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
          let visible = 0;
          cards.forEach(card => {
            card.hidden = button.dataset.vbFilter !== 'all' && card.dataset.vbCategory !== button.dataset.vbFilter;
            if (!card.hidden) visible++;
          });
          if (count) count.textContent = `${visible}편의 선정 작품`;
        });
      });
    }
  } catch {
    feeds.forEach(feed => {
      const message = feed.querySelector('[data-vb-loading]');
      if (message) message.textContent = '목록을 불러오지 못했습니다. 버츄얼 부산 YouTube 채널에서 영상을 확인해 주세요.';
    });
  }
});
