import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import Stripe from "stripe";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "db.json");
const SECRET = process.env.JWT_SECRET || "ticketx_pro_secure_node_01";

let stripeClient: Stripe | null = null;
// Dummy stripe client if key is missing
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn("STRIPE_SECRET_KEY is missing. Using dummy payment simulator.");
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

// Helper to get dates relative to today
const getRelativeDate = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

// Initial DB state if not exists
const INITIAL_DB = {
  users: [],
  bookings: [],
  events: [
    { id: "e1", title: "Mumbai-Pune Hyperloop", category: "Transportation", location: "Mumbai Terminal", date: getRelativeDate(0), price: 1200, city: "Mumbai", image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800", metadata: { language: 'Telugu' } },
    { id: "e2", title: "The Dark Knight: IMAX", category: "Cinema & Events", location: "Nexus Mall, London", date: getRelativeDate(1), price: 450, city: "London", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800", metadata: { language: 'English' } },
    { id: "e3", title: "Skyloft Penthouse", category: "Stays", location: "Sector 45, Delhi", date: getRelativeDate(15), price: 15000, city: "Delhi", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" },
    { id: "e4", title: "Private Yacht: Thames", category: "Luxury", location: "Greenwich Pier", date: getRelativeDate(5), price: 25000, city: "London", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=800" },
    { id: "e5", title: "Salaar: Part 1", category: "Cinema & Events", location: "G3 Cinema, Narasaraopet", date: getRelativeDate(0), price: 250, city: "Narasaraopet", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800", metadata: { language: 'Telugu' } },
    { id: "e6", title: "Dune: Part Two", category: "Cinema & Events", location: "PVR, Hyderabad", date: getRelativeDate(0), price: 350, city: "Hyderabad", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&q=80&w=800", metadata: { language: 'Hindi' } }
  ],
  notifications: []
};

async function getDB() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch {
    await fs.writeFile(DB_PATH, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
}

async function saveDB(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));

  // --- Auth Middleware ---
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Access Denied" });

    try {
      const verified = jwt.verify(token, SECRET);
      req.user = verified;
      next();
    } catch {
      res.status(400).json({ error: "Invalid Token" });
    }
  };

  // --- Auth Routes ---
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: "Missing required fields: name, email, or password" });
      }

      const db = await getDB();
      if (db.users.find((u: any) => u.email === email)) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = { id: Date.now().toString(), name, email, password: hashedPassword, role: "user" };
      db.users.push(newUser);
      await saveDB(db);

      const token = jwt.sign({ uid: newUser.id, id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, SECRET);
      res.cookie("token", token, { httpOnly: true }).json({ user: { uid: newUser.id, id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role } });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error during registration" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      const db = await getDB();
      const user = db.users.find((u: any) => u.email === email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const validPass = await bcrypt.compare(password, user.password);
      if (!validPass) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ uid: user.id, id: user.id, email: user.email, name: user.name, role: user.role }, SECRET);
      res.cookie("token", token, { httpOnly: true }).json({ user: { uid: user.id, id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error during login" });
    }
  });

  app.get("/api/auth/me", authenticateToken, (req: any, res) => {
    res.json({ user: req.user });
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("token").json({ status: "ok" });
  });

  app.post("/api/auth/firebase-sync", async (req, res) => {
    try {
      const { uid, email, name, photoURL } = req.body;
      if (!uid || !email) return res.status(400).json({ error: "Missing required fields" });

      const db = await getDB();
      let user = db.users.find((u: any) => u.email === email);

      if (!user) {
        // Create user if they don't exist in local DB
        user = { id: uid, name: name || email.split('@')[0], email, photoURL, role: "user" };
        db.users.push(user);
        await saveDB(db);
      } else {
        // Update user if they exist
        user.photoURL = photoURL || user.photoURL;
        user.name = name || user.name;
        await saveDB(db);
      }

      const token = jwt.sign({ uid: user.id, id: user.id, email: user.email, name: user.name, role: user.role, photoURL: user.photoURL }, SECRET);
      res.cookie("token", token, { httpOnly: true }).json({ user: { uid: user.id, id: user.id, name: user.name, email: user.email, role: user.role, photoURL: user.photoURL } });
    } catch (error) {
      console.error("Firebase sync error:", error);
      res.status(500).json({ error: "Internal server error during sync" });
    }
  });

  // --- Inventory Routes ---
  app.get("/api/events", async (req, res) => {
    try {
      const { category, city } = req.query;
      const db = await getDB();
      let results = db.events;
      if (category) results = results.filter((e: any) => e.category === category);
      if (city) results = results.filter((e: any) => e.city === city);
      res.json(results);
    } catch (error) {
      console.error("Fetch events error:", error);
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  // --- Booking Routes ---
  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      let { eventId, seats, amount } = req.body;

      if (!eventId) return res.status(400).json({ error: "Event ID is required" });
      if (!amount) amount = 1; // Fallback to 1 if missing for demo

      // Ensure seats is an array
      if (!seats) seats = ["AUTO"];
      if (typeof seats === 'string') seats = [seats];
      if (!Array.isArray(seats)) seats = ["AUTO"];

      const db = await getDB();
      // More robust event lookup or fallback for demo purposes
      let event = db.events.find((e: any) => e.id === eventId);
      
      // Fallback if not in events list
      if (!event) {
        event = { 
          id: eventId, 
          title: req.body.title || "Premium Cinema/Event",
          category: req.body.category || "Cinema & Events"
        };
      }

      const newBooking = {
        id: "BK" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        userId: req.user.id,
        userEmail: req.user.email,
        eventId,
        eventTitle: event.title,
        category: event.category || req.body.category || "Cinema & Events",
        seats,
        amount,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        metadata: req.body.selection || {}
      };
      
      db.bookings.push(newBooking);
      await saveDB(db);
      
      console.log(`Booking created: ${newBooking.id} for user ${req.user.id}`);
      res.json(newBooking);
    } catch (error) {
      console.error("Booking creation error:", error);
      res.status(500).json({ error: "Internal server error during booking creation" });
    }
  });

  // --- Stripe Payment Routes ---
  app.post("/api/pay/create-intent", authenticateToken, async (req: any, res) => {
    try {
      const { bookingId } = req.body;
      if (!bookingId) return res.status(400).json({ error: "Booking ID is required" });

      const db = await getDB();
      const booking = db.bookings.find((b: any) => b.id === bookingId);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      const stripe = getStripe();
      if (!stripe) {
        return res.json({ 
          clientSecret: `pi_dummy_${Date.now()}_secret_${Math.random().toString(36).substr(2, 8)}`,
          dummy: true 
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.amount * 100), // Stripe expects amount in cents
        currency: "inr",
        metadata: { bookingId: booking.id, userId: req.user.id }
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      console.error("Stripe Intent error:", error);
      res.status(500).json({ error: error.message || "Failed to create payment intent" });
    }
  });

  app.get("/api/bookings/my", authenticateToken, async (req: any, res) => {
    try {
      const db = await getDB();
      const myBookings = db.bookings.filter((b: any) => b.userId === req.user.id);
      res.json(myBookings);
    } catch (error) {
      console.error("Fetch my bookings error:", error);
      res.status(500).json({ error: "Failed to fetch your bookings" });
    }
  });

  // --- Payment Simulation ---
  app.post("/api/pay/verify", authenticateToken, async (req: any, res) => {
    try {
      const { bookingId } = req.body;
      
      if (!bookingId) {
        return res.status(400).json({ error: "Booking ID is required" });
      }

      const db = await getDB();
      let booking = db.bookings.find((b: any) => b.id === bookingId);
      
      if (!booking) {
        // demo fallback: continue if booking was theoretically created
        console.warn(`Booking ${bookingId} not found during verification. Fallback for demo.`);
        return res.json({ 
          success: true, 
          txnId: "TXN_FB_" + Math.random().toString(36).substring(2, 8).toUpperCase() 
        });
      }

      if (booking.status === "CONFIRMED") {
        return res.status(400).json({ error: "Booking is already confirmed" });
      }

      // Update booking status
      booking.status = "CONFIRMED";
      booking.txnId = "TXN_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      booking.updatedAt = new Date().toISOString();
      
      // Add internal notification
      db.notifications.push({
        id: "NT" + Date.now().toString(),
        userId: req.user.id,
        title: "Booking Confirmed",
        message: `Your booking ${booking.id} for ${booking.eventTitle} is verified.`,
        createdAt: new Date().toISOString()
      });

      await saveDB(db);
      
      console.log(`Payment verified and booking confirmed: ${booking.id}`);

      res.json({ 
        success: true, 
        txnId: booking.txnId,
        booking 
      });
    } catch (error) {
      console.error("Payment verification internal error:", error);
      res.status(500).json({ error: "Internal server error during verification" });
    }
  });

  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const db = await getDB();
      const myNotifs = db.notifications.filter((n: any) => n.userId === req.user.id);
      res.json(myNotifs);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  // --- Vite & Production SPA ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`TicketX Pro [INDEPENDENT] running on http://localhost:${PORT}`);
  });
}

startServer();
