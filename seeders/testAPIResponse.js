import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

const testAPIResponse = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB\n");

        // Test the same query that the API uses
        const orders = await Order.find({})
            .select('srfNumber hospitalName fullAddress city district state pinCode branchName contactPersonName emailAddress contactNumber leadOwner createdAt')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        console.log(`📋 Testing API Response Format (First 10 Orders):\n`);
        console.log(`Found ${orders.length} orders\n`);

        orders.forEach((order, index) => {
            console.log(`\n--- Order ${index + 1} ---`);
            console.log(`SRF Number: ${order.srfNumber}`);
            console.log(`Hospital Name: ${order.hospitalName || '❌ NULL'}`);
            console.log(`Full Address: ${order.fullAddress || '❌ NULL'}`);
            console.log(`City: ${order.city || '❌ NULL'}`);
            console.log(`District: ${order.district || '❌ NULL'}`);
            console.log(`State: ${order.state || '❌ NULL'}`);
            console.log(`PIN Code: ${order.pinCode || '❌ NULL'}`);
            console.log(`Branch Name: ${order.branchName || '❌ NULL'}`);
            console.log(`Contact Person: ${order.contactPersonName || '❌ NULL'}`);
            console.log(`Email: ${order.emailAddress || '❌ NULL'}`);
            console.log(`Contact Number: ${order.contactNumber || '❌ NULL'}`);
            console.log(`Lead Owner: ${order.leadOwner || '❌ NULL'}`);
            
            // Check completeness
            const isComplete = 
                order.hospitalName &&
                order.fullAddress &&
                order.city &&
                order.state &&
                order.pinCode &&
                order.contactPersonName &&
                order.emailAddress &&
                order.contactNumber;
            
            console.log(`Status: ${isComplete ? '✅ COMPLETE' : '❌ INCOMPLETE'}`);
        });

        // Test the getBasicDetailsByOrderId query
        console.log(`\n\n🔍 Testing getBasicDetailsByOrderId Query:\n`);
        
        const testOrder = await Order.findOne({})
            .select('srfNumber leadOwner hospitalName fullAddress city district state pinCode branchName contactPersonName emailAddress contactNumber designation')
            .lean();

        if (testOrder) {
            console.log(`Sample Order: ${testOrder.srfNumber}`);
            console.log(JSON.stringify({
                srfNumber: testOrder.srfNumber,
                hospitalName: testOrder.hospitalName,
                fullAddress: testOrder.fullAddress,
                city: testOrder.city,
                district: testOrder.district,
                state: testOrder.state,
                pinCode: testOrder.pinCode,
                branchName: testOrder.branchName,
                contactPersonName: testOrder.contactPersonName,
                emailAddress: testOrder.emailAddress,
                contactNumber: testOrder.contactNumber,
                leadOwner: testOrder.leadOwner,
                designation: testOrder.designation
            }, null, 2));
        }

        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Test failed:", error);
        process.exit(1);
    }
};

testAPIResponse();
