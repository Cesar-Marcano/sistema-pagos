import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import {
  AuditableEntities,
  AuditLogActions,
  Grade,
  Student,
} from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";
import { AuditLogService } from "../services/auditLog.service";

@injectable()
export class GradeFeature {
  constructor(
    @inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma,
    @inject(TYPES.AuditLogService)
    private readonly auditLogService: AuditLogService
  ) {}

  public async create(name: string) {
    const existingGrades = await this.prisma.grade.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingGrades > 0)
      throw createHttpError(409, "Ya existe un grado con ese nombre.");

    const newGrade = await this.prisma.grade.create({
      data: {
        name,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.GRADE,
      AuditLogActions.CREATE,
      newGrade
    );

    return newGrade;
  }

  public async update(id: number, name: string) {
    const existingGrades = await this.prisma.grade.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingGrades > 0)
      throw createHttpError(409, "Ya existe un grado con ese nombre.");

    const updatedGrade = await this.prisma.grade.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name,
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.GRADE,
      AuditLogActions.UPDATE,
      { name }
    );

    return updatedGrade;
  }

  public async softDelete(id: number) {
    const softDeletedGrade = await this.prisma.grade.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.GRADE,
      AuditLogActions.SOFT_DELETE,
      { deletedAt: softDeletedGrade.deletedAt }
    );

    return softDeletedGrade;
  }

  public async hardDelete(id: number) {
    const deletedGrade = await this.prisma.grade.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });

    this.auditLogService.createLog(
      AuditableEntities.GRADE,
      AuditLogActions.DELETE,
      {}
    );

    return deletedGrade
  }

  public async findById(id: number, includeDeleted: boolean) {
    return this.prisma.grade.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<Omit<Grade, "id" | "deletedAt" | "createdAt" | "updatedAt">> & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<Grade>> {
    return searchWithPaginationAndCriteria<Grade>(
      this.prisma.grade.findMany,
      this.prisma.grade.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }

  public async findLastGrade(studentId: number) {
    const studentGrade = await this.prisma.studentGrade.findFirst({
      where: {
        studentId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        grade: true,
      },
    });

    if (!studentGrade) {
      throw createHttpError(
        404,
        "No se encontró un grado para este estudiante."
      );
    }

    return studentGrade.grade;
  }

  public async findStudentsByGradeAndPeriod(
    gradeId: number,
    schoolPeriodId: number
  ): Promise<Student[]> {
    const studentGrades = await this.prisma.studentGrade.findMany({
      where: {
        gradeId,
        schoolPeriodId,
        deletedAt: null,
      },
      include: {
        student: true,
      },
    });

    if (studentGrades.length === 0) {
      return [];
    }

    return studentGrades.map((sg) => sg.student);
  }

  public async findStudentsByGradeAndYear(
    gradeId: number,
    schoolYearId: number
  ): Promise<Student[]> {
    const studentGrades = await this.prisma.studentGrade.findMany({
      where: {
        gradeId,
        schoolPeriod: {
          schoolYearId,
        },
        deletedAt: null,
      },
      include: {
        student: true,
      },
    });

    if (studentGrades.length === 0) {
      return [];
    }

    return studentGrades.map((sg) => sg.student);
  }
}
