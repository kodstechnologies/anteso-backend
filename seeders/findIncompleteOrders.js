import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const findIncompleteOrders = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        // Find orders with missing or empty basic details
        const incompleteOrders = await Order.find({
            $or: [
                { hospitalName: { $in: [null, '', undefined] } },
                { fullAddress: { $in: [null, '', undefined] } },
                { city: { $in: [null, '', undefined] } },
                { state: { $in: [null, '', undefined] } },
                { pinCode: { $in: [null, '', undefined] } },
                { contactPersonName: { $in: [null, '', undefined] } },
                { emailAddress: { $in: [null, '', undefined] } },
                { contactNumber: { $in: [null, '', undefined] } }
            ]
        })
        .select('srfNumber hospitalName fullAddress city state pinCode contactPersonName emailAddress contactNumber')
        .limit(20)
        .lean();

        console.log(`❌ Found ${incompleteOrders.length} orders with incomplete details:\n`);

        incompleteOrders.forEach((order, index) => {
            console.log(`\n--- Order ${index + 1}: ${order.srfNumber} ---`);
            console.log(`Hospital Name: ${order.hospitalName || '❌ MISSING'}`);
            console.log(`Full Address: ${order.fullAddress || '❌ MISSING'}`);
            console.log(`City: ${order.city || '❌ MISSING'}`);
            console.log(`State: ${order.state || '❌ MISSING'}`);
            console.log(`PIN Code: ${order.pinCode || '❌ MISSING'}`);
            console.log(`Contact Person: ${order.contactPersonName || '❌ MISSING'}`);
            console.log(`Email: ${order.emailAddress || '❌ MISSING'}`);
            console.log(`Contact Number: ${order.contactNumber || '❌ MISSING'}`);
        });

        // Get counts by missing field
        console.log(`\n\n📊 Missing Field Statistics:`);
        
        const missingHospitalName = await Order.countDocuments({ 
            hospitalName: { $in: [null, '', undefined] } 
        });
        const missingAddress = await Order.countDocuments({ 
            fullAddress: { $in: [null, '', undefined] } 
        });
        const missingCity = await Order.countDocuments({ 
            city: { $in: [null, '', undefined] } 
        });
        const missingState = await Order.countDocuments({ 
            state: { $in: [null, '', undefined] } 
        });
        const missingPinCode = await Order.countDocuments({ 
            pinCode: { $in: [null, '', undefined] } 
        });
        const missingContactPerson = await Order.countDocuments({ 
            contactPersonName: { $in: [null, '', undefined] } 
        });
        const missingEmail = await Order.countDocuments({ 
            emailAddress: { $in: [null, '', undefined] } 
        });
        const missingContactNumber = await Order.countDocuments({ 
            contactNumber: { $in: [null, '', undefined] } 
        });

        console.log(`Missing Hospital Name: ${missingHospitalName}`);
        console.log(`Missing Full Address: ${missingAddress}`);
        console.log(`Missing City: ${missingCity}`);
        console.log(`Missing State: ${missingState}`);
        console.log(`Missing PIN Code: ${missingPinCode}`);
        console.log(`Missing Contact Person: ${missingContactPerson}`);
        console.log(`Missing Email: ${missingEmail}`);
        console.log(`Missing Contact Number: ${missingContactNumber}`);

        // Check total orders
        const totalOrders = await Order.countDocuments({});
        console.log(`\n📦 Total Orders in Database: ${totalOrders}`);

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Check failed:", error);
        process.exit(1);
    }
};

findIncompleteOrders();
