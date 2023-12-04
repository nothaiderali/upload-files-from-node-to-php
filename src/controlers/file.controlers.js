import fs from "fs/promises"

const upload = async (req, res) => {
  if (!req.file)
    return res.status(400).send({ message: "No file uploaded" })

  const isValidFile = ["image/jpeg", "image/png"].includes(req.file.mimetype)

  if (!isValidFile)
    return res.status(400).send({ message: "Invalid file type" })

  const fileBlob = new Blob([await fs.readFile(req.file.path)])

  const formData = new FormData()
  formData.append("secret", "EXAMPLE_SECRET")
  formData.append("file", fileBlob, req.file.originalname)

  try {
    const response = await fetch("https://example.com/upload/", {
      method: "POST",
      body: formData
    })
    const responseData = await response.json()
    res.status(response.status).send(responseData)
  } catch (error) {
    res.status(500).send({ message: "Something went wrong" })
  } finally {
    fs.unlink(req.file.path)
  }
}

export { upload }