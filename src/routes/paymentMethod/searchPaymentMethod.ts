import { Request, Response } from "express";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { PaymentMethodSearchCriteriaQueryParams } from "./schemas";

const paymentMethodWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.requiresManualVerification !== undefined && {
    requiresManualVerification: queryParams.requiresManualVerification,
  }),
  ...(queryParams.requiresReferenceId !== undefined && {
    requiresReferenceId: queryParams.requiresReferenceId,
  }),
});

export const searchPaymentMethod = createSearchController(
  PaymentMethodSearchCriteriaQueryParams,
  TYPES.PaymentMethodFeature,
  paymentMethodWhereMapper,
  {
    searchResultName: "paymentMethods"
  }
);
