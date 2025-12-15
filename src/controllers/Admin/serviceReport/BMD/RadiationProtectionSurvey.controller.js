// controllers/Admin/serviceReport/BMD/RadiationProtectionInterventionalRadiology.controller.js

import mongoose from "mongoose";
import RadiationProtectionInterventionalRadiology from "../../../../models/testTables/BMD/DetailsOfRadiationProtection.model.js";
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import Service from "../../../../models/Services.js";
import { asyncHandler } from "../../../../utils/AsyncHandler.js";

const MACHINE_TYPE = "Bone Densitometer (BMD)";

// CREATE (with transaction)
const create = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;
    const {
        surveyDate,
        surveyMeterModel,
        calibrationCertificateValid,
        leadApronsAvailable,
        thyroidShieldsAvailable,
        leadGlassesAvailable,
        ceilingSuspendedShield,
        tableLeadCurtain,
        doseAreaProductMeter,
        patientDoseMonitoring,
        // Maximum Radiation Level Survey fields
        appliedCurrent,
        appliedVoltage,
        exposureTime,
        workload,
        locations,
    } = req.body;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate machine type
        const service = await Service.findById(serviceId).session(session).lean();
        if (!service) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Service not found" });
        }
        if (service.machineType !== MACHINE_TYPE) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                message: `This test is only allowed for ${MACHINE_TYPE}. Current: ${service.machineType}`,
            });
        }

        // Prevent duplicate
        const existing = await RadiationProtectionInterventionalRadiology.findOne({ serviceId }).session(session);
        if (existing) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: "Radiation Protection Survey (Interventional Radiology) already exists for this service",
            });
        }

        // Get or create ServiceReport
        let serviceReport = await ServiceReport.findOne({ serviceId }).session(session);
        if (!serviceReport) {
            serviceReport = new ServiceReport({ serviceId });
            await serviceReport.save({ session });
        }

        // Create new document
        const newSurvey = await RadiationProtectionInterventionalRadiology.create(
            [
                {
                    serviceId,
                    reportId: serviceReport._id,
                    surveyDate: surveyDate || "",
                    surveyMeterModel: surveyMeterModel || "",
                    calibrationCertificateValid: calibrationCertificateValid || "",
                    leadApronsAvailable: leadApronsAvailable || "",
                    thyroidShieldsAvailable: thyroidShieldsAvailable || "",
                    leadGlassesAvailable: leadGlassesAvailable || "",
                    ceilingSuspendedShield: ceilingSuspendedShield || "",
                    tableLeadCurtain: tableLeadCurtain || "",
                    doseAreaProductMeter: doseAreaProductMeter || "",
                    patientDoseMonitoring: patientDoseMonitoring || "",
                    // Maximum Radiation Level Survey fields
                    appliedCurrent: appliedCurrent || "",
                    appliedVoltage: appliedVoltage || "",
                    exposureTime: exposureTime || "",
                    workload: workload || "",
                    locations: locations || [],
                },
            ],
            { session }
        );

        // Link back to ServiceReport (Must match schema field name)
        serviceReport.RadiationProtectionSurveyBMD = newSurvey[0]._id;
        await serviceReport.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            data: newSurvey[0],
            message: "Radiation Protection Survey (Interventional Radiology) created successfully",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("RadiationProtectionIR create error:", error);
        throw error;
    }
});

// GET by testId (_id)
const getById = asyncHandler(async (req, res) => {
    const { testId } = req.params;

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    const survey = await RadiationProtectionInterventionalRadiology.findById(testId)
        .lean()
        .select("-isDeleted");

    if (!survey) {
        return res.status(404).json({ message: "Radiation Protection Survey not found" });
    }

    return res.status(200).json({
        success: true,
        data: survey,
    });
});

// UPDATE with transaction
const update = asyncHandler(async (req, res) => {
    const { testId } = req.params;
    const {
        surveyDate,
        surveyMeterModel,
        calibrationCertificateValid,
        leadApronsAvailable,
        thyroidShieldsAvailable,
        leadGlassesAvailable,
        ceilingSuspendedShield,
        tableLeadCurtain,
        doseAreaProductMeter,
        patientDoseMonitoring,
        // Maximum Radiation Level Survey fields
        appliedCurrent,
        appliedVoltage,
        exposureTime,
        workload,
        locations,
    } = req.body;

    // Debug logging
    console.log('=== Radiation Protection Survey UPDATE ===');
    console.log('testId:', testId);
    console.log('locations received:', locations);
    console.log('appliedCurrent:', appliedCurrent);
    console.log('appliedVoltage:', appliedVoltage);
    console.log('exposureTime:', exposureTime);
    console.log('workload:', workload);
    console.log('Full body:', JSON.stringify(req.body, null, 2));

    if (!testId || !mongoose.Types.ObjectId.isValid(testId)) {
        return res.status(400).json({ message: "Valid testId is required" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const updatedSurvey = await RadiationProtectionInterventionalRadiology.findByIdAndUpdate(
            testId,
            {
                $set: {
                    surveyDate: surveyDate || "",
                    surveyMeterModel: surveyMeterModel || "",
                    calibrationCertificateValid: calibrationCertificateValid || "",
                    leadApronsAvailable: leadApronsAvailable || "",
                    thyroidShieldsAvailable: thyroidShieldsAvailable || "",
                    leadGlassesAvailable: leadGlassesAvailable || "",
                    ceilingSuspendedShield: ceilingSuspendedShield || "",
                    tableLeadCurtain: tableLeadCurtain || "",
                    doseAreaProductMeter: doseAreaProductMeter || "",
                    patientDoseMonitoring: patientDoseMonitoring || "",
                    // Maximum Radiation Level Survey fields
                    appliedCurrent: appliedCurrent !== undefined ? appliedCurrent : "",
                    appliedVoltage: appliedVoltage !== undefined ? appliedVoltage : "",
                    exposureTime: exposureTime !== undefined ? exposureTime : "",
                    workload: workload !== undefined ? workload : "",
                    locations: locations !== undefined ? locations : [],
                    updatedAt: Date.now(),
                },
            },
            { new: true, runValidators: true, session }
        );

        if (!updatedSurvey) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Survey not found" });
        }

        await session.commitTransaction();
        session.endSession();

        console.log('Updated survey data:', JSON.stringify(updatedSurvey, null, 2));
        console.log('Locations saved:', updatedSurvey.locations);

        return res.status(200).json({
            success: true,
            data: updatedSurvey,
            message: "Radiation Protection Survey updated successfully",
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("RadiationProtectionIR update error:", error);
        throw error;
    }
});

// GET by serviceId
const getByServiceId = asyncHandler(async (req, res) => {
    const { serviceId } = req.params;

    if (!serviceId || !mongoose.Types.ObjectId.isValid(serviceId)) {
        return res.status(400).json({ message: "Valid serviceId is required" });
    }

    const survey = await RadiationProtectionInterventionalRadiology.findOne({ serviceId })
        .lean()
        .select("-isDeleted");

    return res.status(200).json({
        success: true,
        data: survey || null,
    });
});

export default { create, getById, update, getByServiceId };