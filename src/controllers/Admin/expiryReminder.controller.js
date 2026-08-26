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

/**
 * Calendar day stamp (YYYYMMDD).
 * HTML date inputs are stored as UTC midnight — use UTC parts for those
 * so IST/other timezones do not shift the day and expire licenses early.
 */
const toDayStamp = (date) => {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    const utcDateOnly =
        d.getUTCHours() === 0 &&
        d.getUTCMinutes() === 0 &&
        d.getUTCSeconds() === 0 &&
        d.getUTCMilliseconds() === 0;
    if (utcDateOnly) {
        return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
    }
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const todayDayStamp = () => {
    const d = new Date();
    return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const hasExplicitTime = (value) => {
    if (!value) return false;
    const raw = typeof value === "string" ? value : "";
    if (raw.includes("T")) {
        const timePart = raw.split("T")[1]?.replace("Z", "") || "";
        return !/^00:00(?::00(?:\.000)?)?$/.test(timePart);
    }
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return false;
    return !(
        d.getUTCHours() === 0 &&
        d.getUTCMinutes() === 0 &&
        d.getUTCSeconds() === 0 &&
        d.getUTCMilliseconds() === 0
    );
};

const daysUntil = (expiryDate, fromDate) => {
    const exp = toDayStamp(expiryDate);
    const from = toDayStamp(fromDate);
    if (exp == null || from == null) return null;
    // Approximate day diff from stamps
    const expDate = new Date(Math.floor(exp / 10000), Math.floor((exp % 10000) / 100) - 1, exp % 100);
    const fromD = new Date(Math.floor(from / 10000), Math.floor((from % 10000) / 100) - 1, from % 100);
    return Math.round((expDate.getTime() - fromD.getTime()) / (1000 * 60 * 60 * 24));
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

const isPastDue = (expiryDate) => {
    if (!expiryDate) return false;
    if (hasExplicitTime(expiryDate)) {
        const dt = new Date(expiryDate);
        if (Number.isNaN(dt.getTime())) return false;
        return dt.getTime() < Date.now();
    }
    const exp = toDayStamp(expiryDate);
    const today = todayDayStamp();
    if (exp == null) return false;
    return exp < today;
};

const upsertReminder = async (doc) => {
    const filter = {
        type: doc.type,
        service: doc.service,
        qaTest: doc.qaTest || null,
        elora: doc.elora || null,
    };
    const expired = isPastDue(doc.expiryDate);
    // Avoid writing undefined fields (can break validators / wipe values)
    const payload = {
        type: doc.type,
        order: doc.order || null,
        service: doc.service,
        qaTest: doc.qaTest || null,
        elora: doc.elora || null,
        srfNumber: doc.srfNumber || "",
        hospitalName: doc.hospitalName || "",
        contactNumber: doc.contactNumber || "",
        machineType: doc.machineType || "",
        workType: doc.workType || "",
        expiryDate: doc.expiryDate,
        reminderDate: subtractMonths(doc.expiryDate, 1),
        reportPdf: doc.reportPdf || null,
        report: doc.report || null,
        // Only expire after the due date has passed; keep on list through due date
        status: expired ? "expired" : "pending",
    };
    if (doc.serviceReport) payload.serviceReport = doc.serviceReport;
    if (doc.serviceReportModel) payload.serviceReportModel = doc.serviceReportModel;

    return ExpiryReminder.findOneAndUpdate(
        filter,
        { $set: payload },
        { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );
};

const collectQaReminders = async ({ today, until }) => {
    const [qaReports, leadApronReports, dueQaTests] = await Promise.all([
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
        // Direct PDF uploads store due date on QATest (may have no ServiceReport yet)
        QATest.find({
            testDueDate: { $gte: today, $lte: until },
            $or: [
                { reportPdf: { $nin: [null, ""] } },
                { report: { $nin: [null, ""] } },
            ],
        })
            .select("reportPdf report qaTestReportNumber reportULRNumber testDueDate testDate")
            .lean(),
    ]);

    const reportRows = [
        ...qaReports.map((row) => ({ ...row, serviceReportModel: "ServiceReport" })),
        ...leadApronReports.map((row) => ({ ...row, serviceReportModel: "LeadApronServiceReport" })),
    ];

    const servicesFromReports = reportRows.map((row) => String(row.serviceId)).filter(Boolean);
    const dueQaTestIds = dueQaTests.map((qa) => String(qa._id));

    const servicesLinkedToDueQa = dueQaTestIds.length
        ? await Services.find({ "workTypeDetails.QAtest": { $in: dueQaTestIds } }).lean()
        : [];

    const serviceIds = [
        ...new Set([
            ...servicesFromReports,
            ...servicesLinkedToDueQa.map((service) => String(service._id)),
        ]),
    ];
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
        ? await QATest.find({
            _id: { $in: qaTestIds },
            $or: [
                { reportPdf: { $nin: [null, ""] } },
                { report: { $nin: [null, ""] } },
            ],
        })
            .select("reportPdf report qaTestReportNumber reportULRNumber testDueDate testDate")
            .lean()
        : [];
    const qaTestMap = new Map(qaTests.map((qa) => [String(qa._id), qa]));

    const reminders = [];
    const seenServiceQa = new Set();

    for (const report of reportRows) {
        const service = serviceMap.get(String(report.serviceId));
        if (!service) continue;

        const qaWork = (service.workTypeDetails || []).find((work) => work.QAtest);
        const qaId = toObjectId(qaWork?.QAtest);
        const qaTest = qaId ? qaTestMap.get(qaId) : null;
        const pdfUrl = qaTest?.reportPdf || qaTest?.report;
        if (!pdfUrl) continue;

        const key = `${service._id}:${qaId || "none"}`;
        if (seenServiceQa.has(key)) continue;
        seenServiceQa.add(key);

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
            expiryDate: report.testDueDate || qaTest.testDueDate,
            reportPdf: pdfUrl,
            report: null,
        });
    }

    // QATest-only due dates (direct upload without ServiceReport header)
    for (const service of services) {
        for (const work of service.workTypeDetails || []) {
            const qaId = toObjectId(work.QAtest);
            if (!qaId) continue;
            const key = `${service._id}:${qaId}`;
            if (seenServiceQa.has(key)) continue;

            const qaTest = qaTestMap.get(qaId);
            if (!qaTest?.testDueDate) continue;
            const till = new Date(qaTest.testDueDate);
            if (isPastDue(till) || till > until) continue;

            const pdfUrl = qaTest.reportPdf || qaTest.report;
            if (!pdfUrl) continue;

            seenServiceQa.add(key);
            const order = orderMap.get(String(service._id));
            reminders.push({
                type: "qa",
                order: order?._id || null,
                service: service._id,
                qaTest: qaTest._id,
                elora: null,
                serviceReport: null,
                serviceReportModel: undefined,
                srfNumber: order?.srfNumber || "",
                hospitalName: order?.hospitalName || "",
                contactNumber: order?.contactNumber || "",
                machineType: service.machineType || "",
                workType: work.workType || "Quality Assurance Test",
                expiryDate: qaTest.testDueDate,
                reportPdf: pdfUrl,
                report: null,
            });
        }
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
            if (isPastDue(till) || till > until) continue;

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
 * Once expiryDate calendar day is before today, mark QA and license reminder
 * docs as expired so they leave the active list.
 * Also reinstate any still-valid rows that were wrongly marked expired.
 */
const syncReminderExpiryStatus = async (today) => {
    const dayStart = startOfDay(today);
    await ExpiryReminder.updateMany(
        {
            type: { $in: ["qa", "license"] },
            expiryDate: { $lt: dayStart },
            status: { $ne: "expired" },
        },
        { $set: { status: "expired" } }
    );
    // Keep still-valid License/QA reminders on the list
    await ExpiryReminder.updateMany(
        {
            type: { $in: ["qa", "license"] },
            expiryDate: { $gte: dayStart },
            status: "expired",
        },
        { $set: { status: "pending" } }
    );
};

/**
 * When License Valid Till is changed in ServiceDetails (including to a past date),
 * collect() no longer finds that service (outside today..+1month window), so the
 * stored ExpiryReminder would keep the old future date. Sync live dates here.
 */
const reconcileLicenseRemindersFromServices = async () => {
    const reminders = await ExpiryReminder.find({ type: "license" }).lean();
    if (!reminders.length) return;

    const serviceIds = [...new Set(reminders.map((r) => String(r.service)).filter(Boolean))];
    const services = await Services.find({ _id: { $in: serviceIds } })
        .select("workTypeDetails machineType")
        .lean();
    const serviceMap = new Map(services.map((s) => [String(s._id), s]));

    await Promise.all(
        reminders.map(async (reminder) => {
            const service = serviceMap.get(String(reminder.service));
            if (!service) {
                await ExpiryReminder.updateOne(
                    { _id: reminder._id },
                    { $set: { status: "expired" } }
                );
                return;
            }

            const eloraId = toObjectId(reminder.elora);
            const work = (service.workTypeDetails || []).find((w) => {
                const workName = String(w.workType || "").toLowerCase().trim();
                const isLicense = !w.workType || LICENSE_WORK_TYPES.includes(workName);
                if (!isLicense) return false;
                if (eloraId) return toObjectId(w.elora) === eloraId;
                return !!w.licenseValidTill;
            });

            const liveTill = work?.licenseValidTill;
            if (!liveTill) {
                await ExpiryReminder.updateOne(
                    { _id: reminder._id },
                    { $set: { status: "expired" } }
                );
                return;
            }

            const expired = isPastDue(liveTill);
            await ExpiryReminder.updateOne(
                { _id: reminder._id },
                {
                    $set: {
                        expiryDate: new Date(liveTill),
                        reminderDate: subtractMonths(liveTill, 1),
                        machineType: service.machineType || reminder.machineType || "",
                        workType: work.workType || reminder.workType || "License for Operation",
                        status: expired ? "expired" : "pending",
                    },
                }
            );
        })
    );
};

const isStillActive = (expiryDate) => {
    if (!expiryDate) return false;
    return !isPastDue(expiryDate);
};

const reminderKey = (doc) =>
    `${doc.type}|${doc.service}|${doc.qaTest || "null"}|${doc.elora || "null"}`;

/**
 * GET /expiry-reminders?type=qa|license|all
 * QA: QATest.reportPdf when ServiceReport.testDueDate is within 1 month
 * License: Elora.report when licenseValidTill is within 1 month
 * After due date (expiryDate day < today), status → expired and row leaves this list.
 * Through the due date itself, License / QA rows stay visible.
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
        const types = [
            ...(includeQa ? ["qa"] : []),
            ...(includeLicense ? ["license"] : []),
        ];

        await syncReminderExpiryStatus(today);
        if (includeLicense) {
            await reconcileLicenseRemindersFromServices();
        }

        const [qaDocs, licenseDocs] = await Promise.all([
            includeQa ? collectQaReminders({ today, until }) : [],
            includeLicense ? collectLicenseReminders({ today, until }) : [],
        ]);

        const saved = await Promise.all(
            [...qaDocs, ...licenseDocs].map((doc) => upsertReminder(doc))
        );

        // Also keep any still-active reminders already stored (avoids licenses
        // vanishing if collect briefly misses a row)
        const fromDb = await ExpiryReminder.find({
            type: { $in: types },
            status: { $ne: "expired" },
            expiryDate: { $gte: today, $lte: until },
        }).lean();

        const byKey = new Map();
        for (const doc of fromDb) {
            byKey.set(reminderKey(doc), doc);
        }
        for (const doc of saved) {
            const plain = doc.toObject ? doc.toObject() : doc;
            byKey.set(reminderKey(plain), plain);
        }

        const data = [...byKey.values()]
            .map((doc) => shapeReminder(doc, today))
            .filter((item) => isStillActive(item.expiryDate) && item.status !== "expired")
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
