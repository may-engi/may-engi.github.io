export async function fetchWorks() {
  const res = await fetch('/assets/data/works.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('作品データの取得に失敗しました');
  const data = await res.json();
  return data.works || [];
}

export function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}
