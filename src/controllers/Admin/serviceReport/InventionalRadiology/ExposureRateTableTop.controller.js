import ServiceReport from "../../../../models/serviceReports/serviceReport.model.js";
import ExposureRateTableTop from "../../../../models/testTables/InventionalRadiology/ExposureRateTableTop.model.js";

const MACHINE_TYPE = "Interventional Radiology";

export const create = async (req, res) => {
    try {
        const { serviceId } = req.params;
        let serviceReport = await ServiceReport.findOne({ serviceId, machineType: MACHINE_TYPE });
        if (!serviceReport) return res.status(404).json({ success: false, message: "Service Report not found" });

        const testData = await ExposureRateTableTop.findOneAndUpdate(
            { serviceId },
            { ...req.body, serviceId, reportId: serviceReport._id },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        await ServiceReport.findOneAndUpdate(
            { serviceId, machineType: MACHINE_TYPE },
            { ExposureRateTableTopInventionalRadiology: testData._id }
        );

        return res.status(200).json({ success: true, data: testData, message: "Saved successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getByServiceId = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const testData = await ExposureRateTableTop.findOne({ serviceId });
        if (!testData) return res.status(404).json({ success: false, message: "Data not found" });
        return res.status(200).json({ success: true, data: testData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const getById = async (req, res) => {
    try {
        const { testId } = req.params;
        const testData = await ExposureRateTableTop.findById(testId);
        if (!testData) return res.status(404).json({ success: false, message: "Not Found" });
        return res.status(200).json({ success: true, data: testData });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const update = async (req, res) => {
    try {
        const { testId } = req.params;
        const testData = await ExposureRateTableTop.findByIdAndUpdate(testId, req.body, { new: true });
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
