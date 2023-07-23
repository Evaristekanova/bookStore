import { extendType, objectType, nonNull, intArg, stringArg } from 'nexus';
import { bookCategory } from '@prisma/client';

export const CategoryType = objectType({
  name: 'category',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('name');
  },
});

export const CategoryQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('categories', {
      type: 'category',
      resolve: async (_parent, _args, { prisma }): Promise<bookCategory[]> => {
        return await prisma.bookCategory.findMany();
      },
    });

    t.field('category', {
      type: 'category',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, { id }, { prisma }): Promise<bookCategory | null> => {
        return await prisma.bookCategory.findUnique({ where: { id: id } });
      },
    });
  },
});

export const CategoryMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createCategory', {
      type: 'category',
      args: {
        name: nonNull(stringArg()),
      },
      resolve: async (_parent, { name }, { prisma, userId }) => {
        if (!userId) throw new Error('You must be logged in to perform this action');
        // if (role && role.toLowerCase() !== 'admin')
        //   throw new Error('You are not authorized to perform this action');
        else {
          return await prisma.bookCategory.create({ data: { name: name } });
        }
      },
    });

    // t.nonNull.field('updateCategory', {
    //   type: 'category',
    //   args: {
    //     id: nonNull(intArg()),
    //     name: nonNull(stringArg()),
    //   },
    //   resolve: async (_parent, { id, name }, { prisma, userId, role }): Promise<bookCategory> => {
    //     if (!userId && !role) throw new Error('You must be logged in to perform this action');
    //     if (role && role !== 'admin')
    //       throw new Error('You are not authorized to perform this action');

    //     const category = await prisma.bookCategory.findUnique({ where: { id } });
    //     if (category) throw new Error(`Category with ID ${id} does not exist`);
    //     const updatedCategory = await prisma.bookCategory.update({ where: { id }, data: { name } });
    //     return updatedCategory;
    //   },
    // });

    // t.nonNull.field('deleteCategory', {
    //   type: 'category',
    //   args: {
    //     id: nonNull(intArg()),
    //   },
    //   resolve: async (_parent, { id }, { prisma, userId, role }): Promise<bookCategory> => {
    //     if (!userId && !role) throw new Error('You must be logged in to perform this action');
    //     if (role && role !== 'admin')
    //       throw new Error('You are not authorized to perform this action');

    //     const category = await prisma.bookCategory.findUnique({ where: { id } });
    //     if (!category) throw new Error(`Category with ID ${id} does not exist`);
    //     return await prisma.bookCategory.delete({ where: { id } });
    //   },
    // });
  },
});
