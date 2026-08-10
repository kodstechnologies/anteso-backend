import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URL = process.env.MONGODB_URL;

console.log("🚀 ~ MONGODB_URL:", MONGODB_URL);

const updateOrderBasicDetails = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        // Read the JSON file
        const jsonPath = path.join(__dirname, "../jsons/orders-export-06-07-2026.json");
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        console.log(`📦 Found ${jsonData.length} orders in JSON to process`);

        // Get all existing orders at once
        const existingOrders = await Order.find({ srfNumber: /^ABSRF\/2024/ }).lean();
        console.log(`📋 Found ${existingOrders.length} existing orders in database`);

        // Create a map for quick lookup
        const orderMap = new Map();
        existingOrders.forEach(order => {
            orderMap.set(order.srfNumber, order);
        });

        let updated = 0;
        let notFound = 0;
        let errors = 0;

        // Prepare bulk operations
        const bulkOps = [];

        for (let i = 0; i < jsonData.length; i++) {
            const orderData = jsonData[i];
            
            try {
                const existingOrder = orderMap.get(orderData["SRF NO"]);

                if (!existingOrder) {
                    notFound++;
                    continue;
                }

                // Prepare update data with proper mapping
                const updateData = {
                    // Hospital Name → Institute Name
                    hospitalName: orderData["Institute Name"],
                    
                    // Full Address → Address
                    fullAddress: orderData["Address"],
                    
                    // District → District
                    district: orderData["District"],
                    
                    // State → State
                    state: orderData["State"],
                    
                    // City → City
                    city: orderData["City"] || "Unknown",
                    
                    // Pin → PinCode
                    pinCode: orderData["Pin"]?.toString(),
                    
                    // Branch Name → Branch Name
                    branchName: orderData["Branch Name"],
                    
                    // Contact Person → Institute Name (as fallback)
                    contactPersonName: orderData["Institute Name"],
                    
                    // Contact Number → Customer Mobile
                    contactNumber: orderData["Customer Mobile"] !== "NA" 
                        ? orderData["Customer Mobile"] 
                        : "0000000000",
                    
                    // Email Address → Customer Email
                    emailAddress: orderData["Customer Email"] !== "NA" 
                        ? orderData["Customer Email"] 
                        : "default@example.com",
                    
                    // Lead Owner
                    leadOwner: orderData["Lead Owner"],
                };

                // Add to bulk operations
                bulkOps.push({
                    updateOne: {
                        filter: { _id: existingOrder._id },
                        update: { $set: updateData }
                    }
                });

                // Execute bulk operation in batches
                if (bulkOps.length >= 500) {
                    const result = await Order.bulkWrite(bulkOps);
                    updated += result.modifiedCount;
                    console.log(`✅ Updated ${updated} orders...`);
                    bulkOps.length = 0; // Clear array
                }

            } catch (error) {
                console.error(`❌ Failed to prepare update for order ${orderData["SRF NO"]}:`, error.message);
                errors++;
            }
        }

        // Execute remaining bulk operations
        if (bulkOps.length > 0) {
            const result = await Order.bulkWrite(bulkOps);
            updated += result.modifiedCount;
            console.log(`✅ Final batch: Updated ${result.modifiedCount} orders`);
        }

        console.log("\n📊 Update Summary:");
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ⚠️  Not Found: ${notFound}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📦 Total in JSON: ${jsonData.length}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Update failed:", error);
        process.exit(1);
    }
};

updateOrderBasicDetails();
