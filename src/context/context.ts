import { PrismaClient } from '@prisma/client';
import { decodeToken } from '../graphql';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  userId?: number;
}

export const context = async ({ req }: any): Promise<Context> => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const decodedToken = decodeToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken.userId,
      },
    });
    return {
      prisma,
      userId: user?.id,
    };
  }
  return {
    prisma,
  };
};
