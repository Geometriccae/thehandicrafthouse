/** MongoDB-ready document shapes for the admin panel. */

export type AdminProductStatus = "active" | "inactive" | "deleted";
export type CraftType = "handwoven" | "handmade" | "machine-finished";
export type OrderStatus =
  | "new"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "deleted";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded" | "cod";
export type PaymentMethod = "razorpay" | "upi" | "card" | "netbanking" | "cod";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";
export type CustomerStatus = "active" | "inactive";

export type AdminCategory = {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type AdminCollection = {
  _id: string;
  name: string;
  slug: string;
  productIds: string[];
  createdAt: string;
};

export type AdminProduct = {
  _id: string;
  name: string;
  description: string;
  categoryId: string;
  collectionIds: string[];
  price: number;
  discountPrice?: number;
  sku: string;
  images: string[];
  stock: number;
  lowStockThreshold: number;
  material: string;
  dimensions: string;
  weight: string;
  color: string;
  ecoFriendly: boolean;
  craftType: CraftType;
  careInstructions: string;
  status: AdminProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
};

export type AdminOrder = {
  _id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  orderStatus: OrderStatus;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: { label: string; at: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomer = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  status: CustomerStatus;
  joinedAt: string;
  addresses: {
    id: string;
    label: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
  }[];
  wishlistProductIds: string[];
};

export type AdminPayment = {
  _id: string;
  transactionId: string;
  orderId: string;
  orderRef: string;
  customerId: string;
  customerName: string;
  amount: number;
  method: PaymentMethod;
  status: Exclude<PaymentStatus, "cod"> | "paid" | "pending" | "failed" | "refunded";
  createdAt: string;
};

export type AdminSettings = {
  store: {
    name: string;
    email: string;
    phone: string;
    address: string;
    currency: string;
  };
  admin: {
    name: string;
    email: string;
  };
  shipping: {
    freeAbove: number;
    flatRate: number;
    estimatedDays: string;
  };
  payment: {
    razorpayEnabled: boolean;
    upiEnabled: boolean;
    codEnabled: boolean;
  };
  notifications: {
    newOrderEmail: boolean;
    lowStockEmail: boolean;
    paymentFailedEmail: boolean;
  };
};

export type AdminState = {
  products: AdminProduct[];
  categories: AdminCategory[];
  collections: AdminCollection[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  payments: AdminPayment[];
  settings: AdminSettings;
};

export type DateRangeKey = "7d" | "30d" | "month" | "year" | "custom";
