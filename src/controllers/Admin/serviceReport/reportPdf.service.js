import QATest from "../../../models/QATest.model.js";
import Services from "../../../models/Services.js";
import { uploadToS3 } from "../../../utils/s3Upload.js";

export const persistReportPdfForService = async (serviceId, reportPdfUrl) => {
    const service = await Services.findById(serviceId);
    if (!service) {
        throw new Error("Service not found");
    }

    const qaTestIds = [
        ...new Set(
            (service.workTypeDetails || [])
                .map((w) => {
                    if (!w?.QAtest) return null;
                    return String(w.QAtest._id || w.QAtest);
                })
                .filter(Boolean)
        ),
    ];

    if (qaTestIds.length > 0) {
        await QATest.updateMany(
            { _id: { $in: qaTestIds } },
            { $set: { reportPdf: reportPdfUrl } }
        );
        const updated = await QATest.findById(qaTestIds[0]);
        console.log(`✅ reportPdf saved on QATest ${qaTestIds.join(", ")} for service ${serviceId}`);
        return updated;
    }

    const qaWorkDetail = service.workTypeDetails?.find(
        (w) =>
            w.workType === "Quality Assurance Test" ||
            w.serviceName === "QA Test"
    );

    const qaTest = await QATest.create({ reportPdf: reportPdfUrl });

    if (qaWorkDetail) {
        qaWorkDetail.QAtest = qaTest._id;
    } else {
        service.workTypeDetails = service.workTypeDetails || [];
        service.workTypeDetails.push({
            workType: "Quality Assurance Test",
            serviceName: "QA Test",
            QAtest: qaTest._id,
        });
    }

    service.markModified("workTypeDetails");
    await service.save();

    console.log(`✅ reportPdf saved on new QATest ${qaTest._id} for service ${serviceId}`);
    return qaTest;
};

export const isReportPdfOnlyPayload = (body) =>
    typeof body?.reportPdfBase64 === "string" &&
    body.reportPdfBase64.trim() &&
    body.customerName === undefined &&
    body.testReportNumber === undefined &&
    body.toolsUsed === undefined &&
    body.notes === undefined &&
    body.hasTimer === undefined;

export const trySaveReportPdfOnly = async (req, res, serviceId, findReport) => {
    if (!isReportPdfOnlyPayload(req.body)) {
        return false;
    }

    const report = await findReport(serviceId);
    if (!report) {
        res.status(404).json({
            message: "ServiceReport not found. Please generate the test report first.",
        });
        return true;
    }

    const uploaded = await uploadToS3({
        buffer: Buffer.from(req.body.reportPdfBase64, "base64"),
        mimetype: "application/pdf",
        originalname: `Report-${report.testReportNumber || serviceId}.pdf`,
    });
    const savedReportPdf = uploaded.url;
    await persistReportPdfForService(serviceId, savedReportPdf);

    res.status(200).json({
        message: "Report PDF saved to QATest successfully!",
        reportPdf: savedReportPdf,
    });
    return true;
};
