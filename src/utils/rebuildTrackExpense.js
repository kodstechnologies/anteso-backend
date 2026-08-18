import mongoose from "mongoose";
import tripModel from "../models/trip.model.js";
import expenseModel from "../models/expense.model.js";
import TrackExpense from "../models/trackExpense.model.js";
import Services from "../models/Services.js";
import orderModel from "../models/order.model.js";

const isQaWorkType = (workType = "", serviceName = "") => {
    const wt = String(workType || "").trim().toLowerCase();
    const sn = String(serviceName || "").trim().toLowerCase();
    return (
        wt === "quality assurance test" ||
        wt === "qa test" ||
        sn === "qa test"
    );
};

export const startAndEndOfDay = (date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    return { startOfDay, endOfDay };
};

const toObjectId = (id) =>
    mongoose.Types.ObjectId.isValid(id) ? new mongoose.Types.ObjectId(id) : id;

/**
 * Rebuild TrackExpense for one technician on one calendar day.
 * Money comes from expenses that day. Machines come from QA tests submitted that day.
 */
export const rebuildTrackExpenseForTechnicianDate = async (technicianId, dateInput) => {
    if (!technicianId || !dateInput) return null;

    const { startOfDay, endOfDay } = startAndEndOfDay(dateInput);

    const trips = await tripModel.find({ technician: technicianId }).select("_id").lean();
    const tripIds = trips.map((trip) => trip._id);

    const dayExpenses = tripIds.length
        ? await expenseModel.find({
            trip: { $in: tripIds },
            date: { $gte: startOfDay, $lte: endOfDay },
        }).lean()
        : [];

    if (!dayExpenses.length) {
        await TrackExpense.deleteMany({
            technician: technicianId,
            date: { $gte: startOfDay, $lte: endOfDay },
        });
        return null;
    }

    const totalRequiredAmount = dayExpenses.reduce(
        (sum, exp) => sum + (Number(exp.requiredAmount) || 0),
        0
    );
    const expenseIds = dayExpenses.map((exp) => exp._id);
    const uniqueTripIds = [
        ...new Set(dayExpenses.map((exp) => String(exp.trip)).filter(Boolean)),
    ].map((id) => toObjectId(id));

    const services = await Services.find({
        workTypeDetails: {
            $elemMatch: {
                engineer: toObjectId(technicianId),
                isSubmitted: true,
            },
        },
    })
        .populate("workTypeDetails.QAtest")
        .lean();

    const machineItems = [];
    for (const service of services) {
        const matchingWorkTypes = (service.workTypeDetails || []).filter((wt) => {
            if (String(wt.engineer) !== String(technicianId)) return false;
            if (!wt.isSubmitted) return false;
            if (!isQaWorkType(wt.workType, wt.serviceName)) return false;
            const submittedAt = wt.QAtest?.qatestSubmittedAt;
            if (!submittedAt) return false;
            const submittedDate = new Date(submittedAt);
            return submittedDate >= startOfDay && submittedDate <= endOfDay;
        });

        if (!matchingWorkTypes.length) continue;

        const order = await orderModel.findOne({ services: service._id }).select("_id").lean();
        if (!order) continue;

        machineItems.push({
            orderId: order._id,
            serviceId: service._id,
            machineType: service.machineType,
            technician: toObjectId(technicianId),
            machineCount: Math.max(Number(service.quantity) || 1, 1),
            qaTestDoneAt: matchingWorkTypes[0].QAtest?.qatestSubmittedAt,
        });
    }

    const noOfMachines = machineItems.reduce(
        (sum, item) => sum + (Number(item.machineCount) || 1),
        0
    );
    const cost = noOfMachines > 0 ? Number((totalRequiredAmount / noOfMachines).toFixed(2)) : 0;

    let trackDoc = await TrackExpense.findOne({
        technician: technicianId,
        date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!trackDoc) {
        trackDoc = new TrackExpense({
            technician: technicianId,
            date: startOfDay,
        });
    }

    trackDoc.expenses = expenseIds;
    trackDoc.trips = uniqueTripIds;
    trackDoc.noOfMachines = noOfMachines;
    trackDoc.totalRequiredAmount = totalRequiredAmount;
    trackDoc.cost = cost;
    trackDoc.items = machineItems.map((item) => ({
        ...item,
        expenses: expenseIds,
        trip: uniqueTripIds[0] || null,
        cost,
        totalRequiredAmount,
    }));

    await trackDoc.save();
    await TrackExpense.updateOne(
        { _id: trackDoc._id },
        { $unset: { revenue: 1, "items.$[].revenue": 1, "items.$[].noOfMachines": 1 } }
    );
    return trackDoc;
};
