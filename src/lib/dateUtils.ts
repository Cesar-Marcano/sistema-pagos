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
