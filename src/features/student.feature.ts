import { inject, injectable } from "inversify";
import { TYPES } from "../config/types";
import { Student, StudentGrade } from "@prisma/client";
import createHttpError from "http-errors";
import {
  SearchArgs,
  SearchResult,
  searchWithPaginationAndCriteria,
} from "../lib/search";
import { ExtendedPrisma } from "../config/container";

@injectable()
export class StudentFeature {
  constructor(@inject(TYPES.Prisma) private readonly prisma: ExtendedPrisma) {}

  public async create(name: string): Promise<Student> {
    const existingStudentCount = await this.prisma.student.count({
      where: {
        name,
        deletedAt: null,
      },
    });

    if (existingStudentCount > 0)
      throw createHttpError(
        409,
        "Ya se ha registrado un estudiante con el mismo nombre."
      );

    return await this.prisma.student.create({
      data: {
        name,
      },
    });
  }

  public async update(id: number, name: string): Promise<Student> {
    const student = await this.prisma.student.findUnique({
      where: { id, deletedAt: null },
    });

    if (!student) throw createHttpError(404, "Estudiante no encontrado.");

    if (student.name === name) return student;

    const studentNameCollisions = await this.prisma.student.count({
      where: { name, deletedAt: null },
    });

    if (studentNameCollisions > 0)
      throw createHttpError(
        409,
        "Ya existe un estudiante con ese mismo nombre."
      );

    return await this.prisma.student.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name,
      },
    });
  }

  public async softDelete(id: number): Promise<Student> {
    return await this.prisma.student.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async hardDelete(id: number): Promise<Student> {
    return await this.prisma.student.delete({
      where: {
        id,
        deletedAt: {
          not: null,
        },
      },
    });
  }

  public async findById(
    id: number,
    includeDeleted: boolean
  ): Promise<Student | null> {
    return await this.prisma.student.findUnique({
      where: {
        id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  public async search(
    args: SearchArgs<
      Partial<Omit<Student, "id" | "deletedAt" | "createdAt" | "updatedAt">> & {
        deletedAt?: {
          not: null;
        };
      }
    >
  ): Promise<SearchResult<Student>> {
    return searchWithPaginationAndCriteria<Student>(
      this.prisma.student.findMany,
      this.prisma.student.similarity,
      {
        ...args,
        where: { ...args.where },
      }
    );
  }

  public async registerStudentToGrade(
    studentId: number,
    gradeId: number,
    schoolYearId: number
  ): Promise<StudentGrade> {
    const studentGradesInSchoolYearCount = await this.prisma.studentGrade.count(
      {
        where: {
          studentId,
          schoolYearId,
          deletedAt: null,
        },
      }
    );

    if (studentGradesInSchoolYearCount > 0) {
      throw createHttpError(
        409,
        "El estudiante ya está registrado en este año escolar."
      );
    }

    const [student, schoolYear, grade] = await this.prisma.$transaction([
      this.prisma.student.findUnique({
        where: { id: studentId, deletedAt: null },
      }),
      this.prisma.schoolYear.findUnique({
        where: { id: schoolYearId, deletedAt: null },
      }),
      this.prisma.grade.findUnique({ where: { id: gradeId, deletedAt: null } }),
    ]);

    if (!student) {
      throw createHttpError(404, "Estudiante no encontrado.");
    }
    if (!schoolYear) {
      throw createHttpError(404, "Año escolar no encontrado.");
    }
    if (!grade) {
      throw createHttpError(404, "Grado no encontrado.");
    }

    const existingStudentGrade = await this.prisma.studentGrade.findFirst({
      where: {
        studentId,
        schoolYearId,
        gradeId,
        deletedAt: null,
      },
    });

    if (existingStudentGrade) {
      throw createHttpError(
        409,
        "El estudiante ya está asignado a este grado en este año escolar."
      );
    }

    const newStudentGrade = await this.prisma.studentGrade.create({
      data: {
        studentId,
        schoolYearId,
        gradeId,
      },
    });

    return newStudentGrade;
  }

  public async unregisterStudentFromGrade(
    studentGradeId: number
  ): Promise<StudentGrade> {
    return await this.prisma.studentGrade.update({
      where: {
        id: studentGradeId,
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  public async findStudentGrades(
    studentId: number,
    schoolYearId: number | null = null,
    includeDeleted: boolean = false
  ) {
    return await this.prisma.studentGrade.findMany({
      where: {
        studentId,
        ...(schoolYearId ? { schoolYearId } : {}),
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: {
        grade: true,
      },
      omit: {
        schoolYearId: true,
        studentId: true,
      },
    });
  }

  public async hasGrade(studentId: number, gradeId: number): Promise<boolean> {
    return (
      (await this.prisma.studentGrade.count({
        where: {
          studentId,
          gradeId,
        },
      })) > 0
    );
  }
}
