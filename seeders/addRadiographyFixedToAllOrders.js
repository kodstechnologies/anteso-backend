import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "../src/models/order.model.js";
import Machine from "../src/models/machine.model.js";
import Service from "../src/models/Services.js";

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
const MACHINE_TYPE = "Radiography (Fixed)";
const BATCH_SIZE = 200;

const addRadiographyFixedToAllOrders = async () => {
    try {
        await mongoose.connect(MONGODB_URL);
        console.log("✅ Connected to MongoDB");

        const orders = await Order.find({})
            .populate({ path: "services", select: "machineType" })
            .lean();

        console.log(`📋 Found ${orders.length} orders`);

        const ordersNeedingMachine = orders.filter((order) =>
            !(order.services || []).some((service) => service?.machineType === MACHINE_TYPE)
        );

        console.log(`🎯 Orders missing Radiography (Fixed): ${ordersNeedingMachine.length}`);
        console.log(`⏭️  Already have it: ${orders.length - ordersNeedingMachine.length}`);

        let created = 0;
        let errors = 0;

        for (let i = 0; i < ordersNeedingMachine.length; i += BATCH_SIZE) {
            const batch = ordersNeedingMachine.slice(i, i + BATCH_SIZE);
            const machines = [];
            const services = [];
            const orderUpdates = [];

            for (const order of batch) {
                const serialBase = String(order.srfNumber || order._id).replace(/\//g, "-");
                const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

                const machine = new Machine({
                    machineType: MACHINE_TYPE,
                    make: "Generic Make",
                    model: "Generic Model",
                    serialNumber: `SN-RF-${serialBase}-${stamp}`,
                    equipmentId: `EQ-RF-${serialBase}-${stamp}`,
                    qaValidity: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    licenseValidity: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    status: "Active",
                    hospital: order.hospital || undefined,
                });

                const service = new Service({
                    machineType: MACHINE_TYPE,
                    quantity: 1,
                    price: 0,
                    equipmentNo: machine.equipmentId,
                    machineModel: machine.model,
                    serialNumber: machine.serialNumber,
                    workTypeDetails: [
                        {
                            workType: "Quality Assurance Test",
                            serviceName: "QA Test",
                            status: "pending",
                            price: 0,
                        },
                    ],
                    status: "pending",
                    totalAmount: 0,
                });

                machines.push(machine);
                services.push(service);
                orderUpdates.push({
                    updateOne: {
                        filter: { _id: order._id },
                        update: { $push: { services: service._id } },
                    },
                });
            }

            try {
                await Machine.insertMany(machines, { ordered: false });
                await Service.insertMany(services, { ordered: false });
                await Order.bulkWrite(orderUpdates, { ordered: false });
                created += batch.length;
                console.log(`  🔧 Added Radiography (Fixed) to ${created}/${ordersNeedingMachine.length} orders...`);
            } catch (error) {
                errors += batch.length;
                console.error(`❌ Batch failed at offset ${i}:`, error.message);
            }
        }

        console.log("\n📊 Summary:");
        console.log(`   ✅ Added: ${created}`);
        console.log(`   ⏭️  Already had Radiography (Fixed): ${orders.length - ordersNeedingMachine.length}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   📦 Total orders: ${orders.length}`);

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Script failed:", error);
        process.exit(1);
    }
};

addRadiographyFixedToAllOrders();
