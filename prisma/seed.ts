import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const prisma = new PrismaClient();

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

  const fashion = await prisma.category.create({
    data: {
      name: "Fashion",
      slug: "fashion",
      description: "Apparel and everyday wear with a quiet, considered cut.",
      sortOrder: 1,
      seoTitle: "Fashion",
      seoDescription: "Shop fashion essentials.",
    },
  });
  const beauty = await prisma.category.create({
    data: { name: "Beauty", slug: "beauty", description: "Skin and hair care with simple formulas.", sortOrder: 2 },
  });
  const electronics = await prisma.category.create({
    data: { name: "Electronics", slug: "electronics", description: "Small gadgets chosen for daily usefulness.", sortOrder: 3 },
  });
  const home = await prisma.category.create({
    data: { name: "Home & Kitchen", slug: "home-kitchen", description: "Objects for cooking and living well.", sortOrder: 4 },
  });
  const accessories = await prisma.category.create({
    data: { name: "Accessories", slug: "accessories", description: "Bags, belts, and finishing details.", sortOrder: 5 },
  });
  const kids = await prisma.category.create({
    data: { name: "Kids", slug: "kids", description: "Thoughtful goods for children.", sortOrder: 6 },
  });
  const lifestyle = await prisma.category.create({
    data: { name: "Lifestyle", slug: "lifestyle", description: "Home fragrance, journals, and daily rituals.", sortOrder: 7 },
  });
  const gadgets = await prisma.category.create({
    data: { name: "Gadgets", slug: "gadgets", description: "Compact tools and desk devices.", sortOrder: 8 },
  });
  const care = await prisma.category.create({
    data: { name: "Personal Care", slug: "personal-care", description: "Bath and grooming essentials.", sortOrder: 9 },
  });
  const fitness = await prisma.category.create({
    data: { name: "Fitness", slug: "fitness", description: "Simple equipment for home movement.", sortOrder: 10 },
  });
  const stationery = await prisma.category.create({
    data: { name: "Stationery", slug: "stationery", description: "Paper goods and writing tools.", sortOrder: 11 },
  });

  await prisma.category.createMany({
    data: [
      { name: "Trending", slug: "trending", description: "Currently moving quickly.", sortOrder: 20, parentId: fashion.id },
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
    { sku: "AT-LN-001", name: "Linen Overshirt", slug: "linen-overshirt", cat: fashion.id, brand: "Atria Studio", cost: 149000, sell: 349000, compare: 429000, stock: 42, featured: true, trending: true, best: true, neu: false, desc: "A mid-weight linen overshirt with a relaxed shoulder and corozo buttons. Cut to layer over tees in warm weather.", short: "Relaxed linen layer in undyed flax.", spec: { Fit: "Relaxed", Fabric: "100% linen", Care: "Cold wash" }, highlights: ["Corozo buttons", "Side vents", "Chest pocket"], sizes: ["S", "M", "L", "XL"], supplier: supplierA.id },
    { sku: "AT-TS-014", name: "Heavyweight Tee", slug: "heavyweight-tee", cat: fashion.id, brand: "Atria Studio", cost: 39000, sell: 129000, compare: 159000, stock: 80, featured: false, trending: true, best: true, neu: true, desc: "A dense cotton jersey tee with a clean neckline and a slightly cropped length.", short: "Dense cotton tee for daily wear.", spec: { Fit: "Regular", Fabric: "Organic cotton", Care: "Machine wash" }, highlights: ["240 GSM", "Taped shoulders"], sizes: ["S", "M", "L"], supplier: supplierA.id },
    { sku: "AT-SK-008", name: "Pleated Cotton Skirt", slug: "pleated-cotton-skirt", cat: fashion.id, brand: "Atria Studio", cost: 89000, sell: 249000, compare: null, stock: 28, featured: true, trending: false, best: false, neu: true, desc: "A midi skirt with knife pleats and a concealed side zip. Unlined for breathability.", short: "Breathable midi with knife pleats.", spec: { Length: "Midi", Fabric: "Cotton poplin" }, highlights: ["Side zip", "Soft waistband"], sizes: ["XS", "S", "M", "L"], supplier: supplierA.id },
    { sku: "AT-OL-003", name: "Rice Water Toner", slug: "rice-water-toner", cat: beauty.id, brand: "Nila Lab", cost: 12000, sell: 49000, compare: 59000, stock: 64, featured: true, trending: true, best: false, neu: true, desc: "A light, unscented toner with fermented rice filtrate. No promotional clinical claims.", short: "Light daily toner.", spec: { Volume: "150 ml", Texture: "Water" }, highlights: ["Alcohol-free", "Fragrance-free"], sizes: [], supplier: supplierA.id },
    { sku: "AT-OL-011", name: "Sesame Body Oil", slug: "sesame-body-oil", cat: beauty.id, brand: "Nila Lab", cost: 18000, sell: 69000, compare: null, stock: 40, featured: false, trending: false, best: true, neu: false, desc: "Cold-pressed sesame oil for after-bath use. Store away from direct sun.", short: "After-bath sesame oil.", spec: { Volume: "100 ml" }, highlights: ["Pump bottle"], sizes: [], supplier: supplierA.id },
    { sku: "AT-GD-021", name: "Compact Desk Fan", slug: "compact-desk-fan", cat: electronics.id, brand: "Deccan", cost: 89000, sell: 199000, compare: 249000, stock: 22, featured: true, trending: true, best: false, neu: true, desc: "USB-C desk fan with three speeds and a weighted base. Not a cooling appliance replacement.", short: "Three-speed USB-C desk fan.", spec: { Power: "USB-C", Speeds: "3" }, highlights: ["Quiet night mode", "Tilt head"], sizes: [], supplier: supplierB.id },
    { sku: "AT-GD-004", name: "Noise-Isolating Earbuds", slug: "noise-isolating-earbuds", cat: electronics.id, brand: "Deccan", cost: 129000, sell: 299000, compare: 349000, stock: 35, featured: false, trending: true, best: true, neu: false, desc: "Wired earbuds with a 3.5 mm jack and three ear-tip sizes. Isolation depends on fit.", short: "Wired earbuds with three tip sizes.", spec: { Connector: "3.5 mm" }, highlights: ["In-line mic"], sizes: [], supplier: supplierB.id },
    { sku: "AT-HK-009", name: "Hand-Thrown Mug", slug: "hand-thrown-mug", cat: home.id, brand: "Clayroom", cost: 22000, sell: 89000, compare: null, stock: 50, featured: true, trending: false, best: true, neu: true, desc: "Stoneware mug, approximately 300 ml. Each piece varies slightly in glaze.", short: "300 ml stoneware mug.", spec: { Capacity: "300 ml", Material: "Stoneware" }, highlights: ["Dishwasher safe", "Microwave safe"], sizes: [], supplier: supplierA.id },
    { sku: "AT-HK-017", name: "Cast Iron Dosa Tawa", slug: "cast-iron-dosa-tawa", cat: home.id, brand: "Atria Kitchen", cost: 79000, sell: 189000, compare: 229000, stock: 18, featured: true, trending: true, best: true, neu: false, desc: "Pre-seasoned 30 cm tawa. Follow the care card before first use.", short: "Pre-seasoned 30 cm tawa.", spec: { Diameter: "30 cm", Material: "Cast iron" }, highlights: ["Helper handle"], sizes: [], supplier: supplierA.id },
    { sku: "AT-AC-002", name: "Vegetable-Tanned Belt", slug: "vegetable-tanned-belt", cat: accessories.id, brand: "Atria Studio", cost: 69000, sell: 189000, compare: null, stock: 30, featured: false, trending: false, best: false, neu: true, desc: "A 3 cm belt in vegetable-tanned leather. Darkens with wear.", short: "3 cm vegetable-tanned belt.", spec: { Width: "3 cm" }, highlights: ["Brass buckle"], sizes: ["85", "90", "95", "100"], supplier: supplierA.id },
    { sku: "AT-AC-019", name: "Canvas Tote", slug: "canvas-tote", cat: accessories.id, brand: "Atria Studio", cost: 24000, sell: 99000, compare: 129000, stock: 70, featured: true, trending: true, best: true, neu: false, desc: "Unlined 16 oz canvas tote with an interior slip pocket.", short: "Heavy canvas everyday tote.", spec: { Material: "Cotton canvas" }, highlights: ["Interior pocket"], sizes: [], supplier: supplierA.id },
    { sku: "AT-KD-006", name: "Cotton Play Overalls", slug: "cotton-play-overalls", cat: kids.id, brand: "Atria Kids", cost: 49000, sell: 149000, compare: null, stock: 24, featured: false, trending: false, best: false, neu: true, desc: "Soft cotton overalls with adjustable straps and a front pocket.", short: "Adjustable cotton overalls.", spec: { Fabric: "Cotton twill" }, highlights: ["Adjustable straps"], sizes: ["2-3Y", "3-4Y", "4-5Y"], supplier: supplierA.id },
    { sku: "AT-LS-012", name: "Vetiver Room Spray", slug: "vetiver-room-spray", cat: lifestyle.id, brand: "Nila Lab", cost: 16000, sell: 79000, compare: 99000, stock: 36, featured: true, trending: false, best: false, neu: true, desc: "A short-lived room spray. Does not mask smoke or heavy odours.", short: "Vetiver room spray, 50 ml.", spec: { Volume: "50 ml" }, highlights: ["Glass bottle"], sizes: [], supplier: supplierA.id },
    { sku: "AT-GG-005", name: "Aluminium Phone Stand", slug: "aluminium-phone-stand", cat: gadgets.id, brand: "Deccan", cost: 18000, sell: 69000, compare: null, stock: 55, featured: false, trending: true, best: false, neu: true, desc: "Folding aluminium stand for phones up to 8 mm thick.", short: "Folding aluminium stand.", spec: { Material: "Aluminium" }, highlights: ["Packs flat"], sizes: [], supplier: supplierB.id },
    { sku: "AT-PC-010", name: "Neem Comb", slug: "neem-comb", cat: care.id, brand: "Nila Lab", cost: 6000, sell: 29000, compare: null, stock: 90, featured: false, trending: false, best: true, neu: false, desc: "Wide-tooth neem wood comb. Oil lightly if the climate is very dry.", short: "Wide-tooth neem wood comb.", spec: { Material: "Neem wood" }, highlights: ["Hand finished"], sizes: [], supplier: supplierA.id },
    { sku: "AT-FT-007", name: "Cotton Yoga Mat", slug: "cotton-yoga-mat", cat: fitness.id, brand: "Atria Move", cost: 59000, sell: 169000, compare: 199000, stock: 20, featured: true, trending: false, best: false, neu: true, desc: "A folded cotton mat for floor work. Not a high-grip studio rubber mat.", short: "Folded cotton floor mat.", spec: { Size: "180 x 60 cm" }, highlights: ["Machine washable cover"], sizes: [], supplier: supplierA.id },
    { sku: "AT-ST-015", name: "Clothbound Notebook", slug: "clothbound-notebook", cat: stationery.id, brand: "Atria Paper", cost: 9000, sell: 39000, compare: 49000, stock: 100, featured: true, trending: true, best: true, neu: false, desc: "A5 lined notebook, 128 pages, ivory paper.", short: "A5 clothbound lined notebook.", spec: { Size: "A5", Pages: "128" }, highlights: ["Lay-flat binding"], sizes: [], supplier: supplierA.id },
    { sku: "AT-ST-016", name: "Brass Ballpoint", slug: "brass-ballpoint", cat: stationery.id, brand: "Atria Paper", cost: 14000, sell: 59000, compare: null, stock: 45, featured: false, trending: false, best: false, neu: true, desc: "Refillable brass ballpoint. Patina will develop.", short: "Refillable brass ballpoint.", spec: { Refill: "Standard Parker-style" }, highlights: ["Uncoated brass"], sizes: [], supplier: supplierA.id },
    { sku: "AT-HK-022", name: "Copper Water Bottle", slug: "copper-water-bottle", cat: home.id, brand: "Atria Kitchen", cost: 32000, sell: 119000, compare: 149000, stock: 33, featured: false, trending: true, best: false, neu: false, desc: "1 litre copper bottle. Clean according to the included card. Not for acidic drinks.", short: "1 litre copper bottle.", spec: { Capacity: "1 L" }, highlights: ["Screw cap"], sizes: [], supplier: supplierA.id },
    { sku: "AT-FT-018", name: "Resistance Band Set", slug: "resistance-band-set", cat: fitness.id, brand: "Atria Move", cost: 15000, sell: 79000, compare: 99000, stock: 40, featured: false, trending: true, best: true, neu: false, desc: "Three latex-free fabric bands with a cotton carry pouch.", short: "Three-band fabric set.", spec: { Pieces: "3" }, highlights: ["Door anchor not included"], sizes: [], supplier: supplierA.id },
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
    ["about", "About", "This store is a working catalogue for an Indian retail and resale business. Brand name, policies, and legal entity details are configurable and should be replaced before public launch."],
    ["privacy", "Privacy Policy", "This is a placeholder privacy policy. Describe what personal data you collect, why, and how long you keep it. Do not treat this text as legal advice."],
    ["terms", "Terms", "These are placeholder terms of use. Replace them with counsel-reviewed terms before taking paid orders at scale."],
    ["shipping-policy", "Shipping Policy", "Placeholder shipping policy. Standard and express rates are calculated from pincode tables in the application. Carrier integrations are optional."],
    ["return-policy", "Return Policy", "Placeholder return policy. State eligible windows, conditions, and how customers start a return."],
    ["refund-policy", "Refund Policy", "Placeholder refund policy. Online gateway refunds require a configured payment provider. Cash-on-delivery refunds are handled operationally."],
    ["cancellation-policy", "Cancellation Policy", "Placeholder cancellation policy. Orders can be cancelled before packing from the admin order screen when stock is released."],
    ["contact", "Contact", "Use the contact form or email the support address configured for the brand. Response times depend on staffing."],
  ];
  for (const [slug, title, body] of policies) {
    await prisma.cmsPage.create({ data: { slug, title, body } });
  }

  await prisma.faq.createMany({
    data: [
      { question: "Do you ship across India?", answer: "Shipping quotes are based on pincode. Remote areas may have longer estimates.", sortOrder: 0 },
      { question: "Is cash on delivery available?", answer: "Yes, when the order is placed with COD. The order stays unpaid until delivery is confirmed.", sortOrder: 1 },
      { question: "Can I pay with UPI?", answer: "UPI requires a configured Indian payment gateway such as Razorpay. Until keys are added, only COD is offered.", sortOrder: 2 },
    ],
  });

  await prisma.siteSetting.createMany({
    data: [
      { id: "announcement", value: "Free standard shipping on metro pincodes for orders above ₹999 — check at checkout." },
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
