import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { getBrand } from "@/config/brand";

const prisma = new PrismaClient();
const brand = getBrand();

type Palette = { bg: string; a: string; b: string; c: string };

function svg(slug: string, title: string, palette: Palette): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
  <rect width="1200" height="1500" fill="${palette.bg}"/>
  <circle cx="220" cy="180" r="260" fill="${palette.a}" opacity="0.35"/>
  <circle cx="980" cy="1280" r="320" fill="${palette.b}" opacity="0.28"/>
  <rect x="260" y="360" width="680" height="780" rx="48" fill="${palette.c}" opacity="0.92"/>
  <rect x="330" y="430" width="540" height="540" rx="32" fill="${palette.bg}" opacity="0.35"/>
  <text x="600" y="1320" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#161513">${escapeXml(title)}</text>
</svg>`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function writeImage(slug: string, title: string, palette: Palette, suffix = "") {
  const dir = join(process.cwd(), "public", "images", "products");
  mkdirSync(dir, { recursive: true });
  const file = `${slug}${suffix}.svg`;
  writeFileSync(join(dir, file), svg(slug, title, palette));
  return `/images/products/${file}`;
}

async function main() {
  const adminHash = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "ChangeMe_admin_123", 12);
  const customerHash = await bcrypt.hash("Customer_123", 12);

  await prisma.staffPermission.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.resellerProfile.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.cmsPage.deleteMany();
  await prisma.homepageSection.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.inventoryEvent.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productQuestion.deleteMany();
  await prisma.review.deleteMany();
  await prisma.couponRedemption.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.siteSetting.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Store Admin",
      email: process.env.ADMIN_EMAIL ?? "admin@local.test",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      phone: "+919876543210",
    },
  });

  await prisma.user.create({
    data: {
      name: "Asha Menon",
      email: "asha@local.test",
      passwordHash: customerHash,
      role: "CUSTOMER",
      phone: "+919812345678",
    },
  });

  const makeHomeEasier = await prisma.category.create({
    data: {
      name: "Make Home Easier",
      slug: "make-home-easier",
      description: "Clever storage, organization & everyday home helpers",
      sortOrder: 1,
      seoTitle: "Make Home Easier",
      seoDescription: "Shop home organization and everyday helpers.",
    },
  });
  const kitchenSmarter = await prisma.category.create({
    data: {
      name: "Kitchen, Smarter",
      slug: "kitchen-smarter",
      description: "Little things that make cooking and cleaning easier",
      sortOrder: 2,
      seoTitle: "Kitchen, Smarter",
      seoDescription: "Shop kitchen tools and helpers.",
    },
  });
  const styleAccessories = await prisma.category.create({
    data: {
      name: "Style & Accessories",
      slug: "style-accessories",
      description: "Easy ways to add something special to your everyday look",
      sortOrder: 3,
      seoTitle: "Style & Accessories",
      seoDescription: "Shop style and accessories.",
    },
  });
  const beautySelfCare = await prisma.category.create({
    data: {
      name: "Beauty & Self-Care",
      slug: "beauty-self-care",
      description: "Simple tools and accessories for your daily routine",
      sortOrder: 4,
      seoTitle: "Beauty & Self-Care",
      seoDescription: "Shop beauty and self-care essentials.",
    },
  });
  const kidsFamily = await prisma.category.create({
    data: {
      name: "Kids & Family",
      slug: "kids-family",
      description: "Clever finds that make everyday family life easier",
      sortOrder: 5,
      seoTitle: "Kids & Family",
      seoDescription: "Shop kids and family products.",
    },
  });
  const gifts = await prisma.category.create({
    data: {
      name: "Gifts They'll Love",
      slug: "gifts",
      description: "Interesting little finds worth giving",
      sortOrder: 6,
      seoTitle: "Gifts They'll Love",
      seoDescription: "Shop gift ideas.",
    },
  });
  const cleverFinds = await prisma.category.create({
    data: {
      name: "Clever Finds",
      slug: "clever-finds",
      description: "Products you didn't know you needed",
      sortOrder: 7,
      seoTitle: "Clever Finds",
      seoDescription: "Shop clever finds and unexpected products.",
    },
  });
  const newTrending = await prisma.category.create({
    data: {
      name: "New & Trending",
      slug: "new-trending",
      description: "Fresh finds we're currently loving",
      sortOrder: 8,
      seoTitle: "New & Trending",
      seoDescription: "Shop new and trending products.",
    },
  });

  const fashion = await prisma.category.create({
    data: {
      name: "Fashion",
      slug: "fashion",
      description: "Apparel and everyday wear with a quiet, considered cut.",
      sortOrder: 9,
      seoTitle: "Fashion",
      seoDescription: "Shop fashion essentials.",
    },
  });
  const beauty = await prisma.category.create({
    data: { name: "Beauty", slug: "beauty", description: "Skin and hair care with simple formulas.", sortOrder: 10 },
  });
  const electronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics", description: "Small gadgets chosen for daily usefulness.", sortOrder: 11 },
  });
  const home = await prisma.category.create({
    data: { name: "Home & Kitchen", slug: "home-kitchen", description: "Objects for cooking and living well.", sortOrder: 12 },
  });
  const accessories = await prisma.category.create({
    data: { name: "Accessories", slug: "accessories", description: "Bags, belts, and finishing details.", sortOrder: 13 },
  });
  const kids = await prisma.category.create({
    data: { name: "Kids", slug: "kids", description: "Thoughtful goods for children.", sortOrder: 14 },
  });
  const lifestyle = await prisma.category.create({
    data: { name: "Lifestyle", slug: "lifestyle", description: "Home fragrance, journals, and daily rituals.", sortOrder: 15 },
  });
  const gadgets = await prisma.category.create({
    data: { name: "Gadgets", slug: "gadgets", description: "Compact tools and desk devices.", sortOrder: 16 },
  });
  const care = await prisma.category.create({
    data: { name: "Personal Care", slug: "personal-care", description: "Bath and grooming essentials.", sortOrder: 17 },
  });
  const fitness = await prisma.category.create({
    data: { name: "Fitness", slug: "fitness", description: "Simple equipment for home movement.", sortOrder: 18 },
  });
  const stationery = await prisma.category.create({
    data: { name: "Stationery", slug: "stationery", description: "Paper goods and writing tools.", sortOrder: 19 },
  });

  await prisma.category.createMany({
    data: [
      { name: "Trending", slug: "trending", description: "Currently moving quickly.", sortOrder: 20 },
      { name: "New Arrivals", slug: "new-arrivals", description: "Recently added to the catalogue.", sortOrder: 21 },
      { name: "Best Sellers", slug: "best-sellers", description: "Customer favourites.", sortOrder: 22 },
      { name: "Deals", slug: "deals", description: "Time-limited prices set by the store.", sortOrder: 23 },
    ],
  });

  const supplierA = await prisma.supplier.create({
    data: {
      name: "Malabar Source Co.",
      contactPerson: "Ravi Nair",
      email: "ravi@example.com",
      phone: "+914841112233",
      address: "Ernakulam, Kerala",
      notes: "Primary apparel and home textiles supplier.",
    },
  });
  const supplierB = await prisma.supplier.create({
    data: {
      name: "Deccan Components",
      contactPerson: "Sana Qureshi",
      email: "sana@example.com",
      phone: "+914022334455",
      address: "Hyderabad, Telangana",
      notes: "Electronics and gadgets.",
    },
  });

  const palettes: Palette[] = [
    { bg: "#efe6d9", a: "#1f3d34", b: "#c4a574", c: "#d8c3a5" },
    { bg: "#e7eee8", a: "#2c4a3e", b: "#b4553a", c: "#c5d1c8" },
    { bg: "#f3e7dc", a: "#4a3728", b: "#d7b48a", c: "#e4cbb0" },
    { bg: "#ece7ef", a: "#3a2f45", b: "#8a6d8f", c: "#d9cfe0" },
    { bg: "#e8eef2", a: "#1d3340", b: "#7ea0b0", c: "#c5d6de" },
    { bg: "#f6eadf", a: "#6b3a2a", b: "#e0b090", c: "#f0d0b8" },
  ];

  const products = [
    { sku: "AT-LN-001", name: "Linen Overshirt", slug: "linen-overshirt", cat: fashion.id, brand: "TheRareify Studio", cost: 149000, sell: 349000, compare: 429000, stock: 42, featured: true, trending: true, best: true, neu: false, desc: "A mid-weight linen overshirt with a relaxed shoulder and corozo buttons. Cut to layer over tees in warm weather.", short: "Relaxed linen layer in undyed flax.", spec: { Fit: "Relaxed", Fabric: "100% linen", Care: "Cold wash" }, highlights: ["Corozo buttons", "Side vents", "Chest pocket"], sizes: ["S", "M", "L", "XL"], supplier: supplierA.id },
    { sku: "AT-TS-014", name: "Heavyweight Tee", slug: "heavyweight-tee", cat: fashion.id, brand: "TheRareify Studio", cost: 39000, sell: 129000, compare: 159000, stock: 80, featured: false, trending: true, best: true, neu: true, desc: "A dense cotton jersey tee with a clean neckline and a slightly cropped length.", short: "Dense cotton tee for daily wear.", spec: { Fit: "Regular", Fabric: "Organic cotton", Care: "Machine wash" }, highlights: ["240 GSM", "Taped shoulders"], sizes: ["S", "M", "L"], supplier: supplierA.id },
    { sku: "AT-SK-008", name: "Pleated Cotton Skirt", slug: "pleated-cotton-skirt", cat: fashion.id, brand: "TheRareify Studio", cost: 89000, sell: 249000, compare: null, stock: 28, featured: true, trending: false, best: false, neu: true, desc: "A midi skirt with knife pleats and a concealed side zip. Unlined for breathability.", short: "Breathable midi with knife pleats.", spec: { Length: "Midi", Fabric: "Cotton poplin" }, highlights: ["Side zip", "Soft waistband"], sizes: ["XS", "S", "M", "L"], supplier: supplierA.id },
    { sku: "AT-OL-003", name: "Rice Water Toner", slug: "rice-water-toner", cat: beauty.id, brand: "Nila Lab", cost: 12000, sell: 49000, compare: 59000, stock: 64, featured: true, trending: true, best: false, neu: true, desc: "A light, unscented toner with fermented rice filtrate. No promotional clinical claims.", short: "Light daily toner.", spec: { Volume: "150 ml", Texture: "Water" }, highlights: ["Alcohol-free", "Fragrance-free"], sizes: [], supplier: supplierA.id },
    { sku: "AT-OL-011", name: "Sesame Body Oil", slug: "sesame-body-oil", cat: beauty.id, brand: "Nila Lab", cost: 18000, sell: 69000, compare: null, stock: 40, featured: false, trending: false, best: true, neu: false, desc: "Cold-pressed sesame oil for after-bath use. Store away from direct sun.", short: "After-bath sesame oil.", spec: { Volume: "100 ml" }, highlights: ["Pump bottle"], sizes: [], supplier: supplierA.id },
    { sku: "AT-GD-021", name: "Compact Desk Fan", slug: "compact-desk-fan", cat: electronics.id, brand: "Deccan", cost: 89000, sell: 199000, compare: 249000, stock: 22, featured: true, trending: true, best: false, neu: true, desc: "USB-C desk fan with three speeds and a weighted base. Not a cooling appliance replacement.", short: "Three-speed USB-C desk fan.", spec: { Power: "USB-C", Speeds: "3" }, highlights: ["Quiet night mode", "Tilt head"], sizes: [], supplier: supplierB.id },
    { sku: "AT-GD-004", name: "Noise-Isolating Earbuds", slug: "noise-isolating-earbuds", cat: electronics.id, brand: "Deccan", cost: 129000, sell: 299000, compare: 349000, stock: 35, featured: false, trending: true, best: true, neu: false, desc: "Wired earbuds with a 3.5 mm jack and three ear-tip sizes. Isolation depends on fit.", short: "Wired earbuds with three tip sizes.", spec: { Connector: "3.5 mm" }, highlights: ["In-line mic"], sizes: [], supplier: supplierB.id },
    { sku: "AT-HK-009", name: "Hand-Thrown Mug", slug: "hand-thrown-mug", cat: home.id, brand: "Clayroom", cost: 22000, sell: 89000, compare: null, stock: 50, featured: true, trending: false, best: true, neu: true, desc: "Stoneware mug, approximately 300 ml. Each piece varies slightly in glaze.", short: "300 ml stoneware mug.", spec: { Capacity: "300 ml", Material: "Stoneware" }, highlights: ["Dishwasher safe", "Microwave safe"], sizes: [], supplier: supplierA.id },
    { sku: "AT-HK-017", name: "Cast Iron Dosa Tawa", slug: "cast-iron-dosa-tawa", cat: home.id, brand: "TheRareify Kitchen", cost: 79000, sell: 189000, compare: 229000, stock: 18, featured: true, trending: true, best: true, neu: false, desc: "Pre-seasoned 30 cm tawa. Follow the care card before first use.", short: "Pre-seasoned 30 cm tawa.", spec: { Diameter: "30 cm", Material: "Cast iron" }, highlights: ["Helper handle"], sizes: [], supplier: supplierA.id },
    { sku: "AT-AC-002", name: "Vegetable-Tanned Belt", slug: "vegetable-tanned-belt", cat: accessories.id, brand: "TheRareify Studio", cost: 69000, sell: 189000, compare: null, stock: 30, featured: false, trending: false, best: false, neu: true, desc: "A 3 cm belt in vegetable-tanned leather. Darkens with wear.", short: "3 cm vegetable-tanned belt.", spec: { Width: "3 cm" }, highlights: ["Brass buckle"], sizes: ["85", "90", "95", "100"], supplier: supplierA.id },
    { sku: "AT-AC-019", name: "Canvas Tote", slug: "canvas-tote", cat: accessories.id, brand: "TheRareify Studio", cost: 24000, sell: 99000, compare: 129000, stock: 70, featured: true, trending: true, best: true, neu: false, desc: "Unlined 16 oz canvas tote with an interior slip pocket.", short: "Heavy canvas everyday tote.", spec: { Material: "Cotton canvas" }, highlights: ["Interior pocket"], sizes: [], supplier: supplierA.id },
    { sku: "AT-KD-006", name: "Cotton Play Overalls", slug: "cotton-play-overalls", cat: kids.id, brand: "TheRareify Kids", cost: 49000, sell: 149000, compare: null, stock: 24, featured: false, trending: false, best: false, neu: true, desc: "Soft cotton overalls with adjustable straps and a front pocket.", short: "Adjustable cotton overalls.", spec: { Fabric: "Cotton twill" }, highlights: ["Adjustable straps"], sizes: ["2-3Y", "3-4Y", "4-5Y"], supplier: supplierA.id },
    { sku: "AT-LS-012", name: "Vetiver Room Spray", slug: "vetiver-room-spray", cat: lifestyle.id, brand: "Nila Lab", cost: 16000, sell: 79000, compare: 99000, stock: 36, featured: true, trending: false, best: false, neu: true, desc: "A short-lived room spray. Does not mask smoke or heavy odours.", short: "Vetiver room spray, 50 ml.", spec: { Volume: "50 ml" }, highlights: ["Glass bottle"], sizes: [], supplier: supplierA.id },
    { sku: "AT-GG-005", name: "Aluminium Phone Stand", slug: "aluminium-phone-stand", cat: gadgets.id, brand: "Deccan", cost: 18000, sell: 69000, compare: null, stock: 55, featured: false, trending: true, best: false, neu: true, desc: "Folding aluminium stand for phones up to 8 mm thick.", short: "Folding aluminium stand.", spec: { Material: "Aluminium" }, highlights: ["Packs flat"], sizes: [], supplier: supplierB.id },
    { sku: "AT-PC-010", name: "Neem Comb", slug: "neem-comb", cat: care.id, brand: "Nila Lab", cost: 6000, sell: 29000, compare: null, stock: 90, featured: false, trending: false, best: true, neu: false, desc: "Wide-tooth neem wood comb. Oil lightly if the climate is very dry.", short: "Wide-tooth neem wood comb.", spec: { Material: "Neem wood" }, highlights: ["Hand finished"], sizes: [], supplier: supplierA.id },
    { sku: "AT-FT-007", name: "Cotton Yoga Mat", slug: "cotton-yoga-mat", cat: fitness.id, brand: "TheRareify Move", cost: 59000, sell: 169000, compare: 199000, stock: 20, featured: true, trending: false, best: false, neu: true, desc: "A folded cotton mat for floor work. Not a high-grip studio rubber mat.", short: "Folded cotton floor mat.", spec: { Size: "180 x 60 cm" }, highlights: ["Machine washable cover"], sizes: [], supplier: supplierA.id },
    { sku: "AT-ST-015", name: "Clothbound Notebook", slug: "clothbound-notebook", cat: stationery.id, brand: "TheRareify Paper", cost: 9000, sell: 39000, compare: 49000, stock: 100, featured: true, trending: true, best: true, neu: false, desc: "A5 lined notebook, 128 pages, ivory paper.", short: "A5 clothbound lined notebook.", spec: { Size: "A5", Pages: "128" }, highlights: ["Lay-flat binding"], sizes: [], supplier: supplierA.id },
    { sku: "AT-ST-016", name: "Brass Ballpoint", slug: "brass-ballpoint", cat: stationery.id, brand: "TheRareify Paper", cost: 14000, sell: 59000, compare: null, stock: 45, featured: false, trending: false, best: false, neu: true, desc: "Refillable brass ballpoint. Patina will develop.", short: "Refillable brass ballpoint.", spec: { Refill: "Standard Parker-style" }, highlights: ["Uncoated brass"], sizes: [], supplier: supplierA.id },
    { sku: "AT-HK-022", name: "Copper Water Bottle", slug: "copper-water-bottle", cat: home.id, brand: "TheRareify Kitchen", cost: 32000, sell: 119000, compare: 149000, stock: 33, featured: false, trending: true, best: false, neu: false, desc: "1 litre copper bottle. Clean according to the included card. Not for acidic drinks.", short: "1 litre copper bottle.", spec: { Capacity: "1 L" }, highlights: ["Screw cap"], sizes: [], supplier: supplierA.id },
    { sku: "AT-FT-018", name: "Resistance Band Set", slug: "resistance-band-set", cat: fitness.id, brand: "TheRareify Move", cost: 15000, sell: 79000, compare: 99000, stock: 40, featured: false, trending: true, best: true, neu: false, desc: "Three latex-free fabric bands with a cotton carry pouch.", short: "Three-band fabric set.", spec: { Pieces: "3" }, highlights: ["Door anchor not included"], sizes: [], supplier: supplierA.id },
  ];

  for (const [index, p] of products.entries()) {
    const palette = palettes[index % palettes.length];
    const main = writeImage(p.slug, p.name, palette);
    const alt = writeImage(p.slug, p.name, palettes[(index + 2) % palettes.length], "-2");
    const created = await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        slug: p.slug,
        description: p.desc,
        shortDescription: p.short,
        highlights: JSON.stringify(p.highlights),
        specifications: JSON.stringify(p.spec),
        categoryId: p.cat,
        supplierId: p.supplier,
        brand: p.brand,
        costPaise: p.cost,
        sellingPaise: p.sell,
        compareAtPaise: p.compare,
        stock: p.stock,
        featured: p.featured,
        trending: p.trending,
        bestSeller: p.best,
        newArrival: p.neu,
        seoTitle: p.name,
        seoDescription: p.short,
        images: {
          create: [
            { url: main, alt: p.name, position: 0, type: "MAIN" },
            { url: alt, alt: `${p.name} alternate view`, position: 1, type: "GALLERY" },
          ],
        },
      },
    });
    if (p.sizes.length) {
      for (const size of p.sizes) {
        await prisma.productVariant.create({
          data: {
            productId: created.id,
            sku: `${p.sku}-${size}`,
            name: size,
            size,
            sellingPaise: p.sell,
            costPaise: p.cost,
            stock: Math.floor(p.stock / p.sizes.length),
          },
        });
      }
    }
    await prisma.supplierProduct.create({
      data: {
        supplierId: p.supplier,
        productId: created.id,
        supplierSku: p.sku,
        costPaise: p.cost,
        availability: "IN_STOCK",
      },
    });
    await prisma.inventoryEvent.create({
      data: {
        productId: created.id,
        delta: p.stock,
        reason: "RECEIPT",
        note: "Initial seed stock",
        actorId: admin.id,
      },
    });
  }

  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrderPaise: 99900,
      maxDiscountPaise: 50000,
      usageLimit: 500,
      perCustomerLimit: 1,
      active: true,
    },
  });
  await prisma.coupon.create({
    data: {
      code: "FLAT200",
      type: "FIXED",
      value: 20000,
      minOrderPaise: 149900,
      usageLimit: 200,
      active: true,
    },
  });

  await prisma.banner.createMany({
    data: [
      {
        title: "Thoughtful everyday goods for modern Indian homes",
        subtitle: "",
        imageUrl: "/images/products/linen-overshirt.svg",
        href: "/category/fashion",
        placement: "hero",
        sortOrder: 0,
      },
      {
        title: "Kitchen iron, once",
        subtitle: "A tawa meant to stay on the hob.",
        imageUrl: "/images/products/cast-iron-dosa-tawa.svg",
        href: "/category/home-kitchen",
        placement: "promo",
        sortOrder: 1,
      },
    ],
  });

  const sectionKeys = [
    ["announcement", "Announcement", 0],
    ["hero", "Hero", 1],
    ["categories", "Featured categories", 2],
    ["trending", "Trending", 3],
    ["bestsellers", "Best sellers", 4],
    ["new", "New arrivals", 5],
    ["deals", "Deals", 6],
    ["promo", "Promotional banner", 7],
    ["trust", "Benefits", 8],
    ["reviews", "Reviews", 9],
    ["newsletter", "Newsletter", 10],
  ] as const;
  for (const [key, title, sortOrder] of sectionKeys) {
    await prisma.homepageSection.create({
      data: { key, title, sortOrder, enabled: true, config: "{}" },
    });
  }

  const policies = [
    [
      "about",
      "About",
      `We are an Indian retail and resale business focused on thoughtful everyday goods for modern Indian homes.

