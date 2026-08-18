import { prisma } from "@/lib/prisma";
import { getBrand } from "@/config/brand";

const POLICY_VERSION = "launch-1";

function pages() {
  const brand = getBrand();
  return [
    {
      slug: "about",
      title: `About ${brand.brandName}`,
      body: `${brand.brandName} is an Indian online store for everyday products. We take orders on this website, pack them, and ship them to your pincode.\n\nUpdate this page in Admin → Content with your own story, city, and why you started the shop.`,
    },
    {
      slug: "privacy",
      title: "Privacy Policy",
      body: `We collect only what we need to run the shop: your name, phone, email, delivery address, and order details.\n\nThis information is used to confirm orders, deliver products, handle returns, and reply to support messages. We do not sell your data.\n\nPayments on cash on delivery are collected at the door. If an online payment gateway is added later, card or UPI details are handled by that provider, not stored on this website.\n\nTo ask what we hold about you, email ${brand.supportEmail}. This text is a starting policy for a small shop, not legal advice.`,
    },
    {
      slug: "terms",
      title: "Terms of Use",
      body: `By placing an order you agree that product photos, prices, and stock can change, and that we may refuse or cancel an order if an item is unavailable, the address cannot be served, or payment cannot be collected.\n\nYou must give a reachable phone number. Ownership of goods passes on delivery after payment is collected (for cash on delivery) or after online payment is confirmed.\n\nReplace this with counsel-reviewed terms if you scale or take large prepaid orders.`,
    },
    {
      slug: "shipping-policy",
      title: "Shipping Policy",
      body: `We ship across India to valid 6-digit pincodes. Delivery estimates are shown at checkout after you enter a pincode.\n\nStandard and express fees are set in Admin → Settings. Metro pincodes may qualify for free standard shipping above your free-shipping amount.\n\nDelays can happen during festivals, weather, or courier disruptions. A tracking number is added in Admin → Orders when the parcel is handed to a courier.`,
    },
    {
      slug: "return-policy",
      title: "Return Policy",
      body: `You may request a return within 7 days of delivery if the item is unused, in original packing, and not a sealed hygiene or personal-care product that cannot be restocked.\n\nTo start a return, open Track order or Contact and share your order number plus photos of the issue. We will confirm pickup or a drop-off method.\n\nWrong-item or damaged-item cases are replaced or refunded after we inspect the return.`,
    },
    {
      slug: "refund-policy",
      title: "Refund Policy",
      body: `Cash-on-delivery orders: if you refuse a damaged parcel at the door, you pay nothing. After a valid return, refunds are sent to the original UPI/bank details you share, usually within 7 working days of inspection.\n\nPrepaid orders (when a payment gateway is connected): refunds go back through that gateway.\n\nShipping fees are refunded only when the return is our error.`,
    },
    {
      slug: "cancellation-policy",
      title: "Cancellation Policy",
      body: `You can ask us to cancel until the order is packed. After packing or handover to the courier, treat it as a return.\n\nWe may cancel if stock is wrong, the address is incomplete, or cash-on-delivery is refused on a repeated basis. Inventory is released when an order is marked Cancelled in admin.`,
    },
    {
      slug: "contact",
      title: "Contact",
      body: `Email ${brand.supportEmail}\nPhone ${brand.supportPhone}\n\nUse the form below for order help. Add your order number if you have one. You can also message us on WhatsApp if a number is saved in Admin → Settings.`,
    },
    {
      slug: "faq",
      title: "Frequently asked questions",
      body: `Common questions are listed on the FAQ page. You can also edit these in Admin → Content.`,
    },
  ];
}

export async function ensureBusinessPages(): Promise<void> {
  const marker = await prisma.siteSetting.findUnique({ where: { id: "policies_version" } });
  if (marker?.value === POLICY_VERSION) return;

  for (const page of pages()) {
    const existing = await prisma.cmsPage.findUnique({ where: { slug: page.slug } });
    if (!existing) {
      await prisma.cmsPage.create({ data: page });
      continue;
    }
    const stale =
      existing.body.includes("placeholder") ||
      existing.body.includes("Placeholder") ||
      existing.body.includes("development catalogue");
    if (stale) {
      await prisma.cmsPage.update({
        where: { id: existing.id },
        data: { title: page.title, body: page.body },
      });
    }
  }

  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: "Do you ship across India?",
          answer: "Yes, to valid 6-digit pincodes. Delivery time depends on your pincode and the method you pick at checkout.",
          sortOrder: 0,
        },
        {
          question: "How do I pay?",
          answer: "Cash on delivery is available now. UPI, cards, and net banking appear when Razorpay keys are added in Vercel.",
          sortOrder: 1,
        },
        {
          question: "How do I track my order?",
          answer: "Use Track order on the website with your order number and phone. We also add a courier tracking number after dispatch.",
          sortOrder: 2,
        },
        {
          question: "How do returns work?",
          answer: "Request a return within 7 days of delivery through Contact. Unused items in original packing can usually be returned.",
          sortOrder: 3,
        },
      ],
    });
  }

  await prisma.siteSetting.upsert({
    where: { id: "policies_version" },
    update: { value: POLICY_VERSION },
    create: { id: "policies_version", value: POLICY_VERSION },
  });
}
