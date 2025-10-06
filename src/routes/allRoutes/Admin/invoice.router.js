import { Router } from "express";
import Upload from '../../../middlewares/upload.js'
const router = Router();
import InvoiceController from '../../../controllers/Admin/invoice.controller.js'
router.get('/all-orders-with-type', InvoiceController.getAllOrdersWithType)
router.get('/all-details-by-orderId/:orderId', InvoiceController.getAllDetailsWithOrderId)
router.post('/create-invoice', InvoiceController.createInvoice)
router.get('/get-invoice-by-id/:invoiceId', InvoiceController.getInvoiceById)
router.get('/get-all-invoices', InvoiceController.getAllInvoices)
router.delete('/delete-invoice/:id', InvoiceController.deleteInvoice)
router.post("/upload-pdf/:orderId", Upload.single("invoicePdf"), InvoiceController.uploadInvoicePdf);

export default router