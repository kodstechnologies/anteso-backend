import { Router } from "express";
import Upload from '../../../middlewares/upload.js'
const router = Router();
import InvoiceController from '../../../controllers/Admin/invoice.controller.js'
import invoiceController from "../../../controllers/Admin/invoice.controller.js";
router.get('/all-orders-with-type', InvoiceController.getAllOrdersWithType)
router.get('/all-details-by-orderId/:orderId', InvoiceController.getAllDetailsWithOrderId)
router.post('/create-invoice', InvoiceController.createInvoice)
router.get('/get-invoice-by-id/:invoiceId', InvoiceController.getInvoiceById)
router.get('/get-all-invoices', InvoiceController.getAllInvoices)
router.delete('/delete-invoice/:id', InvoiceController.deleteInvoice)

//mobile API'S
router.post("/upload-pdf/:orderId", Upload.single("invoicePdf"), InvoiceController.uploadInvoicePdf);
router.get("/get-invoice-pdf/:orderId", InvoiceController.getInvoicePdf)
router.get('/get-dealer-orders', invoiceController.getDealerOrders)
router.get('/get-dealer-manufacturer-branches', invoiceController.getDealerManufacturerBranches)
router.get('/get-hospitals-by-lead-owner-branches', invoiceController.getHospitalsByLeadOwnerBranches)
export default router