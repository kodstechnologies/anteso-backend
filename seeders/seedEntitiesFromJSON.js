import mongoose from "mongoose";
import dotenv from "dotenv";
import Manufacturer from "../src/models/manufacturer.model.js";
import Dealer from "../src/models/dealer.model.js";
import Employee from "../src/models/technician.model.js";
import Client from "../src/models/client.model.js";
import Hospital from "../src/models/hospital.model.js";
import User from "../src/models/user.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URL = process.env.MONGODB_URL;

console.log("🚀 ~ MONGODB_URL:", MONGODB_URL);

const seedEntitiesFromJSON = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        // Read the JSON file
        const jsonPath = path.join(__dirname, "../jsons/orders-export-06-07-2026.json");
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

        console.log(`📦 Found ${jsonData.length} orders in JSON to process\n`);

        // Track statistics
        let stats = {
            manufacturers: { created: 0, skipped: 0, errors: 0 },
            dealers: { created: 0, skipped: 0, errors: 0 },
            employees: { created: 0, skipped: 0, errors: 0 },
            clients: { created: 0, skipped: 0, errors: 0 },
            hospitals: { created: 0, skipped: 0, errors: 0 }
        };

        // Create maps to track unique entities
        const manufacturerMap = new Map();
        const dealerMap = new Map();
        const employeeMap = new Map();
        const clientMap = new Map();

        // Counter for generating unique phone numbers
        let phoneCounter = 1000000000;

        // Helper function to generate unique phone number
        const getUniquePhone = (mobile) => {
            if (mobile && mobile !== "NA" && mobile.toString().trim() !== "") {
                return mobile.toString().trim();
            }
            phoneCounter++;
            return phoneCounter.toString();
        };

        // Helper function to generate unique email
        const getUniqueEmail = (email, name, type) => {
            if (email && email !== "NA" && email.toString().trim() !== "") {
                return email.toString().trim();
            }
            const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const timestamp = Date.now();
            return `${cleanName}_${timestamp}@${type}.com`;
        };

        // Process each order
        for (let i = 0; i < jsonData.length; i++) {
            const orderData = jsonData[i];
            // Convert type to lowercase for consistent comparison
            const type = (orderData["Type"] || "").toString().trim().toLowerCase();
            const leadOwner = orderData["Lead Owner"];

            if (!leadOwner) continue;

            try {
                if (type === "manufacturer") {
                    // Check if already processed
                    if (manufacturerMap.has(leadOwner)) {
                        stats.manufacturers.skipped++;
                        continue;
                    }

                    // Check if exists in DB
                    const existing = await User.findOne({ 
                        name: leadOwner,
                        role: "Manufacturer"
                    });

                    if (existing) {
                        manufacturerMap.set(leadOwner, existing._id);
                        stats.manufacturers.skipped++;
                        continue;
                    }

                    // Create manufacturer
                    const manufacturer = new Manufacturer({
                        name: leadOwner,
                        email: getUniqueEmail(orderData["Customer Email"], leadOwner, "manufacturer"),
                        phone: getUniquePhone(orderData["Customer Mobile"]),
                        pincode: orderData["Pin"]?.toString(),
                        address: orderData["Address"],
                        city: orderData["City"],
                        state: orderData["State"],
                        branch: orderData["Branch Name"]
                    });

                    await manufacturer.save();
                    manufacturerMap.set(leadOwner, manufacturer._id);
                    stats.manufacturers.created++;

                    if (stats.manufacturers.created % 10 === 0) {
                        console.log(`✅ Created ${stats.manufacturers.created} manufacturers...`);
                    }
                }
                else if (type === "dealer") {
                    // Check if already processed
                    if (dealerMap.has(leadOwner)) {
                        stats.dealers.skipped++;
                        continue;
                    }

                    // Check if exists in DB
                    const existing = await User.findOne({ 
                        name: leadOwner,
                        role: "Dealer"
                    });

                    if (existing) {
                        dealerMap.set(leadOwner, existing._id);
                        stats.dealers.skipped++;
                        continue;
                    }

                    // Create dealer
                    const dealer = new Dealer({
                        name: leadOwner,
                        email: getUniqueEmail(orderData["Customer Email"], leadOwner, "dealer"),
                        phone: getUniquePhone(orderData["Customer Mobile"]),
                        pincode: orderData["Pin"]?.toString(),
                        address: orderData["Address"],
                        city: orderData["City"],
                        state: orderData["State"],
                        branch: orderData["Branch Name"]
                    });

                    await dealer.save();
                    dealerMap.set(leadOwner, dealer._id);
                    stats.dealers.created++;

                    if (stats.dealers.created % 10 === 0) {
                        console.log(`✅ Created ${stats.dealers.created} dealers...`);
                    }
                }
                else if (type === "employee") {
                    // Check if already processed
                    if (employeeMap.has(leadOwner)) {
                        stats.employees.skipped++;
                        continue;
                    }

                    // Check if exists in DB
                    const existing = await User.findOne({ 
                        name: leadOwner,
                        role: "Employee"
                    });

                    if (existing) {
                        employeeMap.set(leadOwner, existing._id);
                        stats.employees.skipped++;
                        continue;
                    }

                    // Create employee (all as engineers as per requirement)
                    const employee = new Employee({
                        name: leadOwner,
                        email: getUniqueEmail(orderData["Customer Email"], leadOwner, "employee"),
                        phone: getUniquePhone(orderData["Customer Mobile"]),
                        technicianType: "engineer",
                        designation: "Engineer",
                        department: "Technical",
                        dateOfJoining: new Date(),
                        workingDays: 0
                    });

                    await employee.save();
                    employeeMap.set(leadOwner, employee._id);
                    stats.employees.created++;

                    if (stats.employees.created % 10 === 0) {
                        console.log(`✅ Created ${stats.employees.created} employees...`);
                    }
                }
                else if (type === "na" || !type) {
                    // Check if already processed
                    if (clientMap.has(leadOwner)) {
                        stats.clients.skipped++;
                        
                        // Still need to create hospital if institute name exists
                        const instituteName = orderData["Institute Name"];
                        if (instituteName) {
                            const existingHospital = await Hospital.findOne({ name: instituteName });
                            if (!existingHospital) {
                                const client = await User.findOne({ 
                                    name: leadOwner,
                                    role: "Customer"
                                });

                                if (client) {
                                    const hospital = new Hospital({
                                        name: instituteName,
                                        address: orderData["Address"],
                                        phone: getUniquePhone(orderData["Customer Mobile"]),
                                        branch: orderData["Branch Name"],
                                        email: getUniqueEmail(orderData["Customer Email"], instituteName, "hospital"),
                                        customer: client._id
                                    });

                                    await hospital.save();

                                    // Add hospital to client's hospitals array
                                    await Client.findByIdAndUpdate(
                                        client._id,
                                        { $addToSet: { hospitals: hospital._id } }
                                    );

                                    stats.hospitals.created++;
                                }
                            }
                        }
                        continue;
                    }

                    // Check if exists in DB
                    const existing = await User.findOne({ 
                        name: leadOwner,
                        role: "Customer"
                    });

                    if (existing) {
                        clientMap.set(leadOwner, existing._id);
                        stats.clients.skipped++;
                        continue;
                    }

                    // Create client
                    const client = new Client({
                        name: leadOwner,
                        email: getUniqueEmail(orderData["Customer Email"], leadOwner, "client"),
                        phone: getUniquePhone(orderData["Customer Mobile"]),
                        address: orderData["Address"]
                    });

                    await client.save();
                    clientMap.set(leadOwner, client._id);
                    stats.clients.created++;

                    // If institute name exists, create hospital for this client
                    const instituteName = orderData["Institute Name"];
                    if (instituteName) {
                        const existingHospital = await Hospital.findOne({ name: instituteName });
                        
                        if (!existingHospital) {
                            const hospital = new Hospital({
                                name: instituteName,
                                address: orderData["Address"],
                                phone: getUniquePhone(orderData["Customer Mobile"]),
                                branch: orderData["Branch Name"],
                                email: getUniqueEmail(orderData["Customer Email"], instituteName, "hospital"),
                                customer: client._id
                            });

                            await hospital.save();

                            // Add hospital to client's hospitals array
                            client.hospitals.push(hospital._id);
                            await client.save();

                            stats.hospitals.created++;

                            if (stats.hospitals.created % 10 === 0) {
                                console.log(`✅ Created ${stats.hospitals.created} hospitals for clients...`);
                            }
                        }
                    }

                    if (stats.clients.created % 10 === 0) {
                        console.log(`✅ Created ${stats.clients.created} clients...`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing ${leadOwner} (${type}):`, error.message);
                if (type === "manufacturer") stats.manufacturers.errors++;
                else if (type === "dealer") stats.dealers.errors++;
                else if (type === "employee") stats.employees.errors++;
                else stats.clients.errors++;
            }

            // Progress indicator
            if ((i + 1) % 1000 === 0) {
                console.log(`\n📊 Processed ${i + 1}/${jsonData.length} orders...`);
            }
        }

        // Final Summary
        console.log("\n\n" + "=".repeat(60));
        console.log("📊 SEEDING SUMMARY");
        console.log("=".repeat(60));
        
        console.log("\n👥 Manufacturers:");
        console.log(`   ✅ Created: ${stats.manufacturers.created}`);
        console.log(`   ⚠️  Skipped: ${stats.manufacturers.skipped}`);
        console.log(`   ❌ Errors: ${stats.manufacturers.errors}`);
        
        console.log("\n🏢 Dealers:");
        console.log(`   ✅ Created: ${stats.dealers.created}`);
        console.log(`   ⚠️  Skipped: ${stats.dealers.skipped}`);
        console.log(`   ❌ Errors: ${stats.dealers.errors}`);
        
        console.log("\n👔 Employees:");
        console.log(`   ✅ Created: ${stats.employees.created}`);
        console.log(`   ⚠️  Skipped: ${stats.employees.skipped}`);
        console.log(`   ❌ Errors: ${stats.employees.errors}`);
        
        console.log("\n🤝 Clients:");
        console.log(`   ✅ Created: ${stats.clients.created}`);
        console.log(`   ⚠️  Skipped: ${stats.clients.skipped}`);
        console.log(`   ❌ Errors: ${stats.clients.errors}`);
        
        console.log("\n🏥 Hospitals (for clients):");
        console.log(`   ✅ Created: ${stats.hospitals.created}`);
        console.log(`   ⚠️  Skipped: ${stats.hospitals.skipped}`);
        console.log(`   ❌ Errors: ${stats.hospitals.errors}`);
        
        console.log("\n" + "=".repeat(60));
        console.log(`📦 Total Orders Processed: ${jsonData.length}`);
        console.log("=".repeat(60) + "\n");

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedEntitiesFromJSON();
