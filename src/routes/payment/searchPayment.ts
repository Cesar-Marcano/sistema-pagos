import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { PaymentSearchCriteriaQueryParamsSchema } from "./schemas";

const paymentWhereMapper = (queryParams: any) => ({
  ...(queryParams.studentId && { studentId: queryParams.studentId }),
  ...(queryParams.schoolMonthId && {
    schoolMonthId: queryParams.schoolMonthId,
  }),
  ...(queryParams.paymentTags && {
    paymentTags: {
      hasEvery: queryParams.paymentTags,
    },
  }),
  ...(queryParams.amount && { amount: queryParams.amount }),
  ...(queryParams.paymentMethodId && {
    paymentMethodId: queryParams.paymentMethodId,
  }),
  ...(queryParams.reference !== undefined && {
    reference: queryParams.reference,
  }),
  ...(queryParams.verified !== undefined && { verified: queryParams.verified }),
  ...(queryParams.paidAt && { paidAt: queryParams.paidAt }),
});

export const searchPayment = createSearchController(
  PaymentSearchCriteriaQueryParamsSchema,
  TYPES.PaymentFeature,
  paymentWhereMapper,
  {
    searchResultName: "payments",
  }
);
