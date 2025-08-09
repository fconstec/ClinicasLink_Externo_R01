import express from "express";
import { supabase } from "../supabaseClient";

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const { error } = await supabase
      .from("clinics")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (error) {
      return res.status(503).json({
        ok: false,
        service: "supabase",
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    res.json({ ok: true, service: "supabase" });
  } catch (e: any) {
    res.status(503).json({
      ok: false,
      service: "supabase",
      message: e?.message || "unknown error"
    });
  }
});

export default router;