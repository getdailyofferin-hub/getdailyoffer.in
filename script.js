// script.js - Updated to load from Supabase
const resultsEl = document.getElementById('results');
const emptyEl = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');

let allOffers = [];

// Load offers from Supabase
async function loadOffers() {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    allOffers = data || [];
    render(allOffers);
  } catch (error) {
    console.error('Error loading offers:', error);
    emptyEl.textContent = 'Error loading offers. Please refresh the page.';
    emptyEl.style.display = 'block';
  }
}

function showMap(mapUrl) {
  document.getElementById("mapModal").style.display = "block";
  document.getElementById("mapFrame").src = mapUrl;
}

function closeMap() {
  document.getElementById("mapModal").style.display = "none";
  document.getElementById("mapFrame").src = "";
}
function render(list) {
  resultsEl.innerHTML = '';
  if (!list.length) {
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';

  list.forEach(o => {
    resultsEl.innerHTML += ` 
      <article class="card">
        <img src="${o.image_link}" alt="${o.offer_title}">
        <div class="body">
          <div class="meta">
            <div class="shop">${o.shop_name}</div>
            <div class="tag">${o.category}</div>
          </div>
          <h3 class="offer-title">${o.offer_title}</h3>
          <div class="row">
            <div class="price">${o.price}</div>
            <img src="assets/icons8-google-maps.svg" class="loc-icon" onclick="showMap('${o.map_link}')" alt="Map">
          </div>
          <div class="cta">
            <button class="btn get" onclick="claim('${o.image_link}', '${encodeURIComponent(o.description)}')">Get details</button>
          </div>
        </div>
      </article>`;
  });

  // ✅ Add this line at the end:
  attachCardAnimations();
}


// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.setAttribute('data-active', 'false'));
    btn.setAttribute('data-active', 'true');
    const cat = btn.dataset.category;
    applyFilters(cat, searchInput.value);
  });
});

searchInput.addEventListener('input', e => {
  const active = document.querySelector('.filter-btn[data-active="true"]').dataset.category;
  applyFilters(active, e.target.value);
});

function applyFilters(category, q) {
  q = (q || '').toLowerCase();
  let filtered = allOffers.filter(o => {
    const inCat = category === 'all' ? true : o.category === category;
    const inQ = !q || (o.offer_title + o.shop_name).toLowerCase().includes(q);
    return inCat && inQ;
  });
  render(filtered);
}

// Modal logic
function claim(imgUrl, description) {
  document.getElementById("imgModal").style.display = "block";
  document.getElementById("modalImage").src = imgUrl;
  document.getElementById("modalDescription").innerText = decodeURIComponent(description) || "No description available.";
}

function closeModal() {
  document.getElementById("imgModal").style.display = "none";
}

// Load offers on page load
loadOffers();

// ---- Intersection Observer Setup ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${index * 0.1}s`; // staggered
      entry.target.classList.add('animate');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 }); // Trigger when 20% visible

// ---- Attach observer after rendering ----
function attachCardAnimations() {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => observer.observe(card));
}
