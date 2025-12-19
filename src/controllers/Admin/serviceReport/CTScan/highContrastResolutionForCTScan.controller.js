import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import HighContrastResolutionForCTScan from "../../../../models/testTables/CTScan/HighContrasrResolutionForCTScan.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import mongoose from "mongoose";

const create = asyncHandler(async (req, res) => {
    const { operatingParams, result, tolerance, table1, table2, tubeId } = req.body; // table1, table2 for backward compatibility
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate Service
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

        // 2. Get or Create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        // 3. Create or Update Test Record
        // For double tube: find by serviceId AND tubeId; for single: find by serviceId with tubeId null
        const tubeIdValue = tubeId || null;
        let testRecord = await HighContrastResolutionForCTScan.findOne({ serviceId, tubeId: tubeIdValue }).session(session);

        const updateData = {
            serviceId,
            serviceReportId: serviceReport._id,
            tubeId: tubeIdValue,
        };

        // Handle new format (operatingParams, result, tolerance)
        if (operatingParams && typeof operatingParams === 'object') {
            updateData.operatingParams = {
                kvp: operatingParams.kvp?.toString().trim() || '120',
                mas: operatingParams.mas?.toString().trim() || '200',
                sliceThickness: operatingParams.sliceThickness?.toString().trim() || '5.0',
                ww: operatingParams.ww?.toString().trim() || '400',
            };
        }

        if (result && typeof result === 'object') {
            updateData.result = {
                observedSize: result.observedSize?.toString().trim() || '1.0',
                contrastDifference: result.contrastDifference?.toString().trim() || '10',
            };
        }

        if (tolerance && typeof tolerance === 'object') {
            updateData.tolerance = {
                contrastDifference: tolerance.contrastDifference?.toString().trim() || '10',
                size: tolerance.size?.toString().trim() || '1.6',
                lpCm: tolerance.lpCm?.toString().trim() || '3.12',
                expectedSize: tolerance.expectedSize?.toString().trim() || '0.8',
                expectedLpCm: tolerance.expectedLpCm?.toString().trim() || '6.25',
            };
        }

        // Handle legacy format for backward compatibility
        if (Array.isArray(table1)) {
            updateData.table1 = table1;
        }
        if (Array.isArray(table2)) {
            updateData.table2 = table2;
        }

        if (testRecord) {
            Object.assign(testRecord, updateData);
        } else {
            testRecord = new HighContrastResolutionForCTScan(updateData);
        }
        await testRecord.save({ session });

        // 4. Link to ServiceReport
        serviceReport.HighContrastResolutionForCTScan = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: "High Contrast Resolution saved",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) await session.abortTransaction();
        console.error("HighContrastResolution Create Error:", error);
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
    const { operatingParams, result, tolerance, table1, table2, tubeId } = req.body; // table1, table2 for backward compatibility
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await HighContrastResolutionForCTScan.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
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

        // Update only provided fields - new format
        if (operatingParams && typeof operatingParams === 'object') {
            testRecord.operatingParams = {
                kvp: operatingParams.kvp?.toString().trim() || testRecord.operatingParams?.kvp || '120',
                mas: operatingParams.mas?.toString().trim() || testRecord.operatingParams?.mas || '200',
                sliceThickness: operatingParams.sliceThickness?.toString().trim() || testRecord.operatingParams?.sliceThickness || '5.0',
                ww: operatingParams.ww?.toString().trim() || testRecord.operatingParams?.ww || '400',
            };
        }

        if (result && typeof result === 'object') {
            testRecord.result = {
                observedSize: result.observedSize?.toString().trim() || testRecord.result?.observedSize || '1.0',
                contrastDifference: result.contrastDifference?.toString().trim() || testRecord.result?.contrastDifference || '10',
            };
        }

        if (tolerance && typeof tolerance === 'object') {
            testRecord.tolerance = {
                contrastDifference: tolerance.contrastDifference?.toString().trim() || testRecord.tolerance?.contrastDifference || '10',
                size: tolerance.size?.toString().trim() || testRecord.tolerance?.size || '1.6',
                lpCm: tolerance.lpCm?.toString().trim() || testRecord.tolerance?.lpCm || '3.12',
                expectedSize: tolerance.expectedSize?.toString().trim() || testRecord.tolerance?.expectedSize || '0.8',
                expectedLpCm: tolerance.expectedLpCm?.toString().trim() || testRecord.tolerance?.expectedLpCm || '6.25',
            };
        }

        // Update legacy format for backward compatibility
        if (Array.isArray(table1)) {
            testRecord.table1 = table1;
        }
        if (Array.isArray(table2)) {
            testRecord.table2 = table2;
        }
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
        console.error("HighContrastResolution Update Error:", error);
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
        const testRecord = await HighContrastResolutionForCTScan.findById(testId)
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
        console.error("Get HighContrastResolution Error:", error);
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
        const testRecord = await HighContrastResolutionForCTScan.findOne(query).lean().exec();

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
