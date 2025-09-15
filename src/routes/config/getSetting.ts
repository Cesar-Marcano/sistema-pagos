import { Request, Response } from "express";
import { TYPES } from "../../config/types";
import { container } from "../../config/container";
import { SettingsService } from "../../services/settings.service";
import { GetSettingParamsSchema } from "./schemas";

export async function getSetting(req: Request, res: Response) {
  const settingService = container.get<SettingsService>(TYPES.SettingsService);

  const { name } = GetSettingParamsSchema.parse(req.params);

  const setting = await settingService.get(name);

  res.json({ [name]: setting });
}
