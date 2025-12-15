
import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import RadiationProtectionSurvey from "../../../../models/testTables/InventionalRadiology/RadiationProtectionSurvey.model.js";

const MACHINE_TYPE = "Interventional Radiology";

// Create or Update (Upsert)
export const create = async (req, res) => {
    try {
        const { serviceId } = req.params;

        let serviceReport = await ServiceReport.findOne({
            serviceId,
            machineType: MACHINE_TYPE,
        });

        if (!serviceReport) {
            return res.status(404).json({
                success: false,
                message: "Service Report not found for this Service ID",
            });
        }

        const testData = await RadiationProtectionSurvey.findOneAndUpdate(
            { serviceId },
            {
                ...req.body,
                serviceId,
                reportId: serviceReport._id,
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await ServiceReport.findOneAndUpdate(
            { serviceId, machineType: MACHINE_TYPE },
            { RadiationProtectionSurveyInventionalRadiology: testData._id }
        );

        return res.status(200).json({
            success: true,
            data: testData,
            message: "Radiation Protection Survey saved successfully",
        });

    } catch (error) {
        console.error("Error saving Radiation Protection Survey:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get By Service ID
export const getByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const testData = await RadiationProtectionSurvey.findOne({ serviceId });

        if (!testData) {
            return res.status(404).json({
                success: false,
                message: "Data not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: testData,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get By ID
export const getById = async (req, res) => {
    try {
        const { testId } = req.params;
        const testData = await RadiationProtectionSurvey.findById(testId);
        if (!testData) return res.status(404).json({ success: false, message: "Not Found" });
        return res.status(200).json({ success: true, data: testData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update
export const update = async (req, res) => {
    try {
        const { testId } = req.params;
        const testData = await RadiationProtectionSurvey.findByIdAndUpdate(
            testId,
            req.body,
            { new: true }
        );
        if (!testData) return res.status(404).json({ success: false, message: "Not Found" });
        return res.status(200).json({ success: true, data: testData, message: "Updated Successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    create,
    getByServiceId,
    getById,
    update
};
