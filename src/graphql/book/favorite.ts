import { objectType, extendType, nonNull, intArg } from 'nexus';
import { Favorite } from '@prisma/client';

export const Favorites = objectType({
  name: 'Favorite',
  definition(t) {
    t.int('id');
    t.int('userId');
    t.int('bookId');
  },
});

export const FavoriteQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.field('favorites', {
      type: 'Favorite',
      resolve: async (_parent, _args, { prisma, userId }): Promise<Favorite[]> => {
        return await prisma.favorite.findMany({ where: { userId: userId } });
      },
    });

    t.nonNull.field('oneFavorite', {
      type: 'Favorite',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, { id }, { prisma }): Promise<Favorite | null> => {
        return await prisma.favorite.findUnique({ where: { id: id } });
      },
    });
  },
});

export const FavoriteMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createFavorite', {
      type: 'Favorite',
      args: {
        bookId: nonNull(intArg()),
      },
      resolve: async (_parent, { bookId }, { prisma, userId }): Promise<Favorite> => {
        return await prisma.favorite.create({ data: { bookId: bookId, userId: userId as number } });
      },
    });

    t.nonNull.field('deleteFavorite', {
      type: 'Favorite',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, { id }, { prisma }): Promise<Favorite> => {
        return await prisma.favorite.delete({ where: { id: id } });
      },
    });
  },
});
