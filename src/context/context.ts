import { PrismaClient } from '@prisma/client';
import { decodeToken } from '../graphql';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
  userId?: number;
  role?: string;
}

export const context = async ({ req }: any): Promise<Context> => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace('Bearer', '').trim();

    const decodedToken = decodeToken(token);
    const user = await prisma.user.findUnique({
      where: {
        id: decodedToken?.userId,
      },
    });
    if (!user) throw new Error('User not found');
    return {
      prisma,
      userId: user?.id,
      role: user?.role,
    };
  }
  return {
    prisma,
  };
};
