import { fetchWorks, getQueryParam } from './dataLoader.js';

document.addEventListener('DOMContentLoaded', async () => {
  const workId = getQueryParam('id');
  const containerError = document.getElementById('global-error');

  try {
    const works = await fetchWorks();
    const work = works.find(w => String(w.id) === String(workId));
    if (!work) {
      containerError.textContent = '作品が見つかりません。';
      return;
    }

    document.title = `${work.title} | バニーガール作品データベース`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', work.review_summary || '');
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute('href', `https://bunny-girl.jp/product_detail?id=${encodeURIComponent(work.id)}`);

    render(work);
  } catch (e) {
    console.error(e);
    containerError.textContent = '作品データの取得に失敗しました。';
  }
});

function render(work) {
  setText('current-title', work.title);
  setText('product-title', work.title);
  setText('actress-name', work.actress);
  setText('category', CAT_MAP[work.category] || work.category || '-');
  
  setText('duration', work.duration);
  setText('release-date', work.release_date);

  const img = document.getElementById('main-image');
  if (img) {
    img.src = `/assets/images/${work.image_main || 'placeholder.jpg'}`;
    img.setAttribute('width','1200');
    img.setAttribute('height','675');
    img.onerror = () => { img.onerror = null; img.src = '/assets/images/placeholder.jpg'; };
    img.alt = work.title || '作品画像';
  }

  // Description / Reviews are sanitized to textContent to avoid XSS
  setText('product-summary', work.review_summary || '');
  setText('review', (work.review_detail && work.review_detail['総評']) || '');
  setText('recommendation', (work.review_detail && work.review_detail['衣装の魅力']) || '');

  // Affiliate links
  const buy = document.getElementById('affiliate-buy-link');
  const rental = document.getElementById('affiliate-rental-link');
  if (buy) {
    if (work.affiliate_link_buy) { buy.href = work.affiliate_link_buy; }
    else { buy.style.display = 'none'; }
  }
  if (rental) {
    if (work.affiliate_link_rental) { rental.href = work.affiliate_link_rental; }
    else { rental.style.display = 'none'; }
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || '-';
}


  // --- OGP / Twitter dynamic update ---
  setMeta('og:title', work.title || '作品詳細');
  setMeta('og:description', work.review_summary || '');
  setMeta('og:url', `https://bunny-girl.jp/product_detail?id=${encodeURIComponent(work.id)}`);
  const imgAbs = (work.image_main ? `https://bunny-girl.jp/assets/images/${work.image_main}` : 'https://bunny-girl.jp/assets/images/ogp_default.jpg');
  setMeta('og:image', imgAbs);
  setMeta('twitter:image', imgAbs);

  // --- JSON-LD Product ---
  const productJson = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": work.title || "",
    "description": work.review_summary || "",
    "image": imgAbs,
    "brand": {"@type":"Brand","name":"bunny-girl.jp"},
    "category": work.category || "",
    "aggregateRating": (work.rating ? {
      "@type": "AggregateRating",
      "ratingValue": String(work.rating),
      "reviewCount": String(work.review_count || 0)
    } : undefined),
    "offers": (work.price_sale ? {
      "@type": "Offer",
      "price": String(work.price_sale),
      "priceCurrency": "JPY",
      "availability": "https://schema.org/InStock",
      "url": `https://bunny-girl.jp/product_detail?id=${encodeURIComponent(work.id)}`
    } : undefined)
  };
  const jsonldEl = document.getElementById('product-jsonld') || (() => {
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'product-jsonld';
    document.head.appendChild(el);
    return el;
  })();
  jsonldEl.textContent = JSON.stringify(productJson);

  function setMeta(property, content) {
    let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      if (property.startsWith('og:')) el.setAttribute('property', property);
      else el.setAttribute('name', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }
