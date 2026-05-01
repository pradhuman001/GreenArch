const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const FRONTEND_DIR = path.join(ROOT_DIR, "Project");
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 3000);
const PORT_FALLBACKS = Array.from(new Set([PORT, 4000, 5000, 3001, 5500].filter((value) => Number.isFinite(value) && value > 0)));
const IS_SERVERLESS_RUNTIME = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@greenarch.local").toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";
const TOKEN_TTL_DAYS = Number(process.env.TOKEN_TTL_DAYS || 30);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "581586313233-re1i40i5aqijroqvns2iohtu1miuqqmh.apps.googleusercontent.com";

// Optional: load .env file when present (development). If dotenv isn't installed,
// this will fail silently and environment variables can still be provided by the host.
try {
  require('dotenv').config();
} catch (err) {
  // dotenv not installed — that's fine in production containers or when env vars are set externally.
}

// Payment gateway credentials (keep secrets on the server / env, never in frontend)
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const PAYMENT_ENABLED = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
if (!PAYMENT_ENABLED) {
  console.warn('Payment gateway not configured. Payments will run in demo/mocked mode.');
}

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Serve additional static files from the workspace root so legacy image paths
// that reference files outside the Project folder (e.g. ../image9.jpg) still resolve.
app.use(express.static(ROOT_DIR));

const defaultServices = [
  {
    id: "plant-maintenance",
    title: "Plant Maintenance",
    summary: "Watering, cleaning, trimming, and weekly upkeep for healthy growth.",
    category: "Gardening"
  },
  {
    id: "pest-control",
    title: "Pest Control",
    summary: "Basic treatment and preventive protection for home garden plants.",
    category: "Protection"
  },
  {
    id: "garden-setup",
    title: "Garden Setup",
    summary: "Balcony and terrace setup with practical plant arrangement.",
    category: "Design"
  },
  {
    id: "plant-health-check",
    title: "Plant Health Check",
    summary: "Issue diagnosis, recovery tips, and personalized care suggestions.",
    category: "Inspection"
  },
  {
    id: "irrigation-support",
    title: "Irrigation Support",
    summary: "Drip setup guidance and water-saving care routines for daily ease.",
    category: "Watering"
  },
  {
    id: "soil-nutrition",
    title: "Soil Nutrition",
    summary: "Compost and nutrient balancing to improve plant strength and bloom.",
    category: "Recovery"
  }
];

const defaultGardeners = [
  {
    id: "gardener_ravi",
    name: "Ravi Patel",
    status: "online",
    assignedJobs: 2,
    rating: 4.7,
    area: "Indore Central",
    enabled: true
  },
  {
    id: "gardener_neha",
    name: "Neha Verma",
    status: "busy",
    assignedJobs: 3,
    rating: 4.8,
    area: "Vijay Nagar",
    enabled: true
  },
  {
    id: "gardener_aman",
    name: "Aman Singh",
    status: "offline",
    assignedJobs: 0,
    rating: 4.4,
    area: "Palasia",
    enabled: true
  }
];

const defaultTasks = [
  {
    id: "task_pending_verification",
    title: "Verify pending bookings",
    dueDate: nowIso(),
    status: "pending"
  },
  {
    id: "task_follow_up_reviews",
    title: "Follow up on low ratings",
    dueDate: nowIso(),
    status: "open"
  }
];

const defaultNurseryPartnerSeed = {
  user: {
    email: "nursery@greenarch.local",
    password: process.env.PARTNER_PASSWORD || "Nursery@12345",
    name: "GreenLeaf Nursery"
  },
  profile: {
    shopName: "GreenLeaf Nursery",
    ownerName: "Asha Mehta",
    phone: "+91 98765 43210",
    city: "Indore",
    address: "22, Scheme 54, Indore",
    bio: "Trusted nursery partner for indoor plants, balcony greens, pots, soil, and garden tools.",
    logoUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
    coverUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1400&q=80",
    deliveryRadius: "8 km",
    payoutUpi: "greenleaf@upi"
  },
  products: [
    {
      title: "Money Plant in Ceramic Pot",
      category: "Plants",
      price: 499,
      stock: 18,
      unit: "piece",
      description: "Easy-care trailing plant with a premium ceramic planter.",
      imageUrl: "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Terracotta Pot Set",
      category: "Pots",
      price: 799,
      stock: 24,
      unit: "set",
      description: "Hand-finished breathable pots for balcony and terrace plants.",
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Organic Bloom Fertilizer",
      category: "Fertilizers",
      price: 349,
      stock: 42,
      unit: "pack",
      description: "Slow-release nutrient mix for healthier growth and flowering.",
      imageUrl: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80"
    },
    {
      title: "Pruning and Grooming Kit",
      category: "Tools",
      price: 1199,
      stock: 11,
      unit: "kit",
      description: "Clean-cut shears, gloves, and grooming tools for home care.",
      imageUrl: "https://images.unsplash.com/photo-1462471432964-6714f3e9f1e2?auto=format&fit=crop&w=900&q=80"
    }
  ],
  orders: [
    {
      productTitle: "Money Plant in Ceramic Pot",
      quantity: 2,
      customerName: "Rahul Sharma",
      phone: "+91 90000 11111",
      address: "Vijay Nagar, Indore",
      status: "pending",
      amount: 998,
      createdAt: nowIso()
    },
    {
      productTitle: "Organic Bloom Fertilizer",
      quantity: 3,
      customerName: "Neha Singh",
      phone: "+91 90000 22222",
      address: "Palasia, Indore",
      status: "completed",
      amount: 1047,
      createdAt: nowIso()
    }
  ]
};

function nowIso() {
  return new Date().toISOString();
}

function safeId(prefix) {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, salt, hash) {
  const computed = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
}

function publicUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, passwordSalt, ...rest } = user;
  return rest;
}

function normalizeRole(value) {
  const role = String(value || "user").trim().toLowerCase();
  return ["user", "admin", "partner"].includes(role) ? role : "user";
}

function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  return { token, userId, createdAt, expiresAt };
}

function defaultDb() {
  const adminPassword = hashPassword(ADMIN_PASSWORD);
  return {
    users: [
      {
        id: safeId("user"),
        name: "GreenArch Admin",
        email: ADMIN_EMAIL,
        phone: "",
        role: "admin",
        passwordSalt: adminPassword.salt,
        passwordHash: adminPassword.hash,
        createdAt: nowIso(),
        savedServices: []
      }
    ],
    sessions: [],
    bookings: [],
    gardeners: defaultGardeners,
    tasks: defaultTasks,
    contacts: [],
    supportRequests: [],
    savedServices: [],
    services: defaultServices,
    nurseryProfiles: [],
    nurseryProducts: [],
    nurseryOrders: [],
    settings: {
      siteName: "GreenArch"
    }
  };
}

function ensureNurserySeed(db) {
  if (!Array.isArray(db.nurseryProfiles)) {
    db.nurseryProfiles = [];
  }
  if (!Array.isArray(db.nurseryProducts)) {
    db.nurseryProducts = [];
  }
  if (!Array.isArray(db.nurseryOrders)) {
    db.nurseryOrders = [];
  }

  const partnerEmail = normalizeEmail(defaultNurseryPartnerSeed.user.email);
  const existingPartner = db.users.find((user) => normalizeEmail(user.email) === partnerEmail && normalizeRole(user.role) === "partner");
  if (existingPartner) {
    const profileExists = db.nurseryProfiles.some((profile) => profile.userId === existingPartner.id);
    if (!profileExists) {
      db.nurseryProfiles.push({
        id: safeId("nursery"),
        userId: existingPartner.id,
        shopName: defaultNurseryPartnerSeed.profile.shopName,
        ownerName: defaultNurseryPartnerSeed.profile.ownerName,
        phone: defaultNurseryPartnerSeed.profile.phone,
        city: defaultNurseryPartnerSeed.profile.city,
        address: defaultNurseryPartnerSeed.profile.address,
        bio: defaultNurseryPartnerSeed.profile.bio,
        logoUrl: defaultNurseryPartnerSeed.profile.logoUrl,
        coverUrl: defaultNurseryPartnerSeed.profile.coverUrl,
        deliveryRadius: defaultNurseryPartnerSeed.profile.deliveryRadius,
        payoutUpi: defaultNurseryPartnerSeed.profile.payoutUpi,
        createdAt: nowIso(),
        updatedAt: nowIso()
      });
    }

    const hasSeedProducts = db.nurseryProducts.some((product) => product.partnerId === existingPartner.id);
    if (!hasSeedProducts) {
      const profile = db.nurseryProfiles.find((entry) => entry.userId === existingPartner.id) || null;
      defaultNurseryPartnerSeed.products.forEach((product) => {
        db.nurseryProducts.push({
          id: safeId("product"),
          partnerId: existingPartner.id,
          nurseryProfileId: profile ? profile.id : null,
          title: product.title,
          category: product.category,
          price: product.price,
          stock: product.stock,
          unit: product.unit,
          description: product.description,
          imageUrl: product.imageUrl,
          active: true,
          featured: true,
          createdAt: nowIso(),
          updatedAt: nowIso()
        });
      });
    }

    return;
  }

  const passwordRecord = hashPassword(defaultNurseryPartnerSeed.user.password);
  const user = {
    id: safeId("user"),
    name: defaultNurseryPartnerSeed.user.name,
    email: defaultNurseryPartnerSeed.user.email,
    phone: defaultNurseryPartnerSeed.profile.phone,
    role: "partner",
    passwordSalt: passwordRecord.salt,
    passwordHash: passwordRecord.hash,
    createdAt: nowIso(),
    savedServices: []
  };

  db.users.push(user);
  const profile = {
    id: safeId("nursery"),
    userId: user.id,
    shopName: defaultNurseryPartnerSeed.profile.shopName,
    ownerName: defaultNurseryPartnerSeed.profile.ownerName,
    phone: defaultNurseryPartnerSeed.profile.phone,
    city: defaultNurseryPartnerSeed.profile.city,
    address: defaultNurseryPartnerSeed.profile.address,
    bio: defaultNurseryPartnerSeed.profile.bio,
    logoUrl: defaultNurseryPartnerSeed.profile.logoUrl,
    coverUrl: defaultNurseryPartnerSeed.profile.coverUrl,
    deliveryRadius: defaultNurseryPartnerSeed.profile.deliveryRadius,
    payoutUpi: defaultNurseryPartnerSeed.profile.payoutUpi,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  db.nurseryProfiles.push(profile);

  defaultNurseryPartnerSeed.products.forEach((product) => {
    db.nurseryProducts.push({
      id: safeId("product"),
      partnerId: user.id,
      nurseryProfileId: profile.id,
      title: product.title,
      category: product.category,
      price: product.price,
      stock: product.stock,
      unit: product.unit,
      description: product.description,
      imageUrl: product.imageUrl,
      active: true,
      featured: true,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
  });

}

function cleanupSeedNurseryOrders(db) {
  if (!Array.isArray(db.nurseryOrders) || !db.nurseryOrders.length) {
    return false;
  }

  const demoNames = new Set(["Rahul Sharma", "Neha Singh", "Amit Patel", "Priya Verma", "Karan Jain", "Isha Nair", "Vikram Das", "Ananya Gupta"]);
  const partnerEmail = normalizeEmail(defaultNurseryPartnerSeed.user.email);
  const seedPartner = (db.users || []).find((user) => normalizeRole(user.role) === "partner" && normalizeEmail(user.email) === partnerEmail);
  if (!seedPartner) {
    return false;
  }

  const before = db.nurseryOrders.length;
  db.nurseryOrders = db.nurseryOrders.filter((order) => {
    if (order.partnerId !== seedPartner.id) {
      return true;
    }

    const hasStoreShape = Object.prototype.hasOwnProperty.call(order, "notes")
      || Object.prototype.hasOwnProperty.call(order, "customerId")
      || Object.prototype.hasOwnProperty.call(order, "nurseryProfileId");
    if (hasStoreShape) {
      return true;
    }

    const rawPhone = String(order.phone || "").replace(/\s+/g, "");
    const isDemoPhone = /^\+9190\d{8}$/.test(rawPhone);
    const isDemoName = demoNames.has(String(order.customerName || "").trim());
    const isLegacySeedOrder = order.productId == null;
    return !(isLegacySeedOrder || isDemoPhone || isDemoName);
  });

  return db.nurseryOrders.length !== before;
}

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify(defaultDb(), null, 2), "utf8");
  }
}

async function readDb() {
  await ensureDataFile();
  const raw = await fs.readFile(DB_FILE, "utf8");
  const parsed = JSON.parse(raw);
  const db = {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    bookings: Array.isArray(parsed.bookings) ? parsed.bookings : [],
    gardeners: Array.isArray(parsed.gardeners) ? parsed.gardeners : defaultGardeners,
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultTasks,
    contacts: Array.isArray(parsed.contacts) ? parsed.contacts : [],
    supportRequests: Array.isArray(parsed.supportRequests) ? parsed.supportRequests : [],
    savedServices: Array.isArray(parsed.savedServices) ? parsed.savedServices : [],
    services: Array.isArray(parsed.services) ? parsed.services : defaultServices,
    nurseryProfiles: Array.isArray(parsed.nurseryProfiles) ? parsed.nurseryProfiles : [],
    nurseryProducts: Array.isArray(parsed.nurseryProducts) ? parsed.nurseryProducts : [],
    nurseryOrders: Array.isArray(parsed.nurseryOrders) ? parsed.nurseryOrders : [],
    nurseries: Array.isArray(parsed.nurseries) ? parsed.nurseries : [],
    locationProducts: Array.isArray(parsed.locationProducts) ? parsed.locationProducts : [],
    settings: parsed.settings || { siteName: "GreenArch" }
  };

  let shouldPersist = false;

  const adminEmail = normalizeEmail(ADMIN_EMAIL);
  const adminExists = db.users.some((user) => normalizeEmail(user.email) === adminEmail && user.role === "admin");
  if (!adminExists) {
    const adminPassword = hashPassword(ADMIN_PASSWORD);
    db.users.push({
      id: safeId("user"),
      name: "GreenArch Admin",
      email: ADMIN_EMAIL,
      phone: "",
      role: "admin",
      passwordSalt: adminPassword.salt,
      passwordHash: adminPassword.hash,
      createdAt: nowIso(),
      savedServices: []
    });
    shouldPersist = true;
  }

  const partnerBeforeSeed = db.users.length + db.nurseryProfiles.length + db.nurseryProducts.length + db.nurseryOrders.length;
  ensureNurserySeed(db);
  if (partnerBeforeSeed !== db.users.length + db.nurseryProfiles.length + db.nurseryProducts.length + db.nurseryOrders.length) {
    shouldPersist = true;
  }

  if (cleanupSeedNurseryOrders(db)) {
    shouldPersist = true;
  }

  const now = Date.now();
  const activeSessions = db.sessions.filter((session) => {
    const expiresAt = Date.parse(session.expiresAt || "");
    return Number.isFinite(expiresAt) && expiresAt > now;
  });

  if (activeSessions.length !== db.sessions.length) {
    db.sessions = activeSessions;
    shouldPersist = true;
  }

  if (shouldPersist) {
    await writeDb(db);
  }

  return db;
}

async function writeDb(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

async function getSessionUser(req) {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const fallbackToken = req.header("x-greenarch-token") || "";
  const token = bearerToken || fallbackToken;

  if (!token) {
    return null;
  }

  const db = await readDb();
  const session = db.sessions.find((entry) => entry.token === token);
  if (!session) {
    return null;
  }

  const user = db.users.find((entry) => entry.id === session.userId);
  if (!user) {
    return null;
  }

  return { user: publicUser(user), session, db };
}

async function requireAuth(req, res, options = {}) {
  const result = await getSessionUser(req);
  if (!result) {
    sendJson(res, 401, { error: "Authentication required" });
    return null;
  }

  if (options.role && result.user.role !== options.role) {
    sendJson(res, 403, { error: "Insufficient permissions" });
    return null;
  }

  if (Array.isArray(options.roles) && options.roles.length && !options.roles.includes(result.user.role)) {
    sendJson(res, 403, { error: "Insufficient permissions" });
    return null;
  }

  return result;
}

function normalizeBookingPayload(body) {
  return {
    service: String(body.service || "Free Inspection").trim() || "Free Inspection",
    plantSize: String(body.plantSize || "").trim(),
    preferredDay: String(body.preferredDay || "").trim(),
    timeSlot: String(body.timeSlot || "").trim(),
    fullName: String(body.fullName || body.name || "").trim(),
    phoneNumber: String(body.phoneNumber || body.phone || "").trim(),
    address: String(body.address || body.location || "").trim(),
    notes: String(body.notes || "").trim()
  };
}

function normalizePartnerProfileInput(body = {}) {
  const shopName = String(body.shopName || body.businessName || body.name || "").trim();
  return {
    shopName: shopName || "GreenArch Nursery",
    ownerName: String(body.ownerName || body.name || "").trim() || shopName || "Nursery Partner",
    phone: String(body.phone || "").trim(),
    city: String(body.city || body.location || "").trim(),
    address: String(body.address || body.shopAddress || "").trim(),
    bio: String(body.bio || body.description || "").trim(),
    logoUrl: String(body.logoUrl || body.logo || "").trim(),
    coverUrl: String(body.coverUrl || body.bannerUrl || "").trim(),
    deliveryRadius: String(body.deliveryRadius || body.serviceRadius || "").trim(),
    payoutUpi: String(body.payoutUpi || body.upiId || "").trim()
  };
}

function normalizePartnerProductInput(body = {}) {
  const title = String(body.title || body.name || "").trim();
  return {
    title,
    category: String(body.category || "Plants").trim() || "Plants",
    price: Number(body.price || 0),
    stock: Math.max(0, Number(body.stock || 0)),
    unit: String(body.unit || "piece").trim() || "piece",
    description: String(body.description || body.summary || "").trim(),
    imageUrl: String(body.imageUrl || body.image || "").trim(),
    active: body.active == null ? true : Boolean(body.active),
    featured: body.featured == null ? false : Boolean(body.featured)
  };
}

function getPartnerProfile(db, userId) {
  return (db.nurseryProfiles || []).find((profile) => profile.userId === userId) || null;
}

function getPartnerProducts(db, userId) {
  return (db.nurseryProducts || []).filter((product) => product.partnerId === userId);
}

function getPartnerOrders(db, userId) {
  return (db.nurseryOrders || []).filter((order) => order.partnerId === userId);
}

function publicStoreProduct(product, profile) {
  return {
    id: product.id,
    partnerId: product.partnerId,
    nurseryProfileId: product.nurseryProfileId || null,
    title: product.title,
    category: product.category,
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    unit: product.unit || "piece",
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    active: product.active !== false,
    featured: Boolean(product.featured),
    shopName: profile ? profile.shopName : "GreenArch Nursery",
    ownerName: profile ? profile.ownerName : "GreenArch Partner",
    city: profile ? profile.city : "",
    deliveryRadius: profile ? profile.deliveryRadius : "",
    phone: profile ? profile.phone : "",
    address: profile ? profile.address : ""
  };
}

function derivePartnerAnalytics(profile, products, orders) {
  const pendingOrders = orders.filter((order) => String(order.status || "").toLowerCase() === "pending");
  const completedOrders = orders.filter((order) => String(order.status || "").toLowerCase() === "completed");
  const cancelledOrders = orders.filter((order) => String(order.status || "").toLowerCase() === "cancelled");
  const revenue = completedOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const stockCount = products.reduce((sum, product) => sum + Number(product.stock || 0), 0);
  const lowStockProducts = products.filter((product) => Number(product.stock || 0) <= 5);

  const daily = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    const matchingOrders = orders.filter((order) => String(order.createdAt || "").startsWith(key));
    daily.push({
      date: key,
      bookings: matchingOrders.length,
      revenue: matchingOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0)
    });
  }

  return {
    shopName: profile ? profile.shopName : "Nursery Partner",
    totalProducts: products.length,
    activeProducts: products.filter((product) => product.active !== false).length,
    totalStock: stockCount,
    totalOrders: orders.length,
    pendingOrders: pendingOrders.length,
    completedOrders: completedOrders.length,
    cancelledOrders: cancelledOrders.length,
    revenue,
    averageOrderValue: orders.length ? revenue / orders.length : 0,
    lowStockCount: lowStockProducts.length,
    lowStockProducts: lowStockProducts.slice(0, 6).map((product) => ({
      id: product.id,
      title: product.title,
      stock: Number(product.stock || 0),
      category: product.category,
      price: Number(product.price || 0)
    })),
    notifications: [
      ...pendingOrders.slice(0, 4).map((order) => ({
        id: order.id,
        type: "order",
        tone: "warning",
        message: `${order.customerName || "Customer"} placed a ${order.productTitle || "product"} order waiting for review.`,
        createdAt: order.createdAt
      })),
      ...lowStockProducts.slice(0, 4).map((product) => ({
        id: product.id,
        type: "stock",
        tone: "info",
        message: `${product.title} is low on stock (${Number(product.stock || 0)} left).`,
        createdAt: product.updatedAt || product.createdAt
      }))
    ].slice(0, 8),
    daily
  };
}

function normalizeOrderStatus(value) {
  const status = String(value || "pending").trim().toLowerCase();
  return ["pending", "confirmed", "completed", "cancelled"].includes(status) ? status : "pending";
}

function publicPartnerOrder(order) {
  return {
    ...order
  };
}

function validateRequired(fields) {
  return fields.every((value) => String(value || "").trim().length > 0);
}

async function verifyGoogleIdToken(idToken) {
  const token = String(idToken || "").trim();
  if (!token) {
    throw new Error("Google credential is required");
  }

  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = String(payload.error_description || payload.error || "Unable to verify Google credential").trim();
    throw new Error(details || "Unable to verify Google credential");
  }
  const aud = String(payload.aud || "").trim();
  const iss = String(payload.iss || "").trim();
  const email = normalizeEmail(payload.email || "");
  const emailVerified = String(payload.email_verified || "").toLowerCase() === "true";

  if (aud !== GOOGLE_CLIENT_ID) {
    throw new Error("Google credential audience mismatch");
  }

  if (!["accounts.google.com", "https://accounts.google.com"].includes(iss)) {
    throw new Error("Invalid Google issuer");
  }

  if (!email || !emailVerified) {
    throw new Error("Google account email is not verified");
  }

  return {
    sub: String(payload.sub || "").trim(),
    email,
    name: String(payload.name || "").trim(),
    picture: String(payload.picture || "").trim()
  };
}

function toPublicContact(contact) {
  return {
    ...contact
  };
}

function toPublicSupportRequest(request) {
  return {
    ...request
  };
}

function toPublicBooking(booking) {
  return {
    ...booking
  };
}

function toAdminServiceRecord(service) {
  return {
    id: String(service.id || safeId("svc")),
    name: String(service.title || service.name || "Untitled Service"),
    title: String(service.title || service.name || "Untitled Service"),
    description: String(service.summary || service.description || ""),
    summary: String(service.summary || service.description || ""),
    category: String(service.category || "General"),
    price: Number(service.price || 699),
    duration: String(service.duration || "90 min"),
    active: service.active == null ? true : Boolean(service.active)
  };
}

function normalizeAdminServiceInput(body = {}) {
  const title = String(body.name || body.title || "").trim();
  return {
    id: String(body.id || safeId("service")).trim(),
    title,
    summary: String(body.description || body.summary || "").trim() || `Professional ${title || "service"} package.`,
    category: String(body.category || "General").trim() || "General",
    price: Number(body.price || 0),
    duration: String(body.duration || "90 min").trim() || "90 min",
    active: body.active == null ? true : Boolean(body.active)
  };
}

function normalizeBookingAdminStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (["pending", "confirmed", "completed", "cancelled"].includes(normalized)) {
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
  return "Pending";
}

function deriveAnalytics(bookings) {
  const statusSplit = {
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  };

  const dailyMap = new Map();
  const areaMap = new Map();
  const serviceMap = new Map();

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    dailyMap.set(key, {
      date: key,
      bookings: 0,
      revenue: 0
    });
  }

  bookings.forEach((booking) => {
    const statusKey = String(booking.status || "Pending").trim().toLowerCase();
    if (Object.prototype.hasOwnProperty.call(statusSplit, statusKey)) {
      statusSplit[statusKey] += 1;
    }

    const when = new Date(booking.date || booking.preferredDay || booking.createdAt || Date.now());
    if (Number.isFinite(when.getTime())) {
      const key = when.toISOString().slice(0, 10);
      if (dailyMap.has(key)) {
        const row = dailyMap.get(key);
        row.bookings += 1;
        row.revenue += Number(booking.amount || 0);
      }
    }

    const area = String(booking.area || booking.address || "Unknown Area").trim() || "Unknown Area";
    areaMap.set(area, (areaMap.get(area) || 0) + 1);

    const service = String(booking.service || booking.serviceLabel || "Unknown Service").trim() || "Unknown Service";
    serviceMap.set(service, (serviceMap.get(service) || 0) + 1);
  });

  const total = bookings.length;
  const completed = statusSplit.completed;
  const cancelled = statusSplit.cancelled;
  const confirmedOrCompleted = statusSplit.confirmed + statusSplit.completed;
  const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.amount || 0), 0);

  return {
    daily: Array.from(dailyMap.values()),
    statusSplit,
    completionRate: total ? (completed / total) * 100 : 0,
    cancellationRate: total ? (cancelled / total) * 100 : 0,
    conversionRate: total ? (confirmedOrCompleted / total) * 100 : 0,
    avgTicket: total ? totalRevenue / total : 0,
    topAreas: Array.from(areaMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
    topServices: Array.from(serviceMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6)
  };
}

function toPublicUserRecord(user) {
  return publicUser(user);
}

app.get("/api/health", (_req, res) => {
  sendJson(res, 200, { ok: true, service: "GreenArch API", timestamp: nowIso() });
});

app.get("/api/services", async (_req, res) => {
  const db = await readDb();
  sendJson(res, 200, { services: db.services });
});

app.post("/api/auth/signup", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const phone = String(req.body.phone || "").trim();
  const password = String(req.body.password || "");
  const requestedRole = normalizeRole(req.body.role || "user");

  if (!name || !email || !password) {
    return sendJson(res, 400, { error: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return sendJson(res, 400, { error: "Password must be at least 6 characters" });
  }

  const db = await readDb();
  const existingUser = db.users.find((user) => normalizeEmail(user.email) === email);
  if (existingUser) {
    return sendJson(res, 409, { error: "An account with that email already exists" });
  }

  if (![
    "user",
    "partner"
  ].includes(requestedRole)) {
    return sendJson(res, 400, { error: "Invalid account role" });
  }

  const passwordRecord = hashPassword(password);
  const user = {
    id: safeId("user"),
    name,
    email,
    phone,
    role: requestedRole,
    passwordSalt: passwordRecord.salt,
    passwordHash: passwordRecord.hash,
    createdAt: nowIso(),
    savedServices: []
  };

  if (requestedRole === "partner") {
    const profile = normalizePartnerProfileInput(req.body || {});
    db.nurseryProfiles = Array.isArray(db.nurseryProfiles) ? db.nurseryProfiles : [];
    db.nurseryProfiles.push({
      id: safeId("nursery"),
      userId: user.id,
      shopName: profile.shopName,
      ownerName: profile.ownerName,
      phone: profile.phone || phone,
      city: profile.city,
      address: profile.address,
      bio: profile.bio,
      logoUrl: profile.logoUrl,
      coverUrl: profile.coverUrl,
      deliveryRadius: profile.deliveryRadius,
      payoutUpi: profile.payoutUpi,
      createdAt: nowIso(),
      updatedAt: nowIso()
    });
  }

  const session = createSession(user.id);
  db.users.push(user);
  db.sessions.push(session);
  await writeDb(db);

  sendJson(res, 201, {
    token: session.token,
    expiresAt: session.expiresAt,
    user: publicUser(user)
  });
});

app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    return sendJson(res, 400, { error: "Email and password are required" });
  }

  const db = await readDb();
  const user = db.users.find((entry) => normalizeEmail(entry.email) === email);
  if (!user || !user.passwordSalt || !user.passwordHash || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
    return sendJson(res, 401, { error: "Invalid email or password" });
  }

  const session = createSession(user.id);
  db.sessions.push(session);
  await writeDb(db);

  sendJson(res, 200, {
    token: session.token,
    expiresAt: session.expiresAt,
    user: publicUser(user)
  });
});

app.post("/api/auth/google", async (req, res) => {
  try {
    const googleUser = await verifyGoogleIdToken(req.body.credential);
    const db = await readDb();

    let user = db.users.find((entry) => normalizeEmail(entry.email) === googleUser.email);
    if (!user) {
      user = {
        id: safeId("user"),
        name: googleUser.name || googleUser.email.split("@")[0] || "GreenArch User",
        email: googleUser.email,
        phone: "",
        role: "user",
        googleSub: googleUser.sub,
        photoURL: googleUser.picture,
        createdAt: nowIso(),
        savedServices: []
      };
      db.users.push(user);
    } else {
      user.googleSub = user.googleSub || googleUser.sub;
      if (googleUser.picture) {
        user.photoURL = googleUser.picture;
      }
      if (!user.name && googleUser.name) {
        user.name = googleUser.name;
      }
    }

    const session = createSession(user.id);
    db.sessions.push(session);
    await writeDb(db);

    sendJson(res, 200, {
      token: session.token,
      expiresAt: session.expiresAt,
      user: publicUser(user)
    });
  } catch (error) {
    const message = String(error && error.message ? error.message : "Google authentication failed");
    console.error("Google auth error:", message);
    sendJson(res, 401, { error: message });
  }
});

app.post("/api/auth/logout", async (req, res) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const token = bearerToken || String(req.body.token || req.header("x-greenarch-token") || "").trim();

  if (!token) {
    return sendJson(res, 200, { ok: true });
  }

  const db = await readDb();
  db.sessions = db.sessions.filter((session) => session.token !== token);
  await writeDb(db);
  sendJson(res, 200, { ok: true });
});

app.get("/api/auth/me", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  sendJson(res, 200, { user: result.user });
});

app.get("/api/bookings/me", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  const bookings = result.db.bookings.filter((booking) => booking.userId === result.user.id);
  sendJson(res, 200, { bookings });
});

app.post("/api/bookings", async (req, res) => {
  const payload = normalizeBookingPayload(req.body || {});

  if (!validateRequired([payload.plantSize, payload.preferredDay, payload.timeSlot, payload.fullName, payload.phoneNumber, payload.address])) {
    return sendJson(res, 400, { error: "Please complete all booking fields" });
  }

  const auth = await getSessionUser(req);
  const db = auth ? auth.db : await readDb();
  const booking = {
    id: safeId("booking"),
    userId: auth ? auth.user.id : null,
    service: payload.service,
    serviceLabel: payload.service,
    plantSize: payload.plantSize,
    preferredDay: payload.preferredDay,
    timeSlot: payload.timeSlot,
    fullName: payload.fullName,
    phoneNumber: payload.phoneNumber,
    address: payload.address,
    notes: payload.notes,
    status: "Pending",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  db.bookings.push(booking);
  await writeDb(db);

  sendJson(res, 201, {
    message: "Booking received",
    booking
  });
});

app.get("/api/admin/bookings", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { bookings: result.db.bookings.slice().reverse().map(toPublicBooking) });
});

app.post("/api/admin/bookings/:id/assign", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const booking = result.db.bookings.find((entry) => entry.id === req.params.id);
  if (!booking) {
    return sendJson(res, 404, { error: "Booking not found" });
  }

  const gardener = String(req.body.gardener || "").trim();
  booking.assignedGardener = gardener;
  if (String(booking.status || "").toLowerCase() === "pending") {
    booking.status = "Confirmed";
  }
  booking.updatedAt = nowIso();

  if (gardener) {
    const roster = result.db.gardeners || [];
    const rosterUser = roster.find((item) => String(item.name || "") === gardener);
    if (rosterUser) {
      rosterUser.assignedJobs = Number(rosterUser.assignedJobs || 0) + 1;
      rosterUser.status = rosterUser.status === "offline" ? "online" : rosterUser.status;
    }
  }

  await writeDb(result.db);
  sendJson(res, 200, { booking });
});

app.post("/api/admin/bookings/:id/cancel", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const booking = result.db.bookings.find((entry) => entry.id === req.params.id);
  if (!booking) {
    return sendJson(res, 404, { error: "Booking not found" });
  }

  booking.status = "Cancelled";
  booking.updatedAt = nowIso();
  await writeDb(result.db);
  sendJson(res, 200, { booking });
});

app.post("/api/admin/bookings/:id/reschedule", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const booking = result.db.bookings.find((entry) => entry.id === req.params.id);
  if (!booking) {
    return sendJson(res, 404, { error: "Booking not found" });
  }

  const nextDateRaw = String(req.body.date || "").trim();
  if (!nextDateRaw) {
    return sendJson(res, 400, { error: "date is required" });
  }

  booking.date = nextDateRaw;
  booking.preferredDay = nextDateRaw;
  booking.updatedAt = nowIso();
  if (String(booking.status || "").toLowerCase() === "cancelled") {
    booking.status = "Pending";
  }

  await writeDb(result.db);
  sendJson(res, 200, { booking });
});

app.patch("/api/admin/bookings/:id/status", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const nextStatus = String(req.body.status || "").trim();
  if (!nextStatus) {
    return sendJson(res, 400, { error: "Status is required" });
  }

  const booking = result.db.bookings.find((entry) => entry.id === req.params.id);
  if (!booking) {
    return sendJson(res, 404, { error: "Booking not found" });
  }

  booking.status = nextStatus;
  booking.updatedAt = nowIso();
  await writeDb(result.db);

  sendJson(res, 200, { booking });
});

app.delete("/api/admin/bookings/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const before = result.db.bookings.length;
  result.db.bookings = result.db.bookings.filter((entry) => entry.id !== req.params.id);

  if (before === result.db.bookings.length) {
    return sendJson(res, 404, { error: "Booking not found" });
  }

  await writeDb(result.db);
  sendJson(res, 200, { ok: true });
});

app.get("/api/admin/gardeners", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { gardeners: (result.db.gardeners || []).map((entry) => ({ ...entry })) });
});

app.post("/api/admin/gardeners/toggle", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const name = String(req.body.gardener || "").trim();
  const enabled = Boolean(req.body.enabled);
  const gardener = (result.db.gardeners || []).find((entry) => String(entry.name || "") === name);
  if (!gardener) {
    return sendJson(res, 404, { error: "Gardener not found" });
  }

  gardener.enabled = enabled;
  gardener.status = enabled ? (gardener.status === "offline" ? "online" : gardener.status) : "offline";
  gardener.updatedAt = nowIso();

  await writeDb(result.db);
  sendJson(res, 200, { gardener });
});

app.get("/api/admin/tasks", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const bookingTasks = result.db.bookings
    .filter((entry) => String(entry.status || "Pending").toLowerCase() === "pending")
    .slice(0, 10)
    .map((entry) => ({
      id: `task_booking_${entry.id}`,
      title: `Confirm booking for ${entry.fullName || entry.customer || "customer"}`,
      dueDate: entry.preferredDay || entry.date || entry.createdAt,
      status: "pending"
    }));

  const merged = [...(result.db.tasks || []), ...bookingTasks];
  sendJson(res, 200, { tasks: merged });
});

app.get("/api/admin/services", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { services: (result.db.services || []).map(toAdminServiceRecord) });
});

app.post("/api/admin/services", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const payload = normalizeAdminServiceInput(req.body || {});
  if (!payload.title) {
    return sendJson(res, 400, { error: "Service name is required" });
  }

  const service = {
    id: payload.id,
    title: payload.title,
    summary: payload.summary,
    category: payload.category,
    price: payload.price,
    duration: payload.duration,
    active: payload.active
  };

  result.db.services.push(service);
  await writeDb(result.db);
  sendJson(res, 201, { service: toAdminServiceRecord(service), id: service.id });
});

app.patch("/api/admin/services/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const service = (result.db.services || []).find((entry) => String(entry.id) === String(req.params.id));
  if (!service) {
    return sendJson(res, 404, { error: "Service not found" });
  }

  if (req.body.title != null || req.body.name != null) {
    const nextTitle = String(req.body.title || req.body.name || "").trim();
    if (nextTitle) {
      service.title = nextTitle;
    }
  }
  if (req.body.summary != null || req.body.description != null) {
    service.summary = String(req.body.summary || req.body.description || "").trim();
  }
  if (req.body.duration != null) {
    service.duration = String(req.body.duration || "").trim() || service.duration;
  }
  if (req.body.category != null) {
    service.category = String(req.body.category || "").trim() || service.category;
  }
  if (req.body.price != null) {
    service.price = Number(req.body.price || 0);
  }
  if (req.body.active != null) {
    service.active = Boolean(req.body.active);
  }

  await writeDb(result.db);
  sendJson(res, 200, { service: toAdminServiceRecord(service) });
});

app.post("/api/admin/services/:id/status", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const service = (result.db.services || []).find((entry) => String(entry.id) === String(req.params.id));
  if (!service) {
    return sendJson(res, 404, { error: "Service not found" });
  }

  service.active = Boolean(req.body.active);
  await writeDb(result.db);
  sendJson(res, 200, { service: toAdminServiceRecord(service) });
});

app.delete("/api/admin/services/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const before = (result.db.services || []).length;
  result.db.services = (result.db.services || []).filter((entry) => String(entry.id) !== String(req.params.id));
  if (before === result.db.services.length) {
    return sendJson(res, 404, { error: "Service not found" });
  }

  await writeDb(result.db);
  sendJson(res, 200, { ok: true });
});

app.get("/api/admin/analytics", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const analytics = deriveAnalytics(result.db.bookings || []);
  sendJson(res, 200, analytics);
});

app.post("/api/admin/reviews/:id/flag", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, {
    ok: true,
    reviewId: String(req.params.id || "").trim(),
    flagged: Boolean(req.body.flagged),
    updatedAt: nowIso()
  });
});

app.post("/api/admin/reviews/:id/reply", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, {
    ok: true,
    reviewId: String(req.params.id || "").trim(),
    message: String(req.body.message || "").trim(),
    createdAt: nowIso()
  });
});

app.get("/api/admin/contacts", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { contacts: result.db.contacts.slice().reverse().map(toPublicContact) });
});

app.patch("/api/admin/contacts/:id/status", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const nextStatus = String(req.body.status || "").trim();
  if (!nextStatus) {
    return sendJson(res, 400, { error: "Status is required" });
  }

  const contact = result.db.contacts.find((entry) => entry.id === req.params.id);
  if (!contact) {
    return sendJson(res, 404, { error: "Contact not found" });
  }

  contact.status = nextStatus;
  contact.updatedAt = nowIso();
  await writeDb(result.db);
  sendJson(res, 200, { contact });
});

app.delete("/api/admin/contacts/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const before = result.db.contacts.length;
  result.db.contacts = result.db.contacts.filter((entry) => entry.id !== req.params.id);

  if (before === result.db.contacts.length) {
    return sendJson(res, 404, { error: "Contact not found" });
  }

  await writeDb(result.db);
  sendJson(res, 200, { ok: true });
});

app.get("/api/admin/support", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { supportRequests: result.db.supportRequests.slice().reverse().map(toPublicSupportRequest) });
});

app.patch("/api/admin/support/:id/status", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const nextStatus = String(req.body.status || "").trim();
  if (!nextStatus) {
    return sendJson(res, 400, { error: "Status is required" });
  }

  const supportRequest = result.db.supportRequests.find((entry) => entry.id === req.params.id);
  if (!supportRequest) {
    return sendJson(res, 404, { error: "Support request not found" });
  }

  supportRequest.status = nextStatus;
  supportRequest.updatedAt = nowIso();
  await writeDb(result.db);
  sendJson(res, 200, { supportRequest });
});

app.delete("/api/admin/support/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const before = result.db.supportRequests.length;
  result.db.supportRequests = result.db.supportRequests.filter((entry) => entry.id !== req.params.id);

  if (before === result.db.supportRequests.length) {
    return sendJson(res, 404, { error: "Support request not found" });
  }

  await writeDb(result.db);
  sendJson(res, 200, { ok: true });
});

app.get("/api/admin/users", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  sendJson(res, 200, {
    users: result.db.users
      .map(toPublicUserRecord)
      .filter(Boolean)
      .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
  });
});

app.patch("/api/admin/users/:id/role", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const nextRole = String(req.body.role || "").trim().toLowerCase();
  if (!nextRole || !["user", "admin", "partner"].includes(nextRole)) {
    return sendJson(res, 400, { error: "Role must be user, admin, or partner" });
  }

  const user = result.db.users.find((entry) => entry.id === req.params.id);
  if (!user) {
    return sendJson(res, 404, { error: "User not found" });
  }

  user.role = nextRole;
  await writeDb(result.db);
  sendJson(res, 200, { user: publicUser(user) });
});

app.get("/api/store/products", async (_req, res) => {
  const db = await readDb();
  const products = (db.nurseryProducts || [])
    .filter((product) => product.active !== false && Number(product.stock || 0) > 0)
    .map((product) => {
      const profile = getPartnerProfile(db, product.partnerId);
      return publicStoreProduct(product, profile);
    })
    .sort((left, right) => String(right.featured).localeCompare(String(left.featured)) || String(left.title).localeCompare(String(right.title)));

  sendJson(res, 200, { products });
});

app.post("/api/store/orders", async (req, res) => {
  const payload = {
    productId: String(req.body.productId || "").trim(),
    quantity: Math.max(1, Number(req.body.quantity || 1)),
    customerName: String(req.body.customerName || req.body.name || "").trim(),
    phone: String(req.body.phone || req.body.phoneNumber || "").trim(),
    address: String(req.body.address || "").trim(),
    notes: String(req.body.notes || "").trim()
  };

  if (!payload.productId || !payload.customerName || !payload.phone || !payload.address) {
    return sendJson(res, 400, { error: "Product, customer name, phone, and address are required" });
  }

  const auth = await getSessionUser(req);
  const db = auth ? auth.db : await readDb();
  const product = (db.nurseryProducts || []).find((entry) => entry.id === payload.productId);

  if (!product || product.active === false) {
    return sendJson(res, 404, { error: "Product not found" });
  }

  if (Number(product.stock || 0) < payload.quantity) {
    return sendJson(res, 400, { error: "Not enough stock available" });
  }

  const profile = getPartnerProfile(db, product.partnerId);
  const amount = Number(product.price || 0) * payload.quantity;
  product.stock = Number(product.stock || 0) - payload.quantity;
  product.updatedAt = nowIso();
  if (product.stock <= 0) {
    product.stock = 0;
    product.active = false;
  }

  const order = {
    id: safeId("order"),
    partnerId: product.partnerId,
    nurseryProfileId: profile ? profile.id : null,
    productId: product.id,
    productTitle: product.title,
    quantity: payload.quantity,
    customerId: auth ? auth.user.id : null,
    customerName: payload.customerName,
    phone: payload.phone,
    address: payload.address,
    notes: payload.notes,
    status: "pending",
    amount,
    notificationRead: false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  db.nurseryOrders = Array.isArray(db.nurseryOrders) ? db.nurseryOrders : [];
  db.nurseryOrders.push(order);
  await writeDb(db);

  sendJson(res, 201, {
    message: "Order placed",
    order: publicPartnerOrder(order),
    product: publicStoreProduct(product, profile)
  });
});

app.get("/api/store/orders/tracking", async (req, res) => {
  const phone = String(req.query.phone || "").trim();
  if (!phone) {
    return sendJson(res, 400, { error: "Phone number is required" });
  }

  const db = await readDb();
  const normalizedPhone = phone.replace(/\s+/g, "");
  const limit = Math.max(1, Math.min(50, Number(req.query.limit || 20)));

  const orders = (db.nurseryOrders || [])
    .filter((order) => String(order.phone || "").replace(/\s+/g, "") === normalizedPhone)
    .sort((left, right) => String(right.createdAt || "").localeCompare(String(left.createdAt || "")))
    .slice(0, limit)
    .map((order) => {
      const profile = getPartnerProfile(db, order.partnerId);
      return {
        ...publicPartnerOrder(order),
        shopName: profile ? profile.shopName : "GreenArch Nursery"
      };
    });

  sendJson(res, 200, { orders });
});

app.get("/api/partner/dashboard", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const profile = getPartnerProfile(result.db, result.user.id);
  const products = getPartnerProducts(result.db, result.user.id).map((product) => ({ ...product }));
  const orders = getPartnerOrders(result.db, result.user.id).slice().reverse().map((order) => ({ ...order }));
  const analytics = derivePartnerAnalytics(profile, products, orders);

  sendJson(res, 200, {
    profile,
    products,
    orders,
    analytics
  });
});

app.get("/api/partner/profile", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { profile: getPartnerProfile(result.db, result.user.id) });
});

app.put("/api/partner/profile", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const profileInput = normalizePartnerProfileInput(req.body || {});
  const db = result.db;
  db.nurseryProfiles = Array.isArray(db.nurseryProfiles) ? db.nurseryProfiles : [];

  let profile = db.nurseryProfiles.find((entry) => entry.userId === result.user.id);
  if (!profile) {
    profile = {
      id: safeId("nursery"),
      userId: result.user.id,
      createdAt: nowIso()
    };
    db.nurseryProfiles.push(profile);
  }

  profile.shopName = profileInput.shopName;
  profile.ownerName = profileInput.ownerName || result.user.name;
  profile.phone = profileInput.phone || result.user.phone || "";
  profile.city = profileInput.city;
  profile.address = profileInput.address;
  profile.bio = profileInput.bio;
  profile.logoUrl = profileInput.logoUrl;
  profile.coverUrl = profileInput.coverUrl;
  profile.deliveryRadius = profileInput.deliveryRadius;
  profile.payoutUpi = profileInput.payoutUpi;
  profile.updatedAt = nowIso();

  await writeDb(db);
  sendJson(res, 200, { profile });
});

app.get("/api/partner/products", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { products: getPartnerProducts(result.db, result.user.id) });
});

app.post("/api/partner/products", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const payload = normalizePartnerProductInput(req.body || {});
  if (!payload.title) {
    return sendJson(res, 400, { error: "Product title is required" });
  }

  const profile = getPartnerProfile(result.db, result.user.id);
  const product = {
    id: safeId("product"),
    partnerId: result.user.id,
    nurseryProfileId: profile ? profile.id : null,
    title: payload.title,
    category: payload.category,
    price: payload.price,
    stock: payload.stock,
    unit: payload.unit,
    description: payload.description,
    imageUrl: payload.imageUrl,
    active: payload.active,
    featured: payload.featured,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  result.db.nurseryProducts = Array.isArray(result.db.nurseryProducts) ? result.db.nurseryProducts : [];
  result.db.nurseryProducts.push(product);
  await writeDb(result.db);
  sendJson(res, 201, { product });
});

app.put("/api/partner/products/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const product = (result.db.nurseryProducts || []).find((entry) => entry.id === req.params.id && entry.partnerId === result.user.id);
  if (!product) {
    return sendJson(res, 404, { error: "Product not found" });
  }

  const payload = normalizePartnerProductInput(req.body || {});
  if (payload.title) {
    product.title = payload.title;
  }
  product.category = payload.category || product.category;
  if (Number.isFinite(payload.price)) {
    product.price = payload.price;
  }
  if (Number.isFinite(payload.stock)) {
    product.stock = payload.stock;
  }
  if (payload.unit) {
    product.unit = payload.unit;
  }
  product.description = payload.description;
  product.imageUrl = payload.imageUrl;
  if (req.body.active != null) {
    product.active = Boolean(req.body.active);
  }
  if (req.body.featured != null) {
    product.featured = Boolean(req.body.featured);
  }
  product.updatedAt = nowIso();

  await writeDb(result.db);
  sendJson(res, 200, { product });
});

app.delete("/api/partner/products/:id", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const before = (result.db.nurseryProducts || []).length;
  result.db.nurseryProducts = (result.db.nurseryProducts || []).filter((entry) => !(entry.id === req.params.id && entry.partnerId === result.user.id));
  if (before === result.db.nurseryProducts.length) {
    return sendJson(res, 404, { error: "Product not found" });
  }

  await writeDb(result.db);
  sendJson(res, 200, { ok: true });
});

app.get("/api/partner/orders", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  sendJson(res, 200, { orders: getPartnerOrders(result.db, result.user.id).slice().reverse() });
});

app.patch("/api/partner/orders/:id/status", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const order = (result.db.nurseryOrders || []).find((entry) => entry.id === req.params.id && entry.partnerId === result.user.id);
  if (!order) {
    return sendJson(res, 404, { error: "Order not found" });
  }

  const nextStatus = normalizeOrderStatus(req.body.status || req.body.nextStatus);
  order.status = nextStatus;
  order.updatedAt = nowIso();
  order.notificationRead = true;

  await writeDb(result.db);
  sendJson(res, 200, { order });
});

app.get("/api/partner/analytics", async (req, res) => {
  const result = await requireAuth(req, res, { role: "partner" });
  if (!result) {
    return;
  }

  const profile = getPartnerProfile(result.db, result.user.id);
  const products = getPartnerProducts(result.db, result.user.id);
  const orders = getPartnerOrders(result.db, result.user.id);
  sendJson(res, 200, { analytics: derivePartnerAnalytics(profile, products, orders) });
});

app.get("/api/admin/overview", async (req, res) => {
  const result = await requireAuth(req, res, { role: "admin" });
  if (!result) {
    return;
  }

  const bookings = result.db.bookings.length;
  const contacts = result.db.contacts.length;
  const supportRequests = result.db.supportRequests.length;
  const users = result.db.users.filter((entry) => entry.role === "user").length;
  const pendingBookings = result.db.bookings.filter((entry) => String(entry.status || "Pending").toLowerCase() === "pending").length;
  const newContacts = result.db.contacts.filter((entry) => String(entry.status || "New").toLowerCase() === "new").length;
  const openSupport = result.db.supportRequests.filter((entry) => String(entry.status || "Open").toLowerCase() === "open").length;

  sendJson(res, 200, {
    metrics: {
      bookings,
      contacts,
      supportRequests,
      users,
      pendingBookings,
      newContacts,
      openSupport
    },
    recentBookings: result.db.bookings.slice().reverse().slice(0, 5).map(toPublicBooking),
    recentContacts: result.db.contacts.slice().reverse().slice(0, 5).map(toPublicContact),
    recentSupportRequests: result.db.supportRequests.slice().reverse().slice(0, 5).map(toPublicSupportRequest)
  });
});

