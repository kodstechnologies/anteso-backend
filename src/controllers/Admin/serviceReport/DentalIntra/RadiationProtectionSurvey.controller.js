import RadiationProtectionSurveyModel from '../../../../models/testTables/DentalIntra/RadiationProtectionSurvey.model.js';
import serviceReportModel from '../../../../models/serviceReports/serviceReport.model.js';

export const addRadiationProtectionSurvey = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const payload = req.body;

        const newEntry = new RadiationProtectionSurveyModel({
            ...payload,
            serviceId
        });

        const savedEntry = await newEntry.save();

        // Update main report
        await serviceReportModel.findOneAndUpdate(
            { serviceId },
            { RadiationProtectionSurveyDentalIntra: savedEntry._id }
        );

        res.status(201).json({ success: true, data: savedEntry, testId: savedEntry._id });
    } catch (error) {
        console.error("Add survey error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRadiationProtectionSurveyByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const data = await RadiationProtectionSurveyModel.findOne({ serviceId });
        if (!data) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getRadiationProtectionSurveyByTestId = async (req, res) => {
    try {
        const { testId } = req.params;
        const data = await RadiationProtectionSurveyModel.findById(testId);
        if (!data) return res.status(404).json({ message: "Not found" });
        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateRadiationProtectionSurvey = async (req, res) => {
    try {
        const { testId } = req.params;
        const payload = req.body;

        const updated = await RadiationProtectionSurveyModel.findByIdAndUpdate(
            testId,
            payload,
            { new: true }
        );

        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
