import { Request, Response } from "express";
import { z } from "zod";
import { createSearchController } from "../../lib/searchController";
import { TYPES } from "../../config/types";
import { DiscountSearchCriteriaQueryParams } from "./schemas";

const discountWhereMapper = (queryParams: any) => ({
  ...(queryParams.name && { name: queryParams.name }),
  ...(queryParams.description && { description: queryParams.description }),
  ...(queryParams.amount && { amount: queryParams.amount }),
  ...(queryParams.isPercentage !== undefined && {
    isPercentage: queryParams.isPercentage,
  }),
});

export const searchDiscount = createSearchController(
  DiscountSearchCriteriaQueryParams,
  TYPES.DiscountFeature,
  discountWhereMapper,
  {
    searchResultName: "discounts",
  }
);
