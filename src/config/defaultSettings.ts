import { PurgableModels } from "@prisma/client";
import { createDefaultSettings } from "../lib/createDefaultSettings";

export const defaultSettings = createDefaultSettings({
  // The ID of the currently active school period.
  // It's null if no school month is currently configured.
  ACTUAL_SCHOOL_PERIOD_ID: null as string | null,

  // The ID of the currently active school month.
  // It's null if no school month is currently configured.
  ACTUAL_SCHOOL_MONTH_ID: null as string | null,

  // The ID of the current school year.
  // It's null if no school year is currently configured.
  ACTUAL_SCHOOL_YEAR_ID: null as string | null,

  // Number of days to retain audit logs. Set to two years to comply with
  // common business data retention policies.
  AUDIT_LOG_RETENTION_DAYS: 30 * 12 * 2,

  // The symbol for the local currency.
  CURRENCY_SYMBOL: "Bs.",

  // The number of days after a due date for a payment to be considered overdue.
  DAYS_UNTIL_OVERDUE: 5,

  // The number of days after which soft-deleted models should be permanently purged from the database.
  // Set to null to disable automatic cleanup.
  DB_CLEANUP_DAYS: 30 as null | number,

  // A boolean flag to enable or disable new user registrations on the platform.
  IS_USER_REGISTRATION_ENABLED: true,

  // The minimum number of characters required for a user's password.
  MINIMUM_PASSWORD_LENGTH: 8,

  // A boolean flag to determine if the overdue fee is a percentage of the total payment amount.
  // False means it's a fixed value.
  OVERDUE_FEE_IS_PERCENTAGE: false,

  // The value of the overdue fee. It can be a percentage (if OVERDUE_FEE_IS_PERCENTAGE is true)
  // or a fixed amount. It's null if no overdue fee is applied.
  OVERDUE_FEE_VALUE: null as null | number,

  // The day of the month on which a new payment fee starts.
  PAYMENT_DUE_DAY: 1,

  // The duration in minutes after which a user's session will expire.
  SESSION_TIMEOUT_MINUTES: 60 * 30,

  // A list of soft-deleted models to be purged by the daily cleanup job.
  // Empty array means no models will be purged.
  SOFT_DELETED_MODELS_TO_PURGE: [] as PurgableModels[],

  // The fuzzy search threshold.
  SEARCH_THRESHOLD: 0.47,

  // A boolean flag to allow or deny free registration on /users/register.
  // A value of 'false' means that users can only be registered by admins.
  PUBLIC_REGISTRATION_ENABLED: true,

  // The alias for the current school period.
  PERIOD_ALIAS: "PERIODO",

  // Whether to automatically enroll students in a new grade.
  AUTO_ENROLL_STUDENTS_IN_NEW_GRADE: true,

  // Whether to automatically enroll students in a new period.
  AUTO_ENROLL_STUDENTS_IN_NEW_PERIOD: true,

  // The day of the month on which to automatically enroll students in a new grade.
  AUTO_ENROLL_GRADE_CRON_DAY: 1,

  // The day of the month on which to automatically enroll students in a new period.
  AUTO_ENROLL_PERIOD_CRON_DAY: 1,
});

export type DefaultSettings = typeof defaultSettings;
