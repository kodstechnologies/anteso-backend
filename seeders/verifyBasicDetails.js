import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const verifyBasicDetails = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        // Get 5 random sample orders
        const sampleOrders = await Order.aggregate([
            { $match: { srfNumber: /^ABSRF\/2024/ } },
            { $sample: { size: 5 } }
        ]);

        console.log(`📋 Checking ${sampleOrders.length} Random Orders:\n`);

        sampleOrders.forEach((order, index) => {
            console.log(`\n--- Order ${index + 1}: ${order.srfNumber} ---`);
            console.log(`Hospital Name: ${order.hospitalName || '❌ MISSING'}`);
            console.log(`Full Address: ${order.fullAddress || '❌ MISSING'}`);
            console.log(`City: ${order.city || '❌ MISSING'}`);
            console.log(`District: ${order.district || '❌ MISSING'}`);
            console.log(`State: ${order.state || '❌ MISSING'}`);
            console.log(`PIN Code: ${order.pinCode || '❌ MISSING'}`);
            console.log(`Branch Name: ${order.branchName || '❌ MISSING'}`);
            console.log(`Contact Person: ${order.contactPersonName || '❌ MISSING'}`);
            console.log(`Email: ${order.emailAddress || '❌ MISSING'}`);
            console.log(`Contact Number: ${order.contactNumber || '❌ MISSING'}`);
            console.log(`Lead Owner: ${order.leadOwner || '❌ MISSING'}`);
            
            // Check if all required fields are present
            const hasAllFields = 
                order.hospitalName &&
                order.fullAddress &&
                order.city &&
                order.state &&
                order.pinCode &&
                order.contactPersonName &&
                order.emailAddress &&
                order.contactNumber;
            
            console.log(`\nStatus: ${hasAllFields ? '✅ ALL FIELDS PRESENT' : '⚠️  SOME FIELDS MISSING'}`);
        });

        // Check for orders with missing basic details
        const missingDetails = await Order.countDocuments({
            srfNumber: /^ABSRF\/2024/,
            $or: [
                { hospitalName: { $in: [null, ''] } },
                { fullAddress: { $in: [null, ''] } },
                { city: { $in: [null, ''] } },
                { state: { $in: [null, ''] } },
                { pinCode: { $in: [null, ''] } }
            ]
        });

        console.log(`\n\n📊 Summary:`);
        console.log(`Total 2024 Orders: ${await Order.countDocuments({ srfNumber: /^ABSRF\/2024/ })}`);
        console.log(`Orders Missing Basic Details: ${missingDetails}`);
        console.log(`Orders With Complete Details: ${await Order.countDocuments({ srfNumber: /^ABSRF\/2024/ }) - missingDetails}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Verification failed:", error);
        process.exit(1);
    }
};

verifyBasicDetails();
