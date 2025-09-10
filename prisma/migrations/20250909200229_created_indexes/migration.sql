-- CreateIndex
CREATE INDEX "Discount_name_idx" ON "public"."Discount" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Discount_description_idx" ON "public"."Discount" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Grade_name_idx" ON "public"."Grade" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "MonthlyFee_description_idx" ON "public"."MonthlyFee" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "MonthlyFeeOnGrade_monthlyFeeId_gradeId_schoolPeriodId_idx" ON "public"."MonthlyFeeOnGrade"("monthlyFeeId", "gradeId", "schoolPeriodId");

-- CreateIndex
CREATE INDEX "Payment_studentId_schoolPeriodId_paymentMethodId_idx" ON "public"."Payment"("studentId", "schoolPeriodId", "paymentMethodId");

-- CreateIndex
CREATE INDEX "PaymentMethod_name_idx" ON "public"."PaymentMethod" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "SchoolPeriod_name_idx" ON "public"."SchoolPeriod" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "SchoolPeriod_month_schoolYearId_idx" ON "public"."SchoolPeriod"("month", "schoolYearId");

-- CreateIndex
CREATE INDEX "SchoolYear_name_idx" ON "public"."SchoolYear" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "SchoolYear_startDate_endDate_idx" ON "public"."SchoolYear"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Student_name_idx" ON "public"."Student" USING GIN ("name" gin_trgm_ops);
