import mongoose from "mongoose";
import dns from "node:dns";

// Fix for Windows / local ISPs where default DNS resolver fails SRV records (ECONNREFUSED querySrv)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/handicrafthouse";

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(uri, {
      dbName: "handicrafthouse",
    });
    console.log(`[MongoDB] Connected successfully to database "${mongoose.connection.name}" at: ${uri.replace(/\/\/.*@/, "//***:***@")}`);
  } catch (error) {
    console.error("[MongoDB] Connection error:", error);
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    }
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("[MongoDB] Disconnected from database");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[MongoDB] Reconnected to database");
  });
}
