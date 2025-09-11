export const TYPES = {
  Prisma: Symbol.for("Prisma"),

  // Services
  IHasherService: Symbol.for("HasherService"),
  ITokenService: Symbol.for("TokenService"),
  SettingsService: Symbol.for("SettingsService"),
  AuditLogService: Symbol.for("AuditLogService"),

  // Features
  UserFeature: Symbol.for("UserFeature"),
  SessionFeature: Symbol.for("SessionFeature"),
  SchoolYearFeature: Symbol.for("SchoolYearFeature"),
  GradeFeature: Symbol.for("GradeFeature"),
  SchoolPeriodFeature: Symbol.for("SchoolPeriodFeature"),
  StudentFeature: Symbol.for("StudentFeature"),
  MonthlyFeeFeature: Symbol.for("MonthlyFeeFeature"),
  DiscountFeature: Symbol.for("DiscountFeature"),
  PaymentMethodFeature: Symbol.for("PaymentMethodFeature"),
  PaymentFeature: Symbol.for("PaymentFeature"),
};
