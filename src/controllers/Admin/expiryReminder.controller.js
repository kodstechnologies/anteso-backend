import mongoose from "mongoose";
import { asyncHandler } from "../../utils/AsyncHandler.js";
import ExpiryReminder from "../../models/expiryReminders/expiryReminder.model.js";
import Services from "../../models/Services.js";
import orderModel from "../../models/order.model.js";
import QATest from "../../models/QATest.model.js";
import Elora from "../../models/elora.model.js";
import ServiceReport from "../../models/serviceReports/serviceReport.model.js";
import LeadApronServiceReport from "../../models/serviceReports/leadApronServiceReport.model.js";

const LICENSE_WORK_TYPES = [
    "license for operation",
    "licence of operation",
    "license of operation",
    "licence for operation",
];

const startOfDay = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const endOfDay = (date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
};

const subtractMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() - months);
    return d;
};

const daysUntil = (expiryDate, fromDate) => {
    const ms = startOfDay(expiryDate).getTime() - startOfDay(fromDate).getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const getExpiryWindow = () => {
    const today = startOfDay(new Date());
    const until = endOfDay(addMonths(today, 1));
    return { today, until };
};

const toObjectId = (value) => {
    if (!value) return null;
    const id = value._id || value;
    return mongoose.Types.ObjectId.isValid(id) ? String(id) : null;
};

const buildOrderMap = async (serviceIds) => {
    if (!serviceIds.length) return new Map();
    const orders = await orderModel
        .find({ services: { $in: serviceIds } })
        .select("srfNumber hospitalName contactNumber services")
        .lean();
    const map = new Map();
    for (const order of orders) {
        for (const serviceId of order.services || []) {
            const key = String(serviceId);
            if (!map.has(key)) {
                map.set(key, order);
            }
        }
    }
    return map;
};

const upsertReminder = async (doc) => {
    const filter = {
        type: doc.type,
        service: doc.service,
        qaTest: doc.qaTest || null,
        elora: doc.elora || null,
    };
    return ExpiryReminder.findOneAndUpdate(
        filter,
        {
            $set: {
                ...doc,
                reminderDate: subtractMonths(doc.expiryDate, 1),
                status: doc.expiryDate < startOfDay(new Date()) ? "expired" : "pending",
            },
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
    );
};

const collectQaReminders = async ({ today, until }) => {
    const [qaReports, leadApronReports] = await Promise.all([
        ServiceReport.find({
            testDueDate: { $gte: today, $lte: until },
            serviceId: { $ne: null },
        })
            .select("serviceId testDueDate testDate testReportNumber srfNumber customerName")
            .lean(),
        LeadApronServiceReport.find({
            testDueDate: { $gte: today, $lte: until },
            serviceId: { $ne: null },
        })
            .select("serviceId testDueDate testDate testReportNumber srfNumber customerName")
            .lean(),
    ]);

    const reportRows = [
        ...qaReports.map((row) => ({ ...row, serviceReportModel: "ServiceReport" })),
        ...leadApronReports.map((row) => ({ ...row, serviceReportModel: "LeadApronServiceReport" })),
    ];

    const serviceIds = [...new Set(reportRows.map((row) => String(row.serviceId)).filter(Boolean))];
    if (!serviceIds.length) return [];

    const [services, orderMap] = await Promise.all([
        Services.find({ _id: { $in: serviceIds } }).lean(),
        buildOrderMap(serviceIds),
    ]);
    const serviceMap = new Map(services.map((service) => [String(service._id), service]));

    const qaTestIds = [];
    for (const service of services) {
        for (const work of service.workTypeDetails || []) {
            const qaId = toObjectId(work.QAtest);
            if (qaId) qaTestIds.push(qaId);
        }
    }

    const qaTests = qaTestIds.length
        ? await QATest.find({ _id: { $in: qaTestIds }, reportPdf: { $nin: [null, ""] } })
            .select("reportPdf qaTestReportNumber reportULRNumber")
            .lean()
        : [];
    const qaTestMap = new Map(qaTests.map((qa) => [String(qa._id), qa]));

    const reminders = [];
    for (const report of reportRows) {
        const service = serviceMap.get(String(report.serviceId));
        if (!service) continue;

        const qaWork = (service.workTypeDetails || []).find((work) => work.QAtest);
        const qaId = toObjectId(qaWork?.QAtest);
        const qaTest = qaId ? qaTestMap.get(qaId) : null;
        if (!qaTest?.reportPdf) continue;

        const order = orderMap.get(String(service._id));
        reminders.push({
            type: "qa",
            order: order?._id || null,
            service: service._id,
            qaTest: qaTest._id,
            elora: null,
            serviceReport: report._id,
            serviceReportModel: report.serviceReportModel,
            srfNumber: order?.srfNumber || report.srfNumber || "",
            hospitalName: order?.hospitalName || report.customerName || "",
            contactNumber: order?.contactNumber || "",
            machineType: service.machineType || "",
            workType: qaWork?.workType || "Quality Assurance Test",
            expiryDate: report.testDueDate,
            reportPdf: qaTest.reportPdf,
            report: null,
        });
    }
    return reminders;
};

const collectLicenseReminders = async ({ today, until }) => {
    const services = await Services.find({
        workTypeDetails: {
            $elemMatch: {
                licenseValidTill: { $gte: today, $lte: until },
                elora: { $ne: null },
            },
        },
    }).lean();

    if (!services.length) return [];

    const serviceIds = services.map((service) => service._id);
    const eloraIds = [];
    for (const service of services) {
        for (const work of service.workTypeDetails || []) {
            const eloraId = toObjectId(work.elora);
            if (eloraId) eloraIds.push(eloraId);
        }
    }

    const [orderMap, eloras] = await Promise.all([
        buildOrderMap(serviceIds),
        eloraIds.length
            ? Elora.find({ _id: { $in: eloraIds }, report: { $nin: [null, ""] } })
                .select("report qaTestReportNumber reportULRNumber")
                .lean()
            : [],
    ]);
    const eloraMap = new Map(eloras.map((elora) => [String(elora._id), elora]));

    const reminders = [];
    for (const service of services) {
        const order = orderMap.get(String(service._id));
        for (const work of service.workTypeDetails || []) {
            const workName = String(work.workType || "").toLowerCase().trim();
            const isLicense = !work.workType || LICENSE_WORK_TYPES.includes(workName);
            if (!isLicense || !work.licenseValidTill) continue;

            const till = new Date(work.licenseValidTill);
            if (till < today || till > until) continue;

            const eloraId = toObjectId(work.elora);
            const elora = eloraId ? eloraMap.get(eloraId) : null;
            if (!elora?.report) continue;

            reminders.push({
                type: "license",
                order: order?._id || null,
                service: service._id,
                qaTest: null,
                elora: elora._id,
                serviceReport: null,
                serviceReportModel: undefined,
                srfNumber: order?.srfNumber || "",
                hospitalName: order?.hospitalName || "",
                contactNumber: order?.contactNumber || "",
                machineType: service.machineType || "",
                workType: work.workType || "License for Operation",
                expiryDate: work.licenseValidTill,
                reportPdf: null,
                report: elora.report,
            });
        }
    }
    return reminders;
};

const shapeReminder = (doc, today) => {
    const expiryDate = doc.expiryDate;
    return {
        _id: doc._id,
        type: doc.type,
        orderId: doc.order,
        serviceId: doc.service,
        qaTestId: doc.qaTest,
        eloraId: doc.elora,
        srfNumber: doc.srfNumber,
        hospitalName: doc.hospitalName,
        contactNumber: doc.contactNumber || "",
        machineType: doc.machineType,
        workType: doc.workType,
        expiryDate,
        reminderDate: doc.reminderDate || (expiryDate ? subtractMonths(expiryDate, 1) : null),
        daysRemaining: expiryDate ? daysUntil(expiryDate, today) : null,
        reportPdf: doc.type === "qa" ? doc.reportPdf : null,
        report: doc.type === "license" ? doc.report : null,
        status: doc.status,
    };
};

/**
 * Once expiryDate is before today, mark those reminder docs as expired
 * so they no longer appear in the active list.
 */
const markPastRemindersExpired = async (today) => {
    await ExpiryReminder.updateMany(
        {
            expiryDate: { $lt: today },
            status: { $ne: "expired" },
        },
        { $set: { status: "expired" } }
    );
};

const isStillActive = (expiryDate, today) => {
    if (!expiryDate) return false;
    return startOfDay(expiryDate).getTime() >= startOfDay(today).getTime();
};

/**
 * GET /expiry-reminders?type=qa|license|all
 * QA: QATest.reportPdf when ServiceReport.testDueDate is within 1 month
 * License: Elora.report when licenseValidTill is within 1 month
 * Records automatically leave the list the day after expiryDate.
 */
export const getExpiryReminders = asyncHandler(async (req, res) => {
    try {
        const type = String(req.query.type || "all").toLowerCase().trim();
        if (!["qa", "license", "all"].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "type must be qa, license, or all",
            });
        }

        const { today, until } = getExpiryWindow();
        const includeQa = type === "all" || type === "qa";
        const includeLicense = type === "all" || type === "license";

        // Drop past-due rows from the active list automatically
        await markPastRemindersExpired(today);

        const [qaDocs, licenseDocs] = await Promise.all([
            includeQa ? collectQaReminders({ today, until }) : [],
            includeLicense ? collectLicenseReminders({ today, until }) : [],
        ]);

        const saved = await Promise.all(
            [...qaDocs, ...licenseDocs].map((doc) => upsertReminder(doc))
        );

        // Never return rows whose expiry date has already passed
        const data = saved
            .map((doc) => shapeReminder(doc.toObject ? doc.toObject() : doc, today))
            .filter((item) => isStillActive(item.expiryDate, today) && item.status !== "expired")
            .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

        return res.status(200).json({
            success: true,
            message: "Expiry reminders fetched successfully",
            from: today,
            until,
            count: data.length,
            qaCount: data.filter((item) => item.type === "qa").length,
            licenseCount: data.filter((item) => item.type === "license").length,
            data: {
                qa: data.filter((item) => item.type === "qa"),
                license: data.filter((item) => item.type === "license"),
                all: data,
            },
        });
    } catch (error) {
        console.error("getExpiryReminders error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch expiry reminders",
        });
    }
});

export default { getExpiryReminders };
