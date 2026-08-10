import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const checkAllOrders = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        // Get order counts by year
        const orders2024 = await Order.countDocuments({ srfNumber: /^ABSRF\/2024/ });
        const orders2025 = await Order.countDocuments({ srfNumber: /^ABSRF\/2025/ });
        const orders2026 = await Order.countDocuments({ srfNumber: /^ABSRF\/2026/ });
        const ordersOther = await Order.countDocuments({ 
            srfNumber: { $not: /^ABSRF\/(2024|2025|2026)/ } 
        });

        console.log(`📊 Orders by Year:`);
        console.log(`2024: ${orders2024}`);
        console.log(`2025: ${orders2025}`);
        console.log(`2026: ${orders2026}`);
        console.log(`Other: ${ordersOther}`);
        console.log(`Total: ${orders2024 + orders2025 + orders2026 + ordersOther}`);

        // Check 2026 orders for missing details
        console.log(`\n\n🔍 Checking 2026 Orders for Missing Details...`);
        
        const incomplete2026 = await Order.find({
            srfNumber: /^ABSRF\/2026/,
            $or: [
                { hospitalName: { $in: [null, '', undefined] } },
                { fullAddress: { $in: [null, '', undefined] } },
                { city: { $in: [null, '', undefined] } },
                { state: { $in: [null, '', undefined] } },
                { pinCode: { $in: [null, '', undefined] } }
            ]
        })
        .select('srfNumber hospitalName fullAddress city state pinCode')
        .limit(10)
        .lean();

        if (incomplete2026.length > 0) {
            console.log(`❌ Found ${incomplete2026.length} incomplete 2026 orders (showing first 10):\n`);
            incomplete2026.forEach((order, index) => {
                console.log(`${index + 1}. ${order.srfNumber}`);
                console.log(`   Hospital: ${order.hospitalName || '❌ MISSING'}`);
                console.log(`   Address: ${order.fullAddress || '❌ MISSING'}`);
                console.log(`   City: ${order.city || '❌ MISSING'}`);
                console.log(`   State: ${order.state || '❌ MISSING'}`);
                console.log(`   PIN: ${order.pinCode || '❌ MISSING'}\n`);
            });
        } else {
            console.log(`✅ All 2026 orders have complete details`);
        }

        // Check 2025 orders for missing details
        console.log(`\n\n🔍 Checking 2025 Orders for Missing Details...`);
        
        const incomplete2025 = await Order.find({
            srfNumber: /^ABSRF\/2025/,
            $or: [
                { hospitalName: { $in: [null, '', undefined] } },
                { fullAddress: { $in: [null, '', undefined] } },
                { city: { $in: [null, '', undefined] } },
                { state: { $in: [null, '', undefined] } },
                { pinCode: { $in: [null, '', undefined] } }
            ]
        })
        .select('srfNumber hospitalName fullAddress city state pinCode')
        .limit(10)
        .lean();

        if (incomplete2025.length > 0) {
            console.log(`❌ Found ${incomplete2025.length} incomplete 2025 orders (showing first 10):\n`);
            incomplete2025.forEach((order, index) => {
                console.log(`${index + 1}. ${order.srfNumber}`);
                console.log(`   Hospital: ${order.hospitalName || '❌ MISSING'}`);
                console.log(`   Address: ${order.fullAddress || '❌ MISSING'}`);
                console.log(`   City: ${order.city || '❌ MISSING'}`);
                console.log(`   State: ${order.state || '❌ MISSING'}`);
                console.log(`   PIN: ${order.pinCode || '❌ MISSING'}\n`);
            });
        } else {
            console.log(`✅ All 2025 orders have complete details`);
        }

        // Sample a few random orders to verify
        console.log(`\n\n📋 Random Sample (5 orders):`);
        const randomOrders = await Order.aggregate([
            { $sample: { size: 5 } },
            { $project: { 
                srfNumber: 1, 
                hospitalName: 1, 
                fullAddress: 1, 
                city: 1,
                state: 1,
                pinCode: 1,
                contactPersonName: 1,
                emailAddress: 1,
                contactNumber: 1
            }}
        ]);

        randomOrders.forEach((order, index) => {
            console.log(`\n${index + 1}. ${order.srfNumber}`);
            console.log(`   Hospital: ${order.hospitalName || '❌ MISSING'}`);
            console.log(`   Address: ${order.fullAddress || '❌ MISSING'}`);
            console.log(`   City: ${order.city || '❌ MISSING'}`);
            console.log(`   State: ${order.state || '❌ MISSING'}`);
            console.log(`   Contact Person: ${order.contactPersonName || '❌ MISSING'}`);
            console.log(`   Email: ${order.emailAddress || '❌ MISSING'}`);
        });

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Check failed:", error);
        process.exit(1);
    }
};

checkAllOrders();
