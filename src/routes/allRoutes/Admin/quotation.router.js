import { Router } from "express";
const router = Router();
import upload from '../../../middlewares/upload.js'
import quotationController from "../../../controllers/Admin/quotation.controller.js";
router.post('/create/:id', quotationController.createQuotationByEnquiryId)
router.put('/edit-quotation/:id',quotationController.updateQuotationById)
router.get('/get-by-enquiry-id/:id', quotationController.getQuotationByEnquiryId)
router.get('/get-quotation-by-hospital-enq-quo-ids/:hospitalId/:enquiryId', quotationController.getQuotationByIds)
router.put(
    '/accept-quotation/:hospitalId/:enquiryId/:quotationId',
    upload.single('pdfFile'),
    quotationController.acceptQuotation
);
router.put('/reject-quotation/:hospitalId/:enquiryId/:quotationId', quotationController.rejectQuotation)
router.post('/accept-quotation-pdf/:quotationId', upload.single("pdf"), quotationController.acceptQuotationPDF)
router.post(
    "/save-quotation-pdf/:hospitalId/:quotationId",
    upload.single("file"),
    quotationController.downloadQuotationPdf
);
router.post('/share-quotation/:hospitalId/:enquiryId/:quotationId', quotationController.shareQuotation)
router.get('/get-quotation-pdf/:hospitalId/:enquiryId', quotationController.getQuotationPdfUrl)
//mobile api
// router.get('/get-quotation-pdf/:hospitalId/:enquiryId/:quotationId')
router.get('/next-number',quotationController.getNextQuotationNumber)
export default router