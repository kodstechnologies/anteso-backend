import mongoose from "mongoose";
import Services from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";
import serviceReportModel from "../../../../models/serviceReports/serviceReport.model.js";
import RadiationProtectionSurvey from "../../../../models/testTables/InventionalRadiology/RadiationProtectionSurvey.model.js";

const MACHINE_TYPE = "Interventional Radiology";

const create = asyncHandler(async (req, res) => {
    const { surveyDate, hasValidCalibration, appliedCurrent, appliedVoltage, exposureTime, workload, locations, hospitalName, equipmentId, roomNo, manufacturer, model, surveyorName, surveyorDesignation, remarks } = req.body;
    const { serviceId } = req.params;

    // === Validate Input ===
    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate Service + Machine Type
        const service = await Services.findById(serviceId).session(session);
        if (!service) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test is only allowed for ${MACHINE_TYPE}. Current machine: "${service.machineType}"`,
            });
        }

        // 2. Get or Create ServiceReport
        let serviceReport = await serviceReportModel.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new serviceReportModel({ serviceId });
            await serviceReport.save({ session });
        }

        // 3. Save or Update Test Data
        // Radiation Protection Survey is a common test, so tubeId should always be null
        let testRecord = await RadiationProtectionSurvey.findOne({ serviceId, tubeId: null }).session(session);

        const payload = {
            surveyDate: surveyDate || new Date(),
            hasValidCalibration: hasValidCalibration?.trim().toUpperCase() || "",
            appliedCurrent: appliedCurrent?.trim() || "",
            appliedVoltage: appliedVoltage?.trim() || "",
            exposureTime: exposureTime?.trim() || "",
            workload: workload?.trim() || "",
            locations: locations || [],
            hospitalName: hospitalName?.trim() || "",
            equipmentId: equipmentId?.trim() || "",
            roomNo: roomNo?.trim() || "",
            manufacturer: manufacturer?.trim() || "",
            model: model?.trim() || "",
            surveyorName: surveyorName?.trim() || "",
            surveyorDesignation: surveyorDesignation?.trim() || "",
            remarks: remarks?.trim() || "",
            serviceId,
            reportId: serviceReport._id,
            tubeId: null, // Always null for common tests
        };

        if (testRecord) {
            Object.assign(testRecord, payload);
        } else {
            testRecord = new RadiationProtectionSurvey(payload);
        }
        await testRecord.save({ session });

        // 4. Link to ServiceReport
        serviceReport.RadiationProtectionSurveyInventionalRadiology = testRecord._id;
        await serviceReport.save({ session });

        await session.commitTransaction();

        return res.json({
            success: true,
            message: testRecord.isNew ? "Created" : "Updated",
            data: {
                testId: testRecord._id,
                serviceReportId: serviceReport._id,
            },
        });
    } catch (error) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error("Transaction abort failed:", abortError);
            }
        }
        console.error("RadiationProtectionSurvey Create Error:", error);
        return res.status(500).json({
            success: false,
            message: "Operation failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

// ======================
// GET BY TEST ID
// ======================
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required" });
    }

    try {
        const testRecord = await RadiationProtectionSurvey.findById(testId)
            .lean()
            .exec();

        if (!testRecord) {
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        return res.json({
            success: true,
            data: testRecord,
        });
    } catch (error) {
        console.error("GetById Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch",
            error: error.message,
        });
    }
});

// ======================
// UPDATE BY TEST ID
// ======================
const update = asyncHandler(async (req, res) => {
    const { surveyDate, hasValidCalibration, appliedCurrent, appliedVoltage, exposureTime, workload, locations, hospitalName, equipmentId, roomNo, manufacturer, model, surveyorName, surveyorDesignation, remarks } = req.body;
    const { testId } = req.params;

    if (!testId) {
        return res.status(400).json({ success: false, message: "testId is required in URL" });
    }

    let session = null;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const testRecord = await RadiationProtectionSurvey.findById(testId).session(session);
        if (!testRecord) {
            await session.abortTransaction();
            return res.status(404).json({ success: false, message: "Test record not found" });
        }

        // Validate machine type
        const service = await Services.findById(testRecord.serviceId).session(session);
        if (!service || service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: `This test can only be updated for ${MACHINE_TYPE}`,
            });
        }

        // Update fields
        if (surveyDate !== undefined) testRecord.surveyDate = surveyDate;
        if (hasValidCalibration !== undefined) testRecord.hasValidCalibration = hasValidCalibration?.trim().toUpperCase() || "";
        if (appliedCurrent !== undefined) testRecord.appliedCurrent = appliedCurrent?.trim() || "";
        if (appliedVoltage !== undefined) testRecord.appliedVoltage = appliedVoltage?.trim() || "";
        if (exposureTime !== undefined) testRecord.exposureTime = exposureTime?.trim() || "";
        if (workload !== undefined) testRecord.workload = workload?.trim() || "";
        if (locations !== undefined) testRecord.locations = locations;
        if (hospitalName !== undefined) testRecord.hospitalName = hospitalName?.trim() || "";
        if (equipmentId !== undefined) testRecord.equipmentId = equipmentId?.trim() || "";
        if (roomNo !== undefined) testRecord.roomNo = roomNo?.trim() || "";
        if (manufacturer !== undefined) testRecord.manufacturer = manufacturer?.trim() || "";
        if (model !== undefined) testRecord.model = model?.trim() || "";
        if (surveyorName !== undefined) testRecord.surveyorName = surveyorName?.trim() || "";
        if (surveyorDesignation !== undefined) testRecord.surveyorDesignation = surveyorDesignation?.trim() || "";
        if (remarks !== undefined) testRecord.remarks = remarks?.trim() || "";
        // tubeId should always remain null for common tests

        await testRecord.save({ session });
        await session.commitTransaction();

        return res.json({
            success: true,
            message: "Updated successfully",
            data: { testId: testRecord._id },
        });
    } catch (error) {
        if (session) {
            try {
                await session.abortTransaction();
            } catch (abortError) {
                console.error("Abort failed:", abortError);
            }
        }
        console.error("Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: error.message,
        });
    } finally {
        if (session) session.endSession();
    }
});

const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId) {
        return res.status(400).json({ success: false, message: "serviceId is required" });
    }

    try {
        // Radiation Protection Survey is a common test, so always query with tubeId: null
        const testRecord = await RadiationProtectionSurvey.findOne({ serviceId, tubeId: null }).lean().exec();

        if (!testRecord) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        const service = await Services.findById(serviceId).lean();
        if (service && service.machineType !== MACHINE_TYPE) {
            return res.status(403).json({
                success: false,
                message: `This test belongs to ${service.machineType}, not ${MACHINE_TYPE}`,
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

export default { create, getById, update, getByServiceId };
