import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { Order } from "../models/Order.js";

export async function getCustomers(req: Request, res: Response): Promise<void> {
  try {
    const { search, status } = req.query as Record<string, string | undefined>;
    const query: any = { role: "customer" };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search && search.trim() !== "") {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const customers = await User.find(query).sort({ joinedAt: -1 });

    // Aggregate stats for each customer
    const results = await Promise.all(
      customers.map(async (c) => {
        const orders = await Order.find({
          $or: [{ customerId: c._id.toString() }, { customerEmail: c.email }],
          orderStatus: { $ne: "deleted" },
        });
        const totalSpent = orders
          .filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered")
          .reduce((sum, o) => sum + o.total, 0);

        return {
          _id: c._id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          status: c.status,
          joinedAt: c.joinedAt,
          addresses: c.addresses,
          wishlistProductIds: c.wishlistProductIds,
          ordersCount: orders.length,
          totalSpent,
        };
      })
    );

    res.json({ success: true, count: results.length, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getCustomerById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const customer = await User.findById(id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }

    const orders = await Order.find({
      $or: [{ customerId: customer._id.toString() }, { customerEmail: customer.email }],
      orderStatus: { $ne: "deleted" },
    }).sort({ createdAt: -1 });

    const totalSpent = orders
      .filter((o) => o.paymentStatus === "paid" || o.orderStatus === "delivered")
      .reduce((sum, o) => sum + o.total, 0);

    res.json({
      success: true,
      data: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status,
        joinedAt: customer.joinedAt,
        addresses: customer.addresses,
        wishlistProductIds: customer.wishlistProductIds,
        cart: customer.cart,
        orders,
        totalSpent,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function upsertCustomer(req: Request, res: Response): Promise<void> {
  try {
    const { _id, name, email, phone, status, addresses } = req.body;
    if (!name || !email) {
      res.status(400).json({ success: false, message: "Name and email are required" });
      return;
    }

    let customer = null;
    if (_id && _id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await User.findByIdAndUpdate(
        _id,
        { name, email, phone, status, addresses },
        { new: true, runValidators: true }
      );
    } else {
      customer = await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        { name, email: email.toLowerCase(), phone, status: status || "active", addresses },
        { new: true, upsert: true }
      );
    }

    res.json({ success: true, message: "Customer saved", data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteCustomer(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const customer = await User.findByIdAndDelete(id);
    if (!customer) {
      res.status(404).json({ success: false, message: "Customer not found" });
      return;
    }
    res.json({ success: true, message: "Customer deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncCart(req: Request, res: Response): Promise<void> {
  try {
    const { userId, cart } = req.body;
    const user = await User.findByIdAndUpdate(userId, { cart }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: user.cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function syncWishlist(req: Request, res: Response): Promise<void> {
  try {
    const { userId, wishlistProductIds } = req.body;
    const user = await User.findByIdAndUpdate(userId, { wishlistProductIds }, { new: true });
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }
    res.json({ success: true, data: user.wishlistProductIds });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
