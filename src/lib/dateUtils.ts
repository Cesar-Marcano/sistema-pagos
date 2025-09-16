import { Decimal } from "@prisma/client/runtime/library";

/**
 * Calculates the relative month between a start date and a current date.
 * 
 * @param startDate - The reference start date
 * @param currentDate - The current date to compare against (defaults to today)
 * @returns The relative month number (1-based)
 * 
 * @example
 * // If school year starts in September 2023 and current date is November 2023
 * const startDate = new Date(2023, 8, 1); // September 1, 2023
 * const currentDate = new Date(2023, 10, 15); // November 15, 2023
 * const relativeMonth = calculateRelativeMonth(startDate, currentDate);
 * // Returns 3 (September=1, October=2, November=3)
 */
export function calculateRelativeMonth(
  startDate: Date,
  currentDate: Date = new Date()
): number {
  const startMonth = startDate.getUTCFullYear() * 12 + startDate.getUTCMonth();
  const currentMonth = currentDate.getUTCFullYear() * 12 + currentDate.getUTCMonth();
  
  return currentMonth - startMonth + 1;
}

/**
 * Calculates the overdue date for a school month payment.
 * 
 * @param schoolYearStartDate - The start date of the school year
 * @param schoolMonth - The school month number (1-based)
 * @param paymentDueDay - The day of the month when payment is due
 * @param daysUntilOverdue - Number of grace period days before payment becomes overdue
 * @returns The date when the payment becomes overdue
 */
export function calculateOverdueDate(
  schoolYearStartDate: Date,
  schoolMonth: number,
  paymentDueDay: number,
  daysUntilOverdue: number
): Date {
  const schoolMonthDate = new Date(schoolYearStartDate);
  schoolMonthDate.setUTCMonth(schoolMonthDate.getUTCMonth() + schoolMonth - 1);
  
  const dueDate = new Date(
    Date.UTC(
      schoolMonthDate.getUTCFullYear(),
      schoolMonthDate.getUTCMonth(),
      paymentDueDay
    )
  );
  
  const overdueDate = new Date(dueDate);
  overdueDate.setUTCDate(overdueDate.getUTCDate() + daysUntilOverdue);
  
  return overdueDate;
}

/**
 * Calculates the overdue fee amount based on the base amount and overdue fee settings.
 * 
 * @param baseAmount - The base amount to calculate the overdue fee from
 * @param overdueFeeValue - The overdue fee value from settings
 * @param overdueFeeIsPercentage - Whether the overdue fee is a percentage or fixed amount
 * @returns The calculated overdue fee amount
 */
export function calculateOverdueFee(
  baseAmount: Decimal,
  overdueFeeValue: number,
  overdueFeeIsPercentage: boolean
): Decimal {
  const feeValue = new Decimal(overdueFeeValue);
  
  if (overdueFeeIsPercentage) {
    // Calculate percentage of base amount
    return baseAmount.mul(feeValue.div(100));
  } else {
    // Return fixed amount
    return feeValue;
  }
}
