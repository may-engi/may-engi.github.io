import { fetchWorks } from './dataLoader.js';

let allWorks = [];

document.addEventListener('DOMContentLoaded', async () => {
  setupAgeGate();
  await init();
});

async function init() {
  try {
    allWorks = await fetchWorks();
    displayWorks(allWorks);
  } catch (e) {
    console.error(e);
    const grid = document.getElementById('works-grid');
    if (grid) grid.innerHTML = '<p>作品データの読み込みに失敗しました。</p>';
  }
}

function displayWorks(works) {
  const grid = document.getElementById('works-grid');
  if (!grid) return;

  if (works.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>作品が見つかりませんでした。</p></div>';
    return;
  }

  const html = works.map(work => createWorkCard(work)).join('');
  grid.innerHTML = html;
}

function createWorkCard(work) {
  const img = 'assets/img/placeholder.jpg';
  return `
    <article class="product-card">
      <div class="product-image">
        <a href="./product_detail.html?id=${encodeURIComponent(work.id)}">
          <img src="${img}" alt="${work.title || '作品'}"
            loading="lazy" width="1200" height="675"
            onerror="this.onerror=null;this.src='assets/img/placeholder.jpg'">
        </a>
      </div>
      <div class="product-info">
        <h3 class="product-title">${work.title || ''}</h3>
        <div class="actress-name">${work.actress || ''}</div>
      </div>
    </article>
  `;
}

function setupAgeGate() {
  const modal = document.getElementById('age-verification-modal');
  const ok = document.getElementById('confirm-age-btn');
  const ng = document.getElementById('deny-age-btn');
  const verified = localStorage.getItem('ageVerified');

  if (!modal || !ok || !ng) return;

  if (!verified) {
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
  } else {
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  }

  ok.addEventListener('click', () => {
    localStorage.setItem('ageVerified', 'true');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
  });

  ng.addEventListener('click', () => {
    window.location.href = 'denied.html';
  });
}
