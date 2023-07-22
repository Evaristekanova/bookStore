import { objectType, extendType, nonNull, intArg, stringArg } from 'nexus';
import * as jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '@prisma/client';
dotenv.config();

export const Users = objectType({
  name: 'User',
  definition(t) {
    t.int('id');
    t.string('firstName');
    t.string('lastName');
    t.string('email');
    t.string('password');
  },
});

export const UserQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('users', {
      type: 'User',
      resolve: async (_parent, _args, { prisma }): Promise<User[]> => {
        return await prisma.user.findMany();
      },
    });

    t.nonNull.field('oneUser', {
      type: 'User',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, { id }, { prisma }): Promise<User> => {
        const result = await prisma.user.findUnique({
          where: { id },
        });
        if (!result) {
          throw new Error('The user you are looking for does not exist.');
        }
        return result;
      },
    });
  },
});

export const UserMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateUser', {
      type: 'User',
      args: {
        id: nonNull(intArg()),
        firstName: nonNull(stringArg()),
        lastName: nonNull(stringArg()),
      },
      resolve: async (_parent, { id, firstName, lastName }, { prisma, userId }): Promise<User> => {
        if (!userId) {
          throw new Error('You must be logged in to update your profile.');
        }
        const user = await prisma.user.update({
          where: { id },
          data: {
            firstName,
            lastName,
          },
        });
        return user;
      },
    });
  },
});
