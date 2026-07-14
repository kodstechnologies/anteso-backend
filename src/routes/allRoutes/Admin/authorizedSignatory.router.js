import { Router } from "express";
import authorizedSignatoryController from "../../../controllers/Admin/authorizedSignatory.controller.js";
import upload from "../../../middlewares/upload.js";

const router = Router();

router.post("/create", upload.single("signature"), authorizedSignatoryController.create);
router.get("/get-all", authorizedSignatoryController.getAll);
router.get("/get-by-id/:id", authorizedSignatoryController.getById);
router.put("/update/:id", upload.single("signature"), authorizedSignatoryController.updateById);
router.delete("/delete/:id", authorizedSignatoryController.deleteById);

export default router;
