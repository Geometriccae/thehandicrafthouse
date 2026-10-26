import dotenv from "dotenv";
dotenv.config();

import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

import mongoose from "mongoose";
import { User } from "../models/User.js";
import { Category } from "../models/Category.js";
import { Collection } from "../models/Collection.js";
import { Product } from "../models/Product.js";
import { Setting } from "../models/Setting.js";

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/handicrafthouse";

  try {
    console.log("[Seed] Connecting to MongoDB...");
    await mongoose.connect(uri, {
      dbName: "handicrafthouse",
    });
    console.log(`[Seed] Connected successfully to database: ${mongoose.connection.name}`);

    // 1. Seed Admin User
    const adminEmail = "admin@thehandicrafthouse.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: "Store Administrator",
        email: adminEmail,
        password: "admin123", // Will be hashed by pre-save hook
        role: "admin",
        status: "active",
        phone: "+91 98765 43210",
      });
      console.log(`[Seed] Created admin account: ${adminEmail} (password: admin123)`);
    } else {
      console.log(`[Seed] Admin user already exists: ${adminEmail}`);
    }

    // 2. Seed Default Categories
    const categoriesData = [
      {
        name: "Bamboo & Cane",
        slug: "bamboo-cane",
        blurb: "Sustainably harvested bamboo and cane homeware, hand-plaited by rural master artisans.",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Brass & Metalcraft",
        slug: "brass-metalcraft",
        blurb: "Hand-cast heirloom brassware and antique artifacts using traditional lost-wax casting.",
        image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Handwoven Textiles",
        slug: "handwoven-textiles",
        blurb: "Organic cotton and tussar silk textiles, tapestries, and runners created on wooden pit-looms.",
        image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Terracotta & Pottery",
        slug: "terracotta-pottery",
        blurb: "Hand-thrown earthen clay pots, glazed terracotta vases, and sustainable kitchenware.",
        image: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&q=80&w=800",
      },
      {
        name: "Wooden Crafts",
        slug: "wooden-crafts",
        blurb: "Carved teak, rosewood, and sheesham pieces sculpted with heritage Indian motifs.",
        image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
      },
    ];

    const categoryMap = new Map<string, string>();
    for (const cat of categoriesData) {
      let created = await Category.findOne({ slug: cat.slug });
      if (!created) {
        created = await Category.create(cat);
        console.log(`[Seed] Created category: ${cat.name}`);
      }
      categoryMap.set(cat.slug, created._id.toString());
    }

    // 3. Collections (starts clean for user data)
    // 4. Products (starts clean for user data)

    // 5. Seed Default Settings
    const existingSettings = await Setting.findOne();
    if (!existingSettings) {
      await Setting.create({
        store: {
          name: "The Handicraft House",
          email: "support@thehandicrafthouse.com",
          phone: "+91 98765 00000",
          address: "42 Craft Lane, Indiranagar, Bengaluru, KA 560038",
          currency: "INR",
        },
        admin: {
          name: "Store Administrator",
          email: "admin@thehandicrafthouse.com",
        },
        shipping: {
          freeAbove: 2500,
          flatRate: 150,
          estimatedDays: "3-5 business days",
        },
        payment: {
          razorpayEnabled: true,
          upiEnabled: true,
          codEnabled: true,
        },
        notifications: {
          newOrderEmail: true,
          lowStockEmail: true,
          paymentFailedEmail: true,
        },
      });
      console.log("[Seed] Default store settings created.");
    }

    console.log("[Seed] All database seeds finished successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seed] Error during seeding:", error);
    process.exit(1);
  }
}

seed();
