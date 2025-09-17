import { Request, Response } from "express";
import { UpsertSettingSchema } from "./schemas";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SettingsService } from "../../services/settings.service";

export async function setSetting(req: Request, res: Response) {
  const { name, value } = UpsertSettingSchema.parse(req.body);

  const settingService = container.get<SettingsService>(
    TYPES.SettingsService
  );

  const setting = await settingService.set(name, value);

  res.json({ [setting.name]: setting.value });
}
