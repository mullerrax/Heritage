/* 
  FRONTEND DATA ADAPTER
  ---------------------
  The demo reads from localStorage so the folder works without a backend.
  When a backend exists, replace loadCatalog() with the fetch example in
  README.md. Keep the same product/story field names and the rest of the UI
  will continue to work.
*/

const HERITAGE_CONFIG = {
  // Use digits only, including country code. Example: "14165551234".
  whatsappNumber: "15551234567",
  apiBaseUrl: "", // Example: "https://api.yourdomain.com"
  social: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
    x: "https://x.com/"
  }
};

const demoProducts = [
  {
    id: "mukluk-black-gold",
    name: "Black + Gold Mukluks",
    category: "footwear",
    categoryLabel: "Handmade footwear",
    price: "Enquire for price",
    status: "Available to discuss",
    description: "A statement pair with soft black fur, pale leather, hand-beaded floral panels and braided ties. Built to be admired, then worn.",
    material: "Black fur, leather, glass beadwork",
    image: "assets/mukluks-detail.jpeg",
    featured: true
  },
  {
    id: "mukluk-snowbird",
    name: "Snowbird Mukluks",
    category: "footwear",
    categoryLabel: "Handmade footwear",
    price: "Enquire for price",
    status: "One pair shown",
    description: "Soft grey and black skinwork with a quiet floral motif. The kind of piece that gets more personal with every winter.",
    material: "Grey skin, black fur, hand-sewn beadwork",
    image: "assets/mukluks-front.jpeg",
    featured: true
  },
  {
    id: "custom-story-piece",
    name: "A Custom Story Piece",
    category: "custom",
    categoryLabel: "Made to order",
    price: "Start a conversation",
    status: "Custom enquiries open",
    description: "Have a family story, a favourite colour or a very specific fit in mind? Custom work begins with a conversation about the wearer.",
    material: "Selected with the maker for the commission",
    image: "assets/mukluks-front.jpeg",
    featured: true
  }
];

const demoStories = [
  { id: "first-cut", index: "01 / MATERIAL", title: "The first cut is a conversation", excerpt: "Before a pattern is drawn, the hide is read for grain, strength and the life it is ready to have next.", tone: "dark" },
  { id: "beadwork", index: "02 / DETAIL", title: "A flower in the cold", excerpt: "Small colour, close to the wearer. Why hand-beaded details keep showing up in the work.", tone: "sand" },
  { id: "care", index: "03 / CARE", title: "Wear it. Air it. Keep it close.", excerpt: "Simple care notes for pieces made from natural materials.", tone: "sage" }
];
const demoReviews = [
  { id: "review-1", name: "Jordan M.", location: "Yellowknife, NT", rating: 5, message: "The care in the stitching is something you can feel the moment you put them on." },
  { id: "review-2", name: "Mara K.", location: "Anchorage, AK", rating: 5, message: "A beautiful piece, and an even better conversation about how it was made." },
  { id: "review-3", name: "T. Williams", location: "Whitehorse, YT", rating: 5, message: "Warm, thoughtful and completely unlike anything you find in a regular store." }
];

let products = [];
let selectedFilter = "all";

function getLocalCatalog() {
  try {
    const saved = JSON.parse(localStorage.getItem("heritageCatalog") || "null");
    return saved && Array.isArray(saved.products)
      ? { products: saved.products, stories: Array.isArray(saved.stories) && saved.stories.length ? saved.stories : demoStories }
      : { products: demoProducts, stories: demoStories };
  } catch {
    return { products: demoProducts, stories: demoStories };
  }
}

function getLocalReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem("heritageReviews") || "null");
    return Array.isArray(saved) && saved.length ? saved : demoReviews;
  } catch {
    return demoReviews;
  }
}

async function loadCatalog() {
  if (HERITAGE_CONFIG.apiBaseUrl) {
    try {
      const response = await fetch(`${HERITAGE_CONFIG.apiBaseUrl}/api/public/catalog`);
      if (response.ok) return await response.json();
    } catch (error) {
      console.warn("API unavailable; showing local demo catalog.", error);
    }
  }
  return getLocalCatalog();
}

function renderProducts() {
  const grid = document.querySelector("#product-grid");
  const count = document.querySelector("#collection-count");
  const visible = products.filter(product => selectedFilter === "all" || product.category === selectedFilter);
  count.textContent = `${String(visible.length).padStart(2, "0")} works shown`;
  if (!visible.length) {
    grid.innerHTML = `<div class="empty-state">No pieces in this category yet. Ask about a custom work instead.</div>`;
    return;
  }
  grid.innerHTML = visible.map((product, index) => `
    <article class="product-card reveal is-visible" data-product-id="${escapeHtml(product.id)}" tabindex="0" role="button" aria-label="View ${escapeHtml(product.name)}">
      <div class="product-image">
        <span class="product-badge">${escapeHtml(product.categoryLabel || product.category)}</span>
        <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" loading="${index ? "lazy" : "eager"}" />
        <span class="product-arrow">↗</span>
      </div>
      <div class="product-info">
        <div class="product-info-top"><h3>${escapeHtml(product.name)}</h3><span class="product-price">${escapeHtml(product.price)}</span></div>
        <p>${escapeHtml(product.material)}</p>
      </div>
    </article>
  `).join("");
  grid.querySelectorAll(".product-card").forEach(card => {
    card.addEventListener("click", () => openProduct(card.dataset.productId));
    card.addEventListener("keydown", event => { if (event.key === "Enter" || event.key === " ") openProduct(card.dataset.productId); });
  });
}

