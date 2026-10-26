document.addEventListener('DOMContentLoaded', () => {
  const frame = document.getElementById('sns-dashboard-frame');
  const status = document.getElementById('sns-dashboard-status');
  const refresh = document.getElementById('sns-dashboard-refresh');
  if (!frame || !status || !refresh) return;
  let revision = null;
  let checking = false;
  const dateFormat = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', dateStyle: 'medium', timeStyle: 'short' });
  async function check(force = false) {
    if (checking) return;
    checking = true;
    try {
      const response = await fetch(`sns-dashboard/version.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error('Publication unavailable');
      const data = await response.json();
      if (!/^[a-f0-9]{64}$/.test(data.revision)) throw new Error('Invalid revision');
      if (revision !== data.revision || force) frame.src = `sns-dashboard/index.html?rev=${data.revision}${force ? `&t=${Date.now()}` : ''}`;
      revision = data.revision;
      const collected = new Date(data.updatedAt);
      status.textContent = data.updatedAt && Number.isFinite(collected.getTime()) ? `최근 수집 · ${dateFormat.format(collected)} (한국시간)` : '수집된 최신 배포본을 표시합니다.';
    } catch {
      status.textContent = '최신 배포 확인이 지연되고 있습니다. 아래 대시보드를 확인하거나 잠시 후 새로고침해 주세요.';
    } finally {
      checking = false;
    }
  }
  window.addEventListener('message', event => {
    if (event.source !== frame.contentWindow || event.data?.type !== '771-sns-dashboard-height') return;
    const height = event.data.height;
    if (Number.isFinite(height) && height >= 300 && height <= 20000) frame.style.height = `${Math.ceil(height) + 4}px`;
  });
  refresh.addEventListener('click', () => check(true));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) check(); });
  setInterval(() => { if (!document.hidden) check(); }, 60000);
  check();
});
