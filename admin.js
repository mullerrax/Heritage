const demoAdminProducts = [
  { id: "mukluk-black-gold", name: "Black + Gold Mukluks", category: "footwear", categoryLabel: "Handmade footwear", price: "Enquire for price", status: "Available to discuss", description: "A statement pair with soft black fur, pale leather, hand-beaded floral panels and braided ties. Built to be admired, then worn.", material: "Black fur, leather, glass beadwork", image: "assets/mukluks-detail.jpeg", featured: true },
  { id: "mukluk-snowbird", name: "Snowbird Mukluks", category: "footwear", categoryLabel: "Handmade footwear", price: "Enquire for price", status: "One pair shown", description: "Soft grey and black skinwork with a quiet floral motif. The kind of piece that gets more personal with every winter.", material: "Grey skin, black fur, hand-sewn beadwork", image: "assets/mukluks-front.jpeg", featured: true },
  { id: "custom-story-piece", name: "A Custom Story Piece", category: "custom", categoryLabel: "Made to order", price: "Start a conversation", status: "Custom enquiries open", description: "Have a family story, a favourite colour or a very specific fit in mind? Custom work begins with a conversation about the wearer.", material: "Selected with the maker for the commission", image: "assets/mukluks-front.jpeg", featured: true }
];
const demoAdminStories = [
  { id: "first-cut", index: "01 / MATERIAL", title: "The first cut is a conversation", excerpt: "Before a pattern is drawn, the hide is read for grain, strength and the life it is ready to have next.", tone: "dark" },
  { id: "beadwork", index: "02 / DETAIL", title: "A flower in the cold", excerpt: "Small colour, close to the wearer. Why hand-beaded details keep showing up in the work.", tone: "sand" },
  { id: "care", index: "03 / CARE", title: "Wear it. Air it. Keep it close.", excerpt: "Simple care notes for pieces made from natural materials.", tone: "sage" }
];

function readProducts() {
  try {
    const catalog = JSON.parse(localStorage.getItem("heritageCatalog") || "null");
    return catalog && Array.isArray(catalog.products) ? catalog.products : demoAdminProducts;
  } catch { return demoAdminProducts; }
}
function readCatalog() {
  try {
    const catalog = JSON.parse(localStorage.getItem("heritageCatalog") || "null");
    return catalog && Array.isArray(catalog.products)
      ? { products: catalog.products, stories: Array.isArray(catalog.stories) && catalog.stories.length ? catalog.stories : demoAdminStories }
      : { products: demoAdminProducts, stories: demoAdminStories };
  } catch { return { products: demoAdminProducts, stories: demoAdminStories }; }
}
function saveProducts(products) {
  const existing = readCatalog();
  localStorage.setItem("heritageCatalog", JSON.stringify({ ...existing, products }));
}
function saveStories(stories) {
  const existing = readCatalog();
  localStorage.setItem("heritageCatalog", JSON.stringify({ ...existing, stories }));
}
function renderAdmin() {
  const { products, stories } = readCatalog();
  document.querySelector("#admin-list").innerHTML = products.map(product => `
    <div class="admin-item">
      <img src="${safe(product.image)}" alt="" />
      <div><h3>${safe(product.name)}</h3><p>${safe(product.category)} · ${safe(product.price)}</p></div>
      <button type="button" data-remove="${safe(product.id)}">Remove</button>
    </div>
  `).join("");
  document.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => {
    saveProducts(readProducts().filter(item => item.id !== button.dataset.remove));
    renderAdmin();
  }));
  document.querySelector("#story-list").innerHTML = stories.map(story => `
    <div class="admin-item">
      <div><h3>${safe(story.title)}</h3><p>${safe(story.index)} · ${safe(story.excerpt)}</p></div>
      <button type="button" data-remove-story="${safe(story.id)}">Remove</button>
    </div>
  `).join("");
  document.querySelectorAll("[data-remove-story]").forEach(button => button.addEventListener("click", () => {
    saveStories(readCatalog().stories.filter(item => item.id !== button.dataset.removeStory));
    renderAdmin();
  }));
}
function safe(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
}
document.querySelector("#product-form").addEventListener("submit", event => {
  event.preventDefault();
  const file = document.querySelector("#image-file").files[0];
  const saveProduct = image => {
    const product = {
      id: `local-${Date.now()}`,
      name: document.querySelector("#name").value,
      category: document.querySelector("#category").value,
      categoryLabel: document.querySelector("#category").selectedOptions[0].textContent,
      price: document.querySelector("#price").value,
      status: "Available to discuss",
      material: document.querySelector("#material").value,
      image,
      description: document.querySelector("#description").value
    };
    saveProducts([...readProducts(), product]);
    event.target.reset();
    document.querySelector("#image").value = "assets/mukluks-front.jpeg";
    renderAdmin();
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };
  if (file) {
    const reader = new FileReader();
    reader.addEventListener("load", () => saveProduct(reader.result));
    reader.readAsDataURL(file);
  } else {
    saveProduct(document.querySelector("#image").value);
  }
});
document.querySelector("#story-form").addEventListener("submit", event => {
  event.preventDefault();
  const story = {
    id: `local-story-${Date.now()}`,
    index: document.querySelector("#story-index").value,
    title: document.querySelector("#story-title").value,
    excerpt: document.querySelector("#story-excerpt").value,
    tone: "sand"
  };
  saveStories([...readCatalog().stories, story]);
  event.target.reset();
  renderAdmin();
});
document.querySelector("#reset-demo").addEventListener("click", () => {
  localStorage.setItem("heritageCatalog", JSON.stringify({ products: demoAdminProducts, stories: demoAdminStories }));
  renderAdmin();
});
renderAdmin();