Our curated catalogue spans home, kitchen, personal care, and lifestyle products. We work directly with makers and suppliers to keep quality high and prices fair.

Business name: ${brand.brandName}
Support: ${brand.supportEmail}
GSTIN: (update in Admin → Settings)

If you have a question, email us anytime. We read every message.`,
    ],
    [
      "privacy",
      "Privacy Policy",
      `This Privacy Policy explains how we collect, use, and protect your personal information when you visit our store or place an order.

Information we collect
- Name, email, phone number, and delivery address when you register or checkout
- Order history, payment status, and delivery tracking
- Device and usage data collected automatically (IP address, browser type, pages visited)

How we use your information
- To process and deliver your orders
- To send order confirmations and delivery updates
- To respond to support requests
- To improve our store and product selection

Data sharing
We do not sell your personal data. We share information only with courier partners, payment processors, and email service providers who need it to complete your order.

Data retention
We retain your account and order data for as long as your account is active and as required by Indian law (typically 7 years for financial records).

Your rights
You can request a copy of your data, correct inaccuracies, or delete your account by contacting ${brand.supportEmail}.

Security
We use SSL encryption and secure server-side storage. However, no method of transmission over the Internet is 100% secure.

Changes to this policy
We may update this policy from time to time. Continued use of the store after changes means you accept the updated policy.