function renderStories(stories) {
  const grid = document.querySelector("#story-grid");
  grid.innerHTML = stories.slice(0, 3).map((story, index) => `
    <article class="story-card reveal is-visible">
      <span class="story-index">${escapeHtml(story.index)}</span>
      <h3>${escapeHtml(story.title)}</h3>
      <p>${escapeHtml(story.excerpt)}</p>
      <a class="story-link" href="#contact">Read the note <span>↗</span></a>
      ${index === 1 ? `<svg class="story-card-decoration" viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M12 75C30 43 37 14 87 23M20 83C47 64 62 37 81 12M27 53c11 1 24 6 31 15M43 35c13 0 25 5 32 14" stroke="#793a2a" stroke-width="1.4"/><circle cx="75" cy="20" r="7" stroke="#793a2a"/></svg>` : "" }
    </article>
  `).join("");
}

function renderReviews(sourceReviews) {
  const reviews = Array.isArray(sourceReviews) && sourceReviews.length ? sourceReviews : getLocalReviews();
  const featured = reviews[0];
  if (!featured) return;
  document.querySelector("#featured-review-text").textContent = `“${featured.message}”`;
  document.querySelector("#featured-review-name").textContent = featured.name;
  document.querySelector("#featured-review-location").textContent = featured.location || "Verified customer";
  document.querySelector("#featured-review-avatar").textContent = initials(featured.name);
  document.querySelector("#review-list").innerHTML = reviews.slice(1, 4).map(review => `
    <article class="review-card">
      <div class="review-stars" aria-label="${review.rating || 5} out of 5 stars">${"★".repeat(Number(review.rating || 5))}<span>${"★".repeat(5 - Number(review.rating || 5))}</span></div>
      <p>“${escapeHtml(review.message)}”</p>
      <strong>${escapeHtml(review.name)}</strong><small>${escapeHtml(review.location || "Verified customer")}</small>
    </article>
  `).join("");
}

function initials(name) {
  return String(name || "LC").trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase();
}

function saveLocalReview(review) {
  const reviews = getLocalReviews();
  localStorage.setItem("heritageReviews", JSON.stringify([...reviews, review]));
}

function openProduct(productId) {
  const product = products.find(item => item.id === productId);
  if (!product) return;
  document.querySelector("#modal-image").src = product.image;
  document.querySelector("#modal-image").alt = product.name;
  document.querySelector("#modal-category").innerHTML = `<span class="eyebrow-line"></span> ${escapeHtml(product.categoryLabel || product.category)}`;
  document.querySelector("#modal-title").textContent = product.name;
  document.querySelector("#modal-price").textContent = product.price;
  document.querySelector("#modal-status").textContent = product.status || "Enquire directly";
  document.querySelector("#modal-description").textContent = product.description;
  document.querySelector("#modal-material").textContent = product.material;
  document.querySelector("#modal-whatsapp").href = whatsappLink(product);
  document.querySelector("#product-modal").hidden = false;
  document.body.classList.add("modal-open");
  document.querySelector(".modal-close").focus();
}

function closeModal() {
  document.querySelector("#product-modal").hidden = true;
  document.body.classList.remove("modal-open");
}

function whatsappLink(product) {
  const text = `Hello, I found "${product ? product.name : "a piece"}" on the Leather & Sealskin website. I would like to ask about ${product ? product.price.toLowerCase() : "availability"}, sizing and shipping.`;
  return `https://wa.me/${HERITAGE_CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}

function init() {
  loadCatalog().then(catalog => {
    products = Array.isArray(catalog.products) ? catalog.products : demoProducts;
    renderProducts();
    renderStories(Array.isArray(catalog.stories) ? catalog.stories : demoStories);
    renderReviews(Array.isArray(catalog.reviews) ? catalog.reviews : undefined);
  });
  document.querySelector("#year").textContent = new Date().getFullYear();
  document.querySelectorAll("[data-filter]").forEach(button => button.addEventListener("click", () => {
    selectedFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderProducts();
  }));
  document.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
  document.querySelector("[data-whatsapp-general]").href = whatsappLink();
  document.querySelector("#review-form").addEventListener("submit", event => {
    event.preventDefault();
    saveLocalReview({
      id: `review-${Date.now()}`,
      name: document.querySelector("#review-name").value.trim(),
      location: document.querySelector("#review-location").value.trim(),
      rating: Number(document.querySelector("#review-rating").value),
      message: document.querySelector("#review-message").value.trim()
    });
    event.target.reset();
    document.querySelector("#review-success").hidden = false;
    renderReviews();
  });
  const menuToggle = document.querySelector(".menu-toggle");
  menuToggle.addEventListener("click", () => {
    const nav = document.querySelector(".main-nav");
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
  });
  document.querySelectorAll(".main-nav a").forEach(link => link.addEventListener("click", () => document.querySelector(".main-nav").classList.remove("open")));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
  }), { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(element => observer.observe(element));
}

init();