import express from "express";
import cors from "cors";
import path from "path";

import professionalsRouter from "./routes/professionals";
import patientsRouter from "./routes/patients";
import appointmentsRouter from "./routes/appointments";
import servicesRouter from "./routes/services";
import stockRouter from "./routes/stock";
import clinicSettingsRouter from "./routes/clinicSettings";
import clinicsRouter from "./routes/clinics";

import { toSnakeCaseBody, toCamelCaseResponse } from "./middleware/caseConverter";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Wrapper para middlewares async (Express 4.x)
function asyncMiddleware(fn: any) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Middlewares para conversão de case
app.use(asyncMiddleware(toSnakeCaseBody));
app.use(toCamelCaseResponse);

const uploadsDirectory = path.join(__dirname, "..", "uploads");
app.use("/uploads", express.static(uploadsDirectory));

// Rotas principais
app.use("/api/professionals", professionalsRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/stock", stockRouter);
app.use("/api/clinic-settings", clinicSettingsRouter);
app.use("/api/clinics", clinicsRouter);
app.use("/api/patients", patientsRouter);

app.get("/api", (_req, res) => {
  res.send("API Clínica rodando!");
});

export default app;