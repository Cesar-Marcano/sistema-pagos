import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { ExtendedPrisma } from "../config/container";
import { Settings } from "@prisma/client";
import { defaultSettings, DefaultSettings } from "../config/defaultSettings";

@injectable()
export class SettingsService {
  constructor(@inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma) {}

  async set<K extends keyof DefaultSettings>(
    key: K,
    value: DefaultSettings[K]
  ) {
    const stringValue =
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value);

    return await this.prisma.setting.upsert({
      create: {
        name: key as Settings,
        value: stringValue,
      },
      update: {
        value: stringValue,
      },
      where: {
        name: key as Settings,
      },
    });
  }

  async get<K extends keyof DefaultSettings>(
    key: K
  ): Promise<DefaultSettings[K]> {
    const defaultVal: DefaultSettings[K] = defaultSettings[key];

    const setting = await this.prisma.setting.findFirst({
      where: {
        name: key as Settings,
      },
    });

    if (!setting) {
      return defaultVal;
    }

    const parsedValue = this.parseValue<DefaultSettings[K]>(
      setting.value,
      defaultVal
    );

    return parsedValue;
  }

  private parseValue<T>(value: string, defaultVal: T): T {
    if (defaultVal === null) {
      return (value === "null" ? null : value) as any;
    }

    if (typeof defaultVal === "number") {
      const parsedNumber = parseFloat(value);
      if (!isNaN(parsedNumber)) {
        return parsedNumber as any;
      }
    }

    if (typeof defaultVal === "boolean") {
      return (value.toLowerCase() === "true" || value === "1") as any;
    }

    if (Array.isArray(defaultVal)) {
      try {
        const parsedArray = JSON.parse(value);
        if (Array.isArray(parsedArray)) {
          return parsedArray as any;
        }
      } catch (e) {
        return defaultVal as any;
      }
    }

    return value as any;
  }
}
