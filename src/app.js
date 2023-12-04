import express from "express"
import file from "./routes/file.routes.js"

const app = express()

app.use("/api/v1/file", file)

export default app