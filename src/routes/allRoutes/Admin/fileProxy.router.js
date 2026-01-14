import { Router } from "express";
import fileProxyController from "../../../controllers/Admin/fileProxy.controller.js";

const router = Router();

// Proxy file from S3/external URL to avoid CORS issues
router.get("/proxy-file", fileProxyController.proxyFile);

export default router;

