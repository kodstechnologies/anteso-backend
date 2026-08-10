import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

console.log("🚀 ~ MONGODB_URL:", MONGODB_URL);

const deleteOldOrders = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        // Delete all orders that start with ABSRF/2024
        const result = await Order.deleteMany({
            srfNumber: { $regex: /^ABSRF\/2024/ }
        });

        console.log(`🗑️  Deleted ${result.deletedCount} orders from 2024`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Deletion failed:", error);
        process.exit(1);
    }
};

deleteOldOrders();
