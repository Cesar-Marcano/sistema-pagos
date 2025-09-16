export function isOverdue(
  date: Date,
  dueDay: number,
  gracePeriodDays: number
): boolean {
  if (dueDay < 1 || dueDay > 31) {
    throw new Error("El día de vencimiento debe estar entre 1 y 31.");
  }

  const year = date.getFullYear();
  const month = date.getMonth();

  const dueDate = new Date(year, month, dueDay);

  if (date < dueDate) {
    return false;
  }

  const gracePeriodEndDate = new Date(dueDate);
  gracePeriodEndDate.setDate(dueDate.getDate() + gracePeriodDays);

  return date > gracePeriodEndDate;
}