Disclaimer
This policy is a template. Have it reviewed by legal counsel before launch.`,
    ],
    [
      "terms",
      "Terms & Conditions",
      `By using this store, you agree to the following terms.

Account
- You are responsible for maintaining the confidentiality of your account
- You must provide accurate and complete information when registering
- One account per person

Orders and payment
- All prices are in Indian Rupees (INR) and include applicable taxes
- We accept Cash on Delivery (COD) and online payments where configured
- We reserve the right to cancel orders if stock is unavailable or pricing is incorrect

Product information
- We make every effort to show accurate colours, sizes, and descriptions
- Slight variations may occur between the image and the actual product
- Product availability is subject to stock

Intellectual property
- All content on this site belongs to ${brand.brandName} unless otherwise stated
- You may not copy, reproduce, or distribute our content without permission

Limitation of liability
- We are not liable for indirect or consequential losses arising from use of our products or services
- Our maximum liability for any claim is limited to the amount you paid for the product in question

Governing law
- These terms are governed by Indian law
- Disputes shall be resolved in the courts of (update jurisdiction)

Disclaimer
These terms are a template. Have them reviewed by legal counsel before launch.`,
    ],
    [
      "shipping-policy",
      "Shipping Policy",
      `We ship to most pincodes across India. Delivery timelines and charges are calculated at checkout based on your location.

