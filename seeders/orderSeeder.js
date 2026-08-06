import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";
import Hospital from "../src/models/hospital.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URL = process.env.MONGODB_URL;

console.log("🚀 ~ MONGODB_URL:", MONGODB_URL);

const seedOrders = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        // Read the JSON file
        const jsonPath = path.join(__dirname, "../jsons/orders-export-06-07-2026.json");
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        console.log(`📦 Found ${jsonData.length} orders to seed`);

        let created = 0;
        let skipped = 0;
        let errors = 0;

        // Get all existing orders at once for faster lookup
        const existingSRFs = new Set((await Order.find({}, 'srfNumber').lean()).map(o => o.srfNumber));
        console.log(`📋 Found ${existingSRFs.size} existing orders in database`);

        // Cache hospitals for faster lookup
        const hospitalCache = new Map();
        const existingHospitals = await Hospital.find({}).lean();
        existingHospitals.forEach(h => hospitalCache.set(h.name, h._id));

        const BATCH_SIZE = 100;
        const ordersToInsert = [];
        const hospitalsToInsert = [];

        for (let i = 0; i < jsonData.length; i++) {
            const orderData = jsonData[i];
            
            try {
                // Check if order already exists
                if (existingSRFs.has(orderData["SRF NO"])) {
                    skipped++;
                    if (skipped % 500 === 0) {
                        console.log(`⚠️  Skipped ${skipped} existing orders...`);
                    }
                    continue;
                }

                // Find or prepare hospital for creation
                let hospitalId = null;
                const hospitalName = orderData["Institute Name"];
                
                if (hospitalName && !hospitalCache.has(hospitalName)) {
                    // Create hospital document to insert
                    const newHospital = new Hospital({
                        name: hospitalName,
                        email: orderData["Customer Email"] !== "NA" ? orderData["Customer Email"] : undefined,
                        address: orderData["Address"],
                        branch: orderData["Branch Name"],
                        phone: orderData["Customer Mobile"] !== "NA" ? orderData["Customer Mobile"] : undefined,
                    });
                    
                    hospitalsToInsert.push(newHospital);
                    hospitalCache.set(hospitalName, newHospital._id);
                    hospitalId = newHospital._id;
                } else if (hospitalName) {
                    hospitalId = hospitalCache.get(hospitalName);
                }

                // Map JSON fields to Order model fields
                const newOrder = new Order({
                    srfNumber: orderData["SRF NO"],
                    leadOwner: orderData["Lead Owner"],
                    hospitalName: orderData["Institute Name"],
                    fullAddress: orderData["Address"],
                    city: orderData["City"] || "Unknown",
                    district: orderData["District"],
                    state: orderData["State"],
                    pinCode: orderData["Pin"]?.toString(),
                    branchName: orderData["Branch Name"],
                    contactPersonName: orderData["Institute Name"] || "Unknown", // Using Institute Name as fallback
                    emailAddress: orderData["Customer Email"] !== "NA" ? orderData["Customer Email"] : "default@example.com",
                    contactNumber: orderData["Customer Mobile"] !== "NA" ? orderData["Customer Mobile"] : "0000000000",
                    hospital: hospitalId,
                    status: orderData["Status"]?.toLowerCase() === "mailed" ? "pending" : "pending",
                    createdAt: orderData["Created At"] ? new Date(orderData["Created At"]) : new Date(),
                });

                ordersToInsert.push(newOrder);

                // Insert in batches
                if (ordersToInsert.length >= BATCH_SIZE || i === jsonData.length - 1) {
                    // Insert hospitals first
                    if (hospitalsToInsert.length > 0) {
                        await Hospital.insertMany(hospitalsToInsert, { ordered: false });
                        hospitalsToInsert.length = 0;
                    }
                    
                    // Insert orders
                    if (ordersToInsert.length > 0) {
                        try {
                            await Order.insertMany(ordersToInsert, { ordered: false });
                            created += ordersToInsert.length;
                            console.log(`✅ Batch inserted ${ordersToInsert.length} orders (Total: ${created})`);
                        } catch (batchError) {
                            // Handle duplicate key errors
                            if (batchError.code === 11000) {
                                errors += batchError.writeErrors?.length || 0;
                                created += ordersToInsert.length - (batchError.writeErrors?.length || 0);
                                console.log(`⚠️  Batch had ${batchError.writeErrors?.length || 0} duplicates`);
                            } else {
                                throw batchError;
                            }
                        }
                        ordersToInsert.length = 0;
                    }
                }

            } catch (error) {
                console.error(`❌ Failed to process order ${orderData["SRF NO"]}:`, error.message);
                errors++;
            }
        }

        console.log("\n📊 Seeding Summary:");
        console.log(`   ✅ Created: ${created}`);
        console.log(`   ⚠️  Skipped: ${skipped}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📦 Total in JSON: ${jsonData.length}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Order seeding failed:", error);
        process.exit(1);
    }
};

seedOrders();
