import express from "express"
import multer from "multer"
import { upload } from "../controlers/file.controlers.js"

const router = express.Router()
const multerUpload = multer({ dest: "temp", limits: { fileSize: "10mb" } })

router.post("/upload", multerUpload.single("file"), upload)

router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError)
    return res.status(400).send({ message: err.message })
  next()
})

export default router