Delivery areas
- Standard delivery: most urban and semi-urban pincodes
- Remote areas: longer timelines, additional charges may apply
- We do not ship internationally at this time

Delivery timelines
- Metro cities: 3–5 business days
- Tier 2/3 cities: 5–8 business days
- Remote areas: 7–12 business days

Courier partners
We use reputed national courier partners. Specific partner assignment depends on your pincode and order weight.

Shipping charges
- Free shipping on orders above ₹999 (metro pincodes)
- Standard shipping: ₹49–₹99
- Express shipping: ₹99–₹199 (where available)

Order tracking
You will receive a tracking number via email/SMS once your order is shipped. You can track it on our Track Order page.

Failed deliveries
If a COD order is not accepted after two delivery attempts, it will be returned to us and a restocking fee of ₹99 may be deducted from your refund.

Contact
For shipping queries, email ${brand.supportEmail}.`,
    ],
    [
      "return-policy",
      "Return Policy",
      `We want you to be happy with your purchase. If you are not satisfied, you can return eligible items within 7 days of delivery.

Eligible items
- Products must be unused, unwashed, and in original packaging
- Tags, labels, and seals must be intact
- Innerwear, personal care items, and customised products cannot be returned

How to initiate a return
1. Go to My Account → Orders
2. Select the order and click "Return"
3. Provide a reason and upload photos if required
4. We will review within 24–48 hours

