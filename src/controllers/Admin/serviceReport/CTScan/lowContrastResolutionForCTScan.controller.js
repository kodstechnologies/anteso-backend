import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import LowContrastResolutionForCTScan from "../../../../models/testTables/CTScan/LowContrastResolutionForCTScan.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

/** Run the actual create/update logic (used for retry after dropping legacy index) */
async function performCreate(req, res, session) {
    const { acquisitionParams, result, tolerances, tubeId } = req.body;
    const { serviceId } = req.params;
    const tubeIdValue = tubeId || null;

    const service = await Service.findById(serviceId).session(session);
    if (!service) {
        await session.abortTransaction();
        return res.status(404).json({ success: false, message: "Service not found" });
    }
    if (service.machineType !== "Computed Tomography") {
        await session.abortTransaction();
        return res.status(403).json({
            success: false,
            message: `This test is only for Computed Tomography. Found: ${service.machineType}`,
        });
    }

    let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
    if (!serviceReport) {
        serviceReport = new ServiceReport({ serviceId });
        await serviceReport.save({ session });
    }

    let testRecord = await LowContrastResolutionForCTScan.findOne({ serviceId, tubeId: tubeIdValue }).session(session);
    const updateData = {
        acquisitionParams: acquisitionParams || {},
        result: result || {},
        tolerances: Array.isArray(tolerances) ? tolerances : undefined,
        serviceId,
        reportId: serviceReport._id,
        tubeId: tubeIdValue,
    };

    if (testRecord) {
        Object.assign(testRecord, updateData);
    } else {
        testRecord = new LowContrastResolutionForCTScan(updateData);
    }
    await testRecord.save({ session });

    serviceReport.lowContrastResolutionForCTScan = testRecord._id;
    await serviceReport.save({ session });
    await session.commitTransaction();

    return res.json({
        success: true,
        message: "Low Contrast Resolution saved",
        data: { testId: testRecord._id, serviceReportId: serviceReport._id },
    });
}

const create = asyncHandler(async (req, res) => {
    const { acquisitionParams, result, tolerances, tubeId } = req.body;
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        return await performCreate(req, res, session);
    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
            session = null;
        }
        const isDupKeyOnServiceId =
            error.code === 11000 &&
            (error.message || "").includes("duplicate key") &&
            (error.message || "").includes("serviceId");
        if (isDupKeyOnServiceId) {
            try {
                await LowContrastResolutionForCTScan.collection.dropIndex("serviceId_1");
            } catch (dropErr) {
                if (dropErr.code !== 27 && dropErr.codeName !== "IndexNotFound") {
                    console.warn("LowContrastResolution: could not drop legacy index serviceId_1:", dropErr.message);
                }
            }
            let retrySession = null;
            try {
                retrySession = await mongoose.startSession();
                retrySession.startTransaction();
                return await performCreate(req, res, retrySession);
            } catch (retryErr) {
                if (retrySession) {
                    await retrySession.abortTransaction();
                    retrySession.endSession();
                }
                console.error("LowContrastResolution Create Error (after index drop):", retryErr);
                return res.status(500).json({
                    success: false,
                    message: "Failed to save",
                    error: retryErr.message,
                });
            } finally {
                if (retrySession) retrySession.endSession();
            }
        }
        console.error("LowContrastResolution Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const update = asyncHandler(async (req, res) => {
    const { acquisitionParams, result, tolerances, tubeId } = req.body;
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await LowContrastResolutionForCTScan.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Ensure we are not updating another tube's record
        const tubeIdValue = tubeId !== undefined ? (tubeId === null || tubeId === 'null' ? null : tubeId) : undefined;
        if (tubeIdValue !== undefined && testRecord.tubeId !== tubeIdValue) {
            await session.abortTransaction();
            return res.status(400).json({ success: false, message: "Tube mismatch: this record belongs to a different tube." });
        }

        // Validate machine type
        const service = await Service.findById(testRecord.serviceId).session(session);
        if (!service || service.machineType !== "Computed Tomography") {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: "This test is only for Computed Tomography machines",
            });
        }

        // Update only provided fields
        if (acquisitionParams) testRecord.acquisitionParams = acquisitionParams;
        if (result) testRecord.result = result;
        if (Array.isArray(tolerances)) testRecord.tolerances = tolerances;
        if (tubeId !== undefined) testRecord.tubeId = tubeId || null;

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("LowContrastResolution Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    try {
        const testRecord = await LowContrastResolutionForCTScan.findById(testId)
            .lean()
            .exec();

        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test not found" });
        }

        // Optional: validate machine type
        const service = await Service.findById(testRecord.serviceId).lean();
        if (service && service.machineType !== "Computed Tomography") {
            return res.status(403).json({
                success: false,
                message: `Test belongs to ${service.machineType}, not Computed Tomography`,
            });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("Get LowContrastResolution Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch",
            error: error.message,
        });
    }
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required" });
    }

    try {
        // Build query with optional tubeId from query parameter
        const { tubeId } = req.query;
        const query = { serviceId };
        if (tubeId !== undefined) {
            query.tubeId = tubeId === 'null' ? null : tubeId;
        }
        const testRecord = await LowContrastResolutionForCTScan.findOne(query).lean().exec();

        if (!testRecord) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        const service = await Service.findById(serviceId).lean();
        if (service && service.machineType !== "Computed Tomography") {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not Computed Tomography`,
            });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("getByServiceId Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch test record",
            error: error.message,
        });
    }
});

export default { create, update, getById, getByServiceId };
