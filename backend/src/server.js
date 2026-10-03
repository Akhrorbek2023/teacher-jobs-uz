import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import vacancies from "./routes/vacancies.js";
import ai from "./routes/ai.js";
import companies from "./routes/companies.js";
import { startBot } from "./bot.js";

const app = express();
app.use(helmet());
const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map(o => o.trim())
  : ["http://localhost:3000", "http://127.0.0.1:3000"];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || configuredOrigins.includes(origin) || configuredOrigins.includes("*")) {
      return cb(null, true);
    }
    // Allow any localhost origin in development
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return cb(null, true);
    }
    cb(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({ windowMs: 60_000, limit: 120 }));
app.get("/api/health", (_req,res) => res.json({ ok:true, service:"teacher-jobs-uz-api" }));
app.use("/api/vacancies", vacancies);
app.use("/api/companies", companies);
app.use("/api/ai", ai);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.name === "ZodError") return res.status(400).json({ error: "Invalid request", details: err.issues });
  res.status(500).json({ error: err?.message || "Internal server error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API: http://localhost:${port}`);
  // Start the telegram bot alongside the API
  startBot().catch(err => console.error("Bot xatoligi:", err));
});
