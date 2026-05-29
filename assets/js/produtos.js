const API_BASE = window.API_BASE || '';
const API_FALLBACK = window.API_FALLBACK || '';

function formatCurrency(value) {
  return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
}

function createProductCard(product) {
  const item = document.createElement('div');
  item.className = 'product-item';
  item.innerHTML = `
    <a href="product.html">
      <div class="product-photo">
        <img src="${product.imagem || product.image || 'assets/images/products/camiseta-css.png'}" alt="${product.nome || product.name}" />
      </div>
      <div class="product-name">${product.nome || product.name || 'Produto sem nome'}</div>
      <div class="product-price">${formatCurrency(product.preco || product.price || 0)}</div>
      <div class="product-info">${product.descricao || product.description || 'Sem descrição'}</div>
    </a>
    <div class="product-fav">
      <img src="assets/images/ui/heart-3-line.png" alt="favorito" />
    </div>
  `;
  return item;
}

function renderProductsList(products) {
  const grid = document.getElementById('product-grid');
  const countElement = document.querySelector('.product-qt span');
  grid.innerHTML = '';

  if (!products || products.length === 0) {
    grid.innerHTML = '<div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">Nenhum produto cadastrado ainda.</div>';
    if (countElement) countElement.textContent = '0';
    return;
  }

  products.forEach((product) => {
    grid.appendChild(createProductCard(product));
  });
  if (countElement) countElement.textContent = products.length.toString();
}

async function fetchProducts() {
  if (!API_BASE) return loadLocalProducts();
  const baseUrls = [API_BASE];
  if (API_FALLBACK) baseUrls.push(API_FALLBACK);
  let lastError;

  for (const base of baseUrls) {
    const url = base.replace(/\/$/, '') + '/produtos';
    try {
      const res = await fetch(url, { method: 'GET', mode: 'cors' });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        lastError = data || new Error(`Erro ${res.status}`);
        console.warn('[produtos] fetch failed:', url, lastError);
        continue;
      }
      return data;
    } catch (err) {
      lastError = err;
      console.warn('[produtos] network error:', url, err);
    }
  }

  console.warn('[produtos] usando fallback local', lastError);
  return loadLocalProducts();
}

function loadLocalProducts() {
  return JSON.parse(localStorage.getItem('b7store_products') || '[]');
}

function saveLocalProduct(product) {
  const products = loadLocalProducts();
  products.push(product);
  localStorage.setItem('b7store_products', JSON.stringify(products));
  return products;
}

let infoShown = '';
let infoButtons = document.querySelectorAll('.top-button');
let orderArea = document.querySelector('.order-area');
let filtersArea = document.querySelector('.products .filters');

infoButtons.forEach((item) => {
  item.addEventListener('click', () => {
    let name = item.getAttribute('data-name');
    if (name === infoShown) {
      infoShown = '';
    } else {
      infoShown = name;
    }
    renderInfo();
  });
});

function renderInfo() {
  orderArea.style.display = 'none';
  filtersArea.style.display = 'none';

  switch (infoShown) {
    case 'order':
      orderArea.style.display = 'block';
      break;
    case 'filter':
      filtersArea.style.display = 'block';
      break;
  }
}

// AREA DO FILTRO
let filterIcons = document.querySelectorAll('.filter-icon');
filterIcons.forEach((item) => {
  item.addEventListener('click', () => {
    let body = item.closest('.filter').querySelector('.filter-body');
    if (body.style.display === 'none') {
      body.style.display = 'block';
    } else {
      body.style.display = 'none';
    }
  });
});

window.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();
  renderProductsList(products);
});