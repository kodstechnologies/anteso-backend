import orderModel from "../../../models/order.model.js";
import QATest from "../../../models/QATest.model.js";
import Services from "../../../models/Services.js";
import Tools from "../../../models/tools.model.js";
import { asyncHandler } from "../../../utils/AsyncHandler.js";
export const getCustomerDetails = asyncHandler(async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "serviceId is required in URL",
            });
        }

        // 1️⃣ Find the order that contains this serviceId
        const order = await orderModel
            .findOne({ services: serviceId })
            .select("hospitalName fullAddress srfNumber")
            .lean();

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found for the given serviceId",
            });
        }

        // 2️⃣ Find the service and include details
        const service = await Services.findById(serviceId)
            .select("machineType machineModel serialNumber workTypeDetails")
            .populate({
                path: "workTypeDetails.engineer",
                select: "name email designation technicianType", // adjust fields as per Employee schema
            })
            .lean();

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // Extract QATest IDs from workTypeDetails (if any)
        const qaTestIds = service.workTypeDetails
            ?.map((w) => w.QAtest)
            .filter((id) => !!id);

        let qaTestReportNumbers = [];

        if (qaTestIds && qaTestIds.length > 0) {
            const qaTests = await QATest.find({ _id: { $in: qaTestIds } })
                .select("qaTestReportNumber reportULRNumber createdAt")
                .lean();

            qaTestReportNumbers = qaTests.map((q) => ({
                qaTestId: q._id,
                qaTestReportNumber: q.qaTestReportNumber || "N/A",
                reportULRNumber: q.reportULRNumber || "N/A",
                createdAt: q.createdAt || null,
            }));
        }

        // Find the engineer assigned for Quality Assurance Test (if present)
        const qaEngineer = service.workTypeDetails?.find(
            (w) => w.workType === "Quality Assurance Test" && w.engineer
        )?.engineer;

        // 3️⃣ Construct final response
        return res.status(200).json({
            success: true,
            data: {
                hospitalName: order.hospitalName,
                hospitalAddress: order.fullAddress,
                srfNumber: order.srfNumber,
                machineType: service.machineType,
                machineModel: service.machineModel || "N/A",
                serialNumber: service.serialNumber || "N/A",
                engineerAssigned: qaEngineer
                    ? {
                        name: qaEngineer.name || "N/A",
                        email: qaEngineer.email || "N/A",
                        designation: qaEngineer.designation || "N/A",
                        technicianType: qaEngineer.technicianType || "N/A",
                    }
                    : null,
                qaTests: qaTestReportNumbers,
            },
        });
    } catch (error) {
        console.error("getCustomerDetails Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch customer details",
            error: error.message,
        });
    }
});

const getTools = asyncHandler(async (req, res) => {
    try {
        const { serviceId } = req.params;

        if (!serviceId) {
            return res.status(400).json({
                success: false,
                message: "serviceId is required in URL",
            });
        }

        // 1️⃣ Find the service and get engineer assigned (if any)
        const service = await Services.findById(serviceId)
            .select("workTypeDetails machineType machineModel serialNumber")
            .populate({
                path: "workTypeDetails.engineer",
                select: "name email designation technicianType",
            })
            .lean();

        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found",
            });
        }

        // 2️⃣ Find the engineer assigned for Quality Assurance (or any engineer)
        const qaEngineer = service.workTypeDetails?.find(
            (w) =>
                w.workType === "Quality Assurance Test" &&
                w.engineer &&
                w.engineer._id
        )?.engineer;

        if (!qaEngineer) {
            return res.status(404).json({
                success: false,
                message: "No engineer assigned for this service",
            });
        }

        // 3️⃣ Find tools assigned to this engineer
        const tools = await Tools.find({ technician: qaEngineer._id })
            .select(
                "toolId SrNo nomenclature manufacturer model range calibrationCertificateNo calibrationValidTill certificate toolStatus submitDate"
            )
            .lean();

        // 4️⃣ Build and return structured response
        return res.status(200).json({
            success: true,
            data: {
                engineer: {
                    id: qaEngineer._id,
                    name: qaEngineer.name,
                    email: qaEngineer.email,
                    designation: qaEngineer.designation,
                    technicianType: qaEngineer.technicianType,
                },
                machineDetails: {
                    machineType: service.machineType,
                    machineModel: service.machineModel || "N/A",
                    serialNumber: service.serialNumber || "N/A",
                },
                toolsAssigned: tools.length > 0 ? tools : [],
            },
        });
    } catch (error) {
        console.error("getTools Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch tools",
            error: error.message,
        });
    }
});
export default { getCustomerDetails, getTools }