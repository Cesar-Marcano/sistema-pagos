import { Settings } from "@prisma/client";

export type SettingKeys = keyof typeof Settings;

export type AllSettingsMap<T> = {
  [K in SettingKeys]: T;
};

export type ValidateDefaultSettings<T> = T &
  Record<Exclude<keyof T, keyof typeof Settings>, never>;

export function createDefaultSettings<T extends AllSettingsMap<any>>(
  settings: ValidateDefaultSettings<T>
): T {
  return settings;
}
