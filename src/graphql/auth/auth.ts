import { extendType, nonNull, stringArg, objectType } from 'nexus';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

type AuthPayload = {
  token: string;
  user: User;
};

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.nonNull.string('token');
    t.nonNull.field('user', {
      type: 'User',
    });
  },
});

export const AuthMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('signup', {
      type: 'AuthPayload',
      args: {
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (
        _parent,
        { firstName, lastName, email, password },
        { prisma },
      ): Promise<AuthPayload> => {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email,
            password: hashedPassword,
          },
        });
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET as string);
        return {
          token,
          user,
        };
      },
    });

    t.nonNull.field('login', {
      type: 'AuthPayload',
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      resolve: async (_parent, { password, email }, { prisma }): Promise<AuthPayload> => {
        const user = await prisma.user.findUnique({
          where: { email },
        });
        // when user is not found
        if (!user) {
          throw new Error('User not found');
        }
        // compare password
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
          throw new Error('Incorrect password');
        }
        // generate token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET as string);
        return {
          user,
          token,
        };
      },
    });
  },
});

export interface AuthTokenPayload {
  userId: number;
  role: string;
}

export const decodeToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, process.env.APP_SECRET as string) as AuthTokenPayload;
  return decoded;
};
