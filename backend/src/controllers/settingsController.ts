import type { Request, Response } from "express";
import { Setting } from "../models/Setting.js";

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateSettings(req: Request, res: Response): Promise<void> {
  try {
    const data = req.body;
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create(data);
    } else {
      Object.assign(settings, data);
      await settings.save();
    }
    res.json({ success: true, message: "Settings updated successfully", data: settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}
