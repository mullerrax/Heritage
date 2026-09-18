# Leather & Sealskin creations — frontend handoff

This is a framework-free frontend package for a professional, inquiry-led showcase site. It is designed to be copied to a folder on a computer and opened locally. It does **not** process payments and it does **not** include a production database or secure admin authentication.

The package includes:

- `index.html` — public collection, stories, process and contact experience.
- `styles.css` — responsive visual system, animations and mobile navigation.
- `app.js` — demo catalog data, filtering, item details modal and WhatsApp routing.
- `admin.html` + `admin.js` — a local-only admin preview using browser `localStorage`. This lets a non-technical person test adding/removing content, but it is not safe for real admin use.
- `assets/` — the two supplied product photographs, copied into safe filenames.
- `api-contract.json` — the exact backend response shape the frontend expects.

The Facebook screenshot supplied for visual reference is **not used on the website**. The statement panel now uses the supplied mukluk photography, with a subtle line-art wildlife motif behind the hero text.

## 1. Run it locally

1. Copy the whole `heritage-skinwear-frontend` folder to the computer.
2. Keep the folder structure intact.
3. Double-click `index.html`, or right-click it and open it in Chrome/Edge/Firefox.
4. Test an item by selecting a product and clicking **Enquire about this piece**.
5. Open `admin.html` to add a local preview item. Then return to `index.html` and refresh.
6. Scroll to **Worn & remembered** to test the local testimonial and review form.

The local demo works from `file://`, so there is no install step. The Google Fonts link improves typography when the computer has internet; the site falls back to Georgia and Arial when it does not.

## 2. WhatsApp setup

Open `app.js` and change:

```js
const HERITAGE_CONFIG = {
  whatsappNumber: "15551234567",
  ...
};
```

Use the administrator's full international phone number with digits only:

- Correct: `14165551234`
- Incorrect: `+1 (416) 555-1234`

The site creates links in this format:

```text
https://wa.me/COUNTRYCODEANDNUMBER?text=ENCODED_MESSAGE
```

Each product creates a message containing the product name. The general contact button creates a general enquiry. Replace the placeholder email in `index.html` too.

The number is visible in browser source code. That is normal for a public WhatsApp contact link. Do not put passwords, private API keys or admin credentials in `app.js`.

## 3. Social links

Replace the placeholder URLs in both `index.html` and the `HERITAGE_CONFIG.social` object:

```js
social: {
  instagram: "https://www.instagram.com/your-handle/",
  facebook: "https://www.facebook.com/your-page/",
  x: "https://x.com/your-handle/"
}
```

This frontend uses normal profile links. It does not need Instagram, Facebook or X API access just to send visitors to those profiles. A backend connection is only necessary if the owner wants to automatically import social posts.

## 4. Recommended production architecture

Use three pieces:

1. **This frontend** — deploy the folder to Netlify, Vercel, Cloudflare Pages, GitHub Pages or the client's existing host.
2. **A backend API** — handles admin login, products, stories, image uploads and publishing status.
3. **Database + image storage** — database for text/status; object storage for images.

Beginner-friendly choices:

- Frontend hosting: Netlify or Vercel.
- Backend: Supabase, because it combines database, authentication and storage.
- Alternative: a small Node/Express API with PostgreSQL and S3-compatible storage.

For this site, Supabase is the shortest route to a secure working backend:

### Supabase setup

1. Create a Supabase project.
2. Create an `items` table with the fields from `api-contract.json`.
3. Create a `stories` table with `id`, `slug`, `index_label`, `title`, `excerpt`, `body`, `cover_image_url`, `published`, `created_at`.
4. Create a Storage bucket called `catalog-images`.
5. Create an owner account in Supabase Authentication.
6. Turn on Row Level Security:
   - Public visitors can `SELECT` rows where `published = true`.
   - Authenticated admin users can `SELECT`, `INSERT`, `UPDATE` and `DELETE`.
   - Storage images can be publicly read, but only the authenticated admin can upload/delete.
7. Never use the Supabase `service_role` key in this frontend. If it appears in browser code, assume the project is compromised and rotate it.

For a first launch, the easiest flow is:

```text
Admin signs in
   ↓
Admin uploads image → Storage returns public image URL
   ↓
Admin saves title/description/material/price/story → Database row
   ↓
Visitor opens site → Frontend requests published catalog
   ↓
Visitor clicks item → WhatsApp opens with product-specific message
```

## 5. Connect this frontend to the API

The current `app.js` has a fallback:

