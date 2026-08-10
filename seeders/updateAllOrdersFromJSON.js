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

const updateAllOrdersFromJSON = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        // Read the JSON file
        const jsonPath = path.join(__dirname, "../jsons/orders-export-06-07-2026.json");
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        console.log(`📦 Found ${jsonData.length} orders in JSON to process`);

        // Get ALL existing orders at once (not just 2024)
        const existingOrders = await Order.find({}).lean();
        console.log(`📋 Found ${existingOrders.length} existing orders in database`);

        // Create a map for quick lookup
        const orderMap = new Map();
        existingOrders.forEach(order => {
            orderMap.set(order.srfNumber, order);
        });

        let updated = 0;
        let notFound = 0;
        let alreadyComplete = 0;

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

                // Check if order already has complete data
                const hasCompleteData = 
                    existingOrder.hospitalName &&
                    existingOrder.fullAddress &&
                    existingOrder.city &&
                    existingOrder.state &&
                    existingOrder.pinCode &&
                    existingOrder.contactPersonName &&
                    existingOrder.emailAddress &&
                    existingOrder.contactNumber;

                if (hasCompleteData) {
                    alreadyComplete++;
                    // Even if complete, update to ensure consistency
                }

                // Prepare update data with proper mapping
                const updateData = {
                    hospitalName: orderData["Institute Name"],
                    fullAddress: orderData["Address"],
                    district: orderData["District"],
                    state: orderData["State"],
                    city: orderData["City"] || "Unknown",
                    pinCode: orderData["Pin"]?.toString(),
                    branchName: orderData["Branch Name"],
                    contactPersonName: orderData["Institute Name"],
                    contactNumber: orderData["Customer Mobile"] !== "NA" 
                        ? orderData["Customer Mobile"] 
                        : "0000000000",
                    emailAddress: orderData["Customer Email"] !== "NA" 
                        ? orderData["Customer Email"] 
                        : "default@example.com",
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
                    bulkOps.length = 0;
                }

            } catch (error) {
                console.error(`❌ Failed to prepare update for order ${orderData["SRF NO"]}:`, error.message);
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
        console.log(`   ℹ️  Already Complete: ${alreadyComplete}`);
        console.log(`   ⚠️  Not Found: ${notFound}`);
        console.log(`   📦 Total in JSON: ${jsonData.length}`);
        console.log(`   📋 Total in DB: ${existingOrders.length}`);

        // Final verification
        console.log("\n\n🔍 Final Verification...");
        const stillIncomplete = await Order.countDocuments({
            $or: [
                { hospitalName: { $in: [null, '', undefined] } },
                { fullAddress: { $in: [null, '', undefined] } },
                { city: { $in: [null, '', undefined] } },
                { state: { $in: [null, '', undefined] } },
                { pinCode: { $in: [null, '', undefined] } }
            ]
        });

        console.log(`\n📊 Final Status:`);
        console.log(`   Total Orders: ${existingOrders.length}`);
        console.log(`   Incomplete Orders: ${stillIncomplete}`);
        console.log(`   Complete Orders: ${existingOrders.length - stillIncomplete}`);
        console.log(`   Success Rate: ${((existingOrders.length - stillIncomplete) / existingOrders.length * 100).toFixed(2)}%`);

        if (stillIncomplete > 0) {
            console.log(`\n⚠️  Warning: ${stillIncomplete} orders still incomplete`);
            console.log(`These orders might not be in the JSON file.`);
            
            // Show first 5 incomplete orders
            const incompleteList = await Order.find({
                $or: [
                    { hospitalName: { $in: [null, '', undefined] } },
                    { fullAddress: { $in: [null, '', undefined] } },
                    { city: { $in: [null, '', undefined] } },
                    { state: { $in: [null, '', undefined] } },
                    { pinCode: { $in: [null, '', undefined] } }
                ]
            })
            .select('srfNumber hospitalName city state')
            .limit(5)
            .lean();

            console.log(`\nFirst 5 incomplete orders:`);
            incompleteList.forEach((order, idx) => {
                console.log(`${idx + 1}. ${order.srfNumber} - ${order.hospitalName || 'NO NAME'}`);
            });
        } else {
            console.log(`\n✅ All orders have complete basic details!`);
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Update failed:", error);
        process.exit(1);
    }
};

updateAllOrdersFromJSON();
