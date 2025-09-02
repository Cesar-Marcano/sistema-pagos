import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { PaymentSearchCriteriaQueryParamsSchema } from "./schemas";

const paymentWhereMapper = (queryParams: any) => ({
  ...(queryParams.studentId && { studentId: queryParams.studentId }),
  ...(queryParams.schoolPeriodId && { schoolPeriodId: queryParams.schoolPeriodId }),
  ...(queryParams.paymentType && { paymentType: queryParams.paymentType }),
  ...(queryParams.amount && { amount: queryParams.amount }),
  ...(queryParams.paymentMethodId && {
    paymentMethodId: queryParams.paymentMethodId,
  }),
  ...(queryParams.reference !== undefined && {
    reference: queryParams.reference,
  }),
  ...(queryParams.verified !== undefined && { verified: queryParams.verified }),
});

export const searchPayment = createSearchController(
  PaymentSearchCriteriaQueryParamsSchema,
  TYPES.PaymentFeature,
  paymentWhereMapper,
  {
    searchResultName: "payments",
  }
);
