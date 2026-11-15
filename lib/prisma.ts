import { PrismaClient } from "@prisma/client";

type PrismaClientWithOrganizations = PrismaClient & {
  organization: any;
  organizationMember: any;
};

const globalForPrisma = global as unknown as { prisma?: PrismaClientWithOrganizations };

export const prisma: PrismaClientWithOrganizations =
  globalForPrisma.prisma ||
  (new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  }) as PrismaClientWithOrganizations);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
