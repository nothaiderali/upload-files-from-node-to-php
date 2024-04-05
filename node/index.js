import fs from "fs"
import express from "express"
import multer from "multer"

const app = express()

const allowedFileTypes = ["image/jpeg", "image/png"]
const multerUpload = multer({ dest: "node/temp", limits: { fileSize: "10mb" } })

function deleteAll(files) {
  files.forEach((file) => fs.unlinkSync(file.path))
}

function noFormFieldsCheck(req, res, next) {
  multerUpload.any()(req, res, (err) =>
    next(err?.message === "Unexpected end of form" ? undefined : err)
  )
}

app.post("/upload", noFormFieldsCheck, async (req, res) => {
  if (!req.files || !req.files.length)
    return res.status(400).send({ message: "No file is uploaded" })

  const formData = new FormData()
  formData.append("secret", "EXAMPLE_SECRET")

  for (const file of req.files) {
    if (!allowedFileTypes.includes(file.mimetype)) {
      deleteAll(req.files)
      return res
        .status(400)
        .send({ message: "File type " + file.mimetype + " is not allowed" })
    }

    const fileBlob = new Blob([fs.readFileSync(file.path)], {
      type: file.mimetype,
    })
    formData.append(file.fieldname, fileBlob, file.originalname)
  }

  try {
    const response = await fetch("http://localhost/upload.php", {
      method: "POST",
      body: formData,
    })

    res
      .status(response.status)
      .setHeader("content-type", response.headers.get("content-type"))
      .send(await response.text())
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  } finally {
    deleteAll(req.files)
  }
})

app.use((err, req, res, next) => {
  res.status(400).send({ message: err.message })
})

const PORT = process.env.PORT || 4000

app.listen(PORT, () => console.log("server started: http://localhost:" + PORT))