Return shipping
- If the return is due to a defect or our error, we pay return shipping
- If the return is due to change of mind, you pay return shipping

Non-returnable items
- Items marked as final sale or clearance
- Products damaged after delivery due to misuse
- Items without original packaging or tags

Contact
For return queries, email ${brand.supportEmail}.`,
    ],
    [
      "refund-policy",
      "Refund Policy",
      `Refunds are processed after we receive and inspect the returned item.

Refund timeline
- We inspect returns within 24–48 hours of receipt
- Approved refunds are processed within 5–7 business days
- Refunds are issued to the original payment method

Refund modes
- Online payments: refunded to the original UPI/card/wallet
- COD: refunded via bank transfer or store credit

Partial refunds
We may issue partial refunds if:
- The item is returned with minor damage not covered under warranty
- Only part of the order is returned
- The product value has changed due to promotions

Non-refundable items
- Products that cannot be resold due to damage or missing parts
- Items that fail the return eligibility criteria

Late refunds
If you have not received your refund within 7 business days, contact us at ${brand.supportEmail} with your order number.

Disclaimer
This policy is a template. Have it reviewed by legal counsel before launch.`,
    ],
    [
      "cancellation-policy",
      "Cancellation Policy",
      `You can cancel your order before it is packed. Once packed, cancellation may not be possible.