app.get("/api/saved-services", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  const savedServices = result.db.savedServices.filter((entry) => entry.userId === result.user.id);
  sendJson(res, 200, { savedServices });
});

app.post("/api/saved-services", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  const serviceId = String(req.body.serviceId || req.body.id || "").trim();
  const serviceTitle = String(req.body.title || req.body.serviceTitle || "").trim();

  if (!serviceId && !serviceTitle) {
    return sendJson(res, 400, { error: "Service id or title is required" });
  }

  const exists = result.db.savedServices.find((entry) => entry.userId === result.user.id && entry.serviceId === serviceId);
  if (exists) {
    return sendJson(res, 200, { savedService: exists });
  }

  const savedService = {
    id: safeId("saved"),
    userId: result.user.id,
    serviceId: serviceId || serviceTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: serviceTitle || serviceId,
    createdAt: nowIso()
  };

  result.db.savedServices.push(savedService);
  await writeDb(result.db);
  sendJson(res, 201, { savedService });
});

app.delete("/api/saved-services/:serviceId", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  const serviceId = String(req.params.serviceId || "").trim();
  const before = result.db.savedServices.length;
  result.db.savedServices = result.db.savedServices.filter((entry) => !(entry.userId === result.user.id && entry.serviceId === serviceId));

  if (before === result.db.savedServices.length) {
    return sendJson(res, 404, { error: "Saved service not found" });
  }

  await writeDb(result.db);
  sendJson(res, 200, { ok: true });
});

app.post("/api/contact", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();

  if (!validateRequired([name, email, subject, message])) {
    return sendJson(res, 400, { error: "Please complete all contact fields" });
  }

  const db = await readDb();
  const contact = {
    id: safeId("contact"),
    name,
    email,
    subject,
    message,
    status: "New",
    createdAt: nowIso()
  };

  db.contacts.push(contact);
  await writeDb(db);

  sendJson(res, 201, { message: "Message received", contact });
});

app.post("/api/support", async (req, res) => {
  const result = await getSessionUser(req);
  const name = String(req.body.name || (result ? result.user.name : "")).trim();
  const email = normalizeEmail(req.body.email || (result ? result.user.email : ""));
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();

  if (!validateRequired([subject, message])) {
    return sendJson(res, 400, { error: "Subject and message are required" });
  }

  const db = result ? result.db : await readDb();
  const supportRequest = {
    id: safeId("support"),
    userId: result ? result.user.id : null,
    name,
    email,
    subject,
    message,
    status: "Open",
    createdAt: nowIso()
  };

  db.supportRequests.push(supportRequest);
  await writeDb(db);

  sendJson(res, 201, { message: "Support request created", supportRequest });
});

app.get("/api/profile", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  sendJson(res, 200, { user: result.user });
});

app.put("/api/profile", async (req, res) => {
  const result = await requireAuth(req, res);
  if (!result) {
    return;
  }

  const name = String(req.body.name || "").trim();
  const email = normalizeEmail(req.body.email);
  const phone = String(req.body.phone || "").trim();

  if (!validateRequired([name, email])) {
    return sendJson(res, 400, { error: "Name and email are required" });
  }

  const duplicate = result.db.users.find((user) => user.id !== result.user.id && normalizeEmail(user.email) === email);
  if (duplicate) {
    return sendJson(res, 409, { error: "Another account already uses that email" });
  }

  const user = result.db.users.find((entry) => entry.id === result.user.id);
  if (!user) {
    return sendJson(res, 404, { error: "User not found" });
  }

  user.name = name;
  user.email = email;
  user.phone = phone;
  await writeDb(result.db);

  sendJson(res, 200, { user: publicUser(user) });
});

// Location-based store endpoints
app.get("/api/location/nearby", async (req, res) => {
  try {
    const result = await readDb();
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
      return sendJson(res, 400, { error: "Latitude and longitude required" });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    // Filter nurseries within radius
    const nearbyNurseries = (result.nurseries || [])
      .map((nursery) => ({
        ...nursery,
        distance: calculateDistance(
          userLat,
          userLng,
          nursery.coordinates.lat,
          nursery.coordinates.lng
        )
      }))
      .filter((n) => n.distance <= parseFloat(radius))
      .sort((a, b) => a.distance - b.distance);

    sendJson(res, 200, { nurseries: nearbyNurseries });
  } catch (error) {
    console.error("Error fetching nearby nurseries:", error);
    sendJson(res, 500, { error: "Failed to fetch nearby nurseries" });
  }
});

app.get("/api/location/products", async (req, res) => {
  try {
    const result = await readDb();
    const { nurseryIds } = req.query;

    if (!nurseryIds) {
      return sendJson(res, 400, { error: "Nursery IDs required" });
    }

    // Split comma-separated string into array
    const ids = typeof nurseryIds === 'string' 
      ? nurseryIds.split(',').map(id => id.trim())
      : (Array.isArray(nurseryIds) ? nurseryIds : [nurseryIds]);

    const products = (result.locationProducts || []).filter((p) =>
      ids.includes(p.nurseryId)
    );

    sendJson(res, 200, { products });
  } catch (error) {
    console.error("Error fetching location-based products:", error);
    sendJson(res, 500, { error: "Failed to fetch products" });
  }
});

app.get("/api/location/nursery/:id", async (req, res) => {
  try {
    const result = await readDb();
    const { id } = req.params;

    const nursery = (result.nurseries || []).find((n) => n.id === id);
    if (!nursery) {
      return sendJson(res, 404, { error: "Nursery not found" });
    }

    const products = (result.locationProducts || []).filter(
      (p) => p.nurseryId === id
    );

    sendJson(res, 200, { nursery, products });
  } catch (error) {
    console.error("Error fetching nursery details:", error);
    sendJson(res, 500, { error: "Failed to fetch nursery details" });
  }
});

if (!IS_SERVERLESS_RUNTIME) {
  app.use(express.static(FRONTEND_DIR, { extensions: ["html"] }));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, "index.html"));
  });
}

async function bootstrap() {
  await ensureDataFile();

  for (const port of PORT_FALLBACKS) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
          console.log(`GreenArch backend running at http://localhost:${port}`);
          console.log(`Serving frontend from ${FRONTEND_DIR}`);
          resolve(server);
        });

        server.on('error', (error) => {
          reject(error);
        });
      });
      return;
    } catch (error) {
      if (!error || error.code !== 'EADDRINUSE') {
        throw error;
      }
    }
  }

  throw new Error('No available port found for GreenArch backend');
}

if (require.main === module && !IS_SERVERLESS_RUNTIME) {
  bootstrap().catch((error) => {
    console.error("Failed to start backend:", error);
    process.exit(1);
  });
}

module.exports = app;
module.exports.bootstrap = bootstrap;
module.exports.IS_SERVERLESS_RUNTIME = IS_SERVERLESS_RUNTIME;