```js
async function loadCatalog() {
  if (HERITAGE_CONFIG.apiBaseUrl) {
    const response = await fetch(`${HERITAGE_CONFIG.apiBaseUrl}/api/public/catalog`);
    if (response.ok) return await response.json();
  }
  return getLocalCatalog();
}
```

After the backend is ready, set:

```js
apiBaseUrl: "https://api.your-domain.com"
```

The backend endpoint should return:

```json
{
  "products": [
    {
      "id": "mukluk-black-gold",
      "name": "Black + Gold Mukluks",
      "category": "footwear",
      "categoryLabel": "Handmade footwear",
      "price": "Enquire for price",
      "status": "Available to discuss",
      "description": "A public description.",
      "material": "Black fur, leather, glass beadwork",
      "image": "https://cdn.example.com/image.jpg",
      "featured": true
    }
  ],
  "stories": []
}
```

The exact example is also saved in `api-contract.json`.

### Minimal backend routes

Public:

- `GET /api/public/catalog` — return only published products and stories.
- `GET /api/public/products/:id` — optional, for direct shareable item pages.
- `GET /api/public/stories/:slug` — optional, for full journal articles.

Admin:

- `POST /api/admin/products` — create a product after authentication.
- `PATCH /api/admin/products/:id` — edit a product.
- `DELETE /api/admin/products/:id` — archive/delete a product.
- `POST /api/admin/uploads` — authenticated image upload.
- `POST /api/admin/stories` — create or update a story.
- `GET /api/public/reviews` — return approved reviews.
- `POST /api/public/reviews` — submit a review into moderation.
- `PATCH /api/admin/reviews/:id` — approve, hide or reject a review.

The frontend should never be trusted to decide who is an admin. Authentication and authorization must be enforced by the backend on every admin route.

## 6. Image uploads, stories and reviews

For a production admin panel, the product form should include:

- Product name
- Category: footwear, accessories, custom
- Price display: this can stay as text while the business negotiates in WhatsApp
- Availability/status
- Main image
- Additional gallery images
- Short description
- Material note
- Story/process text
- Published toggle
- Alt text for accessibility

The local `admin.html` preview now supports:

- Selecting a local JPG, PNG or WebP file for a product.
- Adding and removing story cards.
- Resetting products and stories to the supplied demo content.

The public page includes a testimonial block and review form. In the local preview, a submitted review is saved to `localStorage` and displayed immediately. In production, do not publish a visitor review directly from the browser. Send it to a moderated endpoint such as `POST /api/public/reviews`, save it with `status = "pending"`, and let the admin approve or reject it.

Recommended image rules:

- Upload JPG or WebP.
- Resize the main image to roughly 1600px on its longest side.
- Keep the original in storage if the owner wants it.
- Generate a smaller card thumbnail.
- Require alt text; describe the finished piece, not sensitive or speculative cultural claims.
- Use images the maker owns or has permission to publish.

## 7. Cultural and material accuracy

The visual direction is inspired by the supplied reference page: dark charcoal, warm hide tones, beadwork-like geometry, editorial serif type and tactile photography. It deliberately avoids claiming a specific Nation, tribe, or tradition that the maker has not verified.

Before launch, have the client review:

- Names for materials and species.
- Whether the origin and hunting/process story can be public.
- Community, family or cultural permissions for symbols and motifs.
- Any legal requirements for selling or shipping animal-derived materials.
- The exact wording used for Alaska, Canada, and Indigenous community references.

Only publish accurate, lawful sourcing information. Do not invent species, geography, community affiliation or ceremonial meaning to make the page sound more impressive.

## 8. Launch checklist

- [ ] Replace placeholder brand name/copy if needed.
- [ ] Replace placeholder WhatsApp number.
- [ ] Replace email and social profile URLs.
- [ ] Replace the demo photos with approved high-resolution photos.
- [ ] Confirm material, species and sourcing copy with the maker.
- [ ] Connect `/api/public/catalog`.
- [ ] Build real admin authentication.
- [ ] Lock down storage and admin routes.
- [ ] Test mobile layout on an actual phone.
- [ ] Test WhatsApp on iPhone and Android.
- [ ] Add privacy/terms pages if collecting visitor information.
- [ ] Test image alt text, keyboard navigation and colour contrast.
- [ ] Add analytics only after the owner has chosen an appropriate privacy notice.

## Important limitation

`admin.html` is intentionally a preview tool only. Browser `localStorage` can be edited by anyone and is not a database. It is useful for approving the interface and content shape, but remove it or hide it behind real authentication before launch.