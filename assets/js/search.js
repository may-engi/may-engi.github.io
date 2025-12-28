import { fetchWorks } from './dataLoader.js';

let allWorks = [];
let filteredWorks = [];
let currentPage = 1;
const worksPerPage = 12;
const CAT_MAP = { 'reverse-bunny':'逆バニー', 'classic-bunny':'正統派バニー', 'vr-bunny':'VR', 'maid-bunny':'メイドバニー' };

document.addEventListener('DOMContentLoaded', async () => {
  setupAgeGate();
  await init();
  setupEvents();
});

async function init() {
  try {
    allWorks = await fetchWorks();
    filteredWorks = [...allWorks];
    displayWorks();
    // updateResultsCount();
  } catch (e) {
    console.error(e);
    document.getElementById('works-grid').innerHTML = '<p>作品データの読み込みに失敗しました。</p>';
  }
}

function setupEvents() {
  document.getElementById('search-btn').addEventListener('click', applySortAndFilter);
  document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') applySortAndFilter();
  });
  document.getElementById('sort-select').addEventListener('change', applySortAndFilter);

  document.querySelectorAll('.category-filter').forEach(cb => {
    cb.addEventListener('change', applySortAndFilter);
  });

  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; displayWorks(); }
  });
  document.getElementById('next-page').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredWorks.length / worksPerPage);
    if (currentPage < totalPages) { currentPage++; displayWorks(); }
  });
}

function applySortAndFilter() {
  const searchTerm = (document.getElementById('search-input').value || '').toLowerCase();
  const sortBy = document.getElementById('sort-select').value;
  const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);

  filteredWorks = allWorks.filter(work => {
    const matchesSearch = !searchTerm
      || work.title?.toLowerCase().includes(searchTerm)
      || work.actress?.toLowerCase().includes(searchTerm);

    const matchesCategory = selectedCategories.length === 0
      || selectedCategories.some(cat => (work.category || '').toLowerCase().includes(cat));

    return matchesSearch && matchesCategory;
  });

  switch (sortBy) {
    case 'popular':
      filteredWorks.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'title':
      filteredWorks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'new':
    default:
      filteredWorks.sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
      break;
  }
  currentPage = 1;
  displayWorks();
  // updateResultsCount();
}

function displayWorks() {
  const grid = document.getElementById('works-grid');
  const start = (currentPage - 1) * worksPerPage;
  const end = start + worksPerPage;
  const slice = filteredWorks.slice(start, end);

  if (slice.length === 0) {
    grid.innerHTML = '<div class="no-results"><p>条件に一致する作品が見つかりませんでした。</p></div>';
    return;
  }

  const html = slice.map(work => createWorkCard(work)).join('');
  grid.innerHTML = html;
}

function createWorkCard(work) {
  const img = '/assets/img/placeholder.jpg'; // 実際の画像ファイルがリポジトリにないため、プレースホルダーを表示します
  const id = encodeURIComponent(work.id);
  const ratingStars = '★'.repeat(Math.floor(work.rating || 0));

  return `
    <article class="product-card">
      <div class="product-image">
        <a href="product_detail.html?id=${work.id}"><img src="${img}" alt="${[work.title, work.actress].filter(Boolean).join(' | ') || '作品'}" loading="lazy" width="1200" height="675" onerror="this.onerror=null;this.src='/assets/img/placeholder.jpg'"></a>
      </div>
      <div class="product-info">
        <h3 class="product-title">${work.title || ''}</h3>
        <div class="actress-name">${work.actress || ''}</div>
        <div class="product-meta">
          <span class="bunny-type">${work.category || ''}</span>
          
        </div>
      </div>
    </article>
  `;
}

function updateResultsCount() {
  const el = document.getElementById('results-count');
  el.textContent = `検索結果: ${filteredWorks.length}件`;
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
    window.location.href = '/denied.html';
  });
}