Customer-initiated cancellation
- Cancel from My Account → Orders before the order status changes to "Packed"
- Full refund is issued instantly
- COD orders can be cancelled before dispatch

Merchant-initiated cancellation
We may cancel an order if:
- The product is out of stock
- The price was misprinted
- There is a risk of fraud or suspicious activity

Refund for cancelled orders
- Online payments: refunded within 5–7 business days
- COD: no charge since payment was not collected

Contact
For cancellation requests after packing, email ${brand.supportEmail}. We will try to help but cannot guarantee cancellation at that stage.`,
    ],
    [
      "contact",
      "Contact",
      `We are here to help. Reach out and we will reply within one business day.

Email: ${brand.supportEmail}
Phone: (update with your number)
Address: (update with your registered office/warehouse address)

Business hours: Monday to Saturday, 10:00 AM to 6:00 PM IST

For order issues, please include your order number in the subject line for faster resolution.`,
    ],
  ];
  for (const [slug, title, body] of policies) {
    await prisma.cmsPage.create({ data: { slug, title, body } });
  }

  await prisma.faq.createMany({
    data: [
      { question: "Do you ship across India?", answer: "Yes, we ship to most pincodes in India. Delivery timelines and charges are calculated at checkout based on your location.", sortOrder: 0 },
      { question: "Is cash on delivery available?", answer: "Yes, Cash on Delivery is available on most orders. A small COD convenience fee may apply depending on your location.", sortOrder: 1 },
      { question: "What is your return window?", answer: "You can return eligible items within 7 days of delivery. Items must be unused, unwashed, and in original packaging with tags intact.", sortOrder: 2 },
      { question: "How long does shipping take?", answer: "Metro cities: 3–5 business days. Tier 2/3 cities: 5–8 business days. Remote areas: 7–12 business days.", sortOrder: 3 },
      { question: "Can I cancel my order?", answer: "Yes, you can cancel before the order is packed. Go to My Account → Orders and select Cancel. Once packed, cancellation may not be possible.", sortOrder: 4 },
      { question: "Do you offer exchanges?", answer: "Yes, for size or colour exchanges on eligible items. Contact us within 7 days of delivery with your order number.", sortOrder: 5 },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { id: "announcement", value: "" },
      { id: "newsletter_blurb", value: "Occasionally, new objects and restocks. No daily mail." },
    ],
  });

  await prisma.review.create({
    data: {
      productId: (await prisma.product.findUniqueOrThrow({ where: { slug: "hand-thrown-mug" } })).id,
      rating: 5,
      title: "Even glaze, solid handle",
      content: "Purchased after seeing the listing photos. Capacity is as described. This is a development catalogue review from the seed customer account, marked unverified until a delivered order exists.",
      status: "APPROVED",
      verifiedPurchase: false,
      userId: (await prisma.user.findUniqueOrThrow({ where: { email: "asha@local.test" } })).id,
    },
  });

  console.log("Seed complete. Admin:", admin.email);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
