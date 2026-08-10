import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";
import Hospital from "../src/models/hospital.model.js";
import Machine from "../src/models/machine.model.js";
import Service from "../src/models/Services.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const verifySeededData = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        // Get a sample order with all related data
        const sampleOrder = await Order.findOne({ srfNumber: /^ABSRF\/2024/ })
            .populate('hospital')
            .populate('services')
            .lean();

        if (!sampleOrder) {
            console.log("❌ No sample order found");
            return;
        }

        console.log("📋 Sample Order Details:");
        console.log("SRF Number:", sampleOrder.srfNumber);
        console.log("Hospital Name:", sampleOrder.hospitalName);
        console.log("Full Address:", sampleOrder.fullAddress);
        console.log("City:", sampleOrder.city);
        console.log("State:", sampleOrder.state);
        console.log("PIN Code:", sampleOrder.pinCode);
        console.log("Contact Person:", sampleOrder.contactPersonName);
        console.log("Email:", sampleOrder.emailAddress);
        console.log("Contact Number:", sampleOrder.contactNumber);
        console.log("Lead Owner:", sampleOrder.leadOwner);
        console.log("\n🔧 Services:", sampleOrder.services?.length || 0);
        
        if (sampleOrder.services && sampleOrder.services.length > 0) {
            const service = sampleOrder.services[0];
            console.log("\nService Details:");
            console.log("  Machine Type:", service.machineType);
            console.log("  Equipment No:", service.equipmentNo);
            console.log("  Serial Number:", service.serialNumber);
            console.log("  Status:", service.status);
        }

        // Get machine for this order
        const machine = await Machine.findOne({ 
            hospital: sampleOrder.hospital 
        }).lean();

        if (machine) {
            console.log("\n🔧 Machine Details:");
            console.log("  Machine Type:", machine.machineType);
            console.log("  Make:", machine.make);
            console.log("  Model:", machine.model);
            console.log("  Serial Number:", machine.serialNumber);
            console.log("  Equipment ID:", machine.equipmentId);
            console.log("  Status:", machine.status);
        }

        // Get overall counts
        const orderCount = await Order.countDocuments({ srfNumber: /^ABSRF\/2024/ });
        const machineCount = await Machine.countDocuments({});
        const serviceCount = await Service.countDocuments({});

        console.log("\n📊 Overall Statistics:");
        console.log("  Total Orders (2024):", orderCount);
        console.log("  Total Machines:", machineCount);
        console.log("  Total Services:", serviceCount);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    }
};

verifySeededData();
