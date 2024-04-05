import express from "express"
import multer from "multer"
import fs from "fs/promises"

const app = express()

const multerUpload = multer({ dest: "node/temp", limits: { fileSize: "10mb" } })

app.post("/upload", multerUpload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send({ message: "No file uploaded" })

  const isValidFile = ["image/jpeg", "image/png"].includes(req.file.mimetype)

  if (!isValidFile)
    return res.status(400).send({ message: "Invalid file type" })

  const fileBlob = new Blob([await fs.readFile(req.file.path)])

  const formData = new FormData()
  formData.append("secret", "EXAMPLE_SECRET")
  formData.append("file", fileBlob, req.file.originalname)

  try {
    const response = await fetch("http://localhost/upload.php", {
      method: "POST",
      body: formData,
    })
    const responseData = await response.json()
    res.status(response.status).send(responseData)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  } finally {
    fs.unlink(req.file.path)
  }
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError)
    return res.status(400).send({ message: err.message })
  next()
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log("server started: http://localhost:" + PORT))
