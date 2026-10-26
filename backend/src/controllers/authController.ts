import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import type { AuthRequest } from "../middleware/auth.js";

const JWT_SECRET = process.env.JWT_SECRET || "thh_super_secret_jwt_key_handicraft_2026";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function generateToken(id: string, email: string, role: "customer" | "admin") {
  return jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export async function adminLogin(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  // Allow default demo credentials or database user
  if (cleanEmail === "admin@thehandicrafthouse.com" && password === "bamboo2026") {
    let adminUser = await User.findOne({ email: cleanEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: "Store Admin",
        email: cleanEmail,
        password,
        role: "admin",
        status: "active",
      });
    }

    const token = generateToken(adminUser._id.toString(), adminUser.email, "admin");
    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: "admin",
      },
    });
    return;
  }

  // Lookup in database
  const user = await User.findOne({ email: cleanEmail, role: "admin" }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: "Invalid admin credentials" });
    return;
  }

  const token = generateToken(user._id.toString(), user.email, "admin");
  res.json({
    success: true,
    message: "Admin login successful",
    token,
    admin: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: "admin",
    },
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ success: false, message: "Name, email, and password are required" });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = await User.findOne({ email: cleanEmail });
  if (existing) {
    res.status(409).json({ success: false, message: "User with this email already exists" });
    return;
  }

  const user = await User.create({
    name: name.trim(),
    email: cleanEmail,
    password,
    phone: phone || "",
    role: "customer",
    status: "active",
  });

  const token = generateToken(user._id.toString(), user.email, "customer");
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required" });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  const token = generateToken(user._id.toString(), user.email, user.role);
  res.json({
    success: true,
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      cart: user.cart,
      wishlistProductIds: user.wishlistProductIds,
    },
  });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      cart: user.cart,
      wishlistProductIds: user.wishlistProductIds,
      joinedAt: user.joinedAt,
    },
  });
}
