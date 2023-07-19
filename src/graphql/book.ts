import { objectType, extendType, nonNull, stringArg } from "nexus";

export const Book = objectType({
  name: "Book",
  definition(t) {
    t.int("id");
    t.string("title");
    t.string("author");
    t.string("image");
  },
});

export const BookQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("books", {
      type: "Book",
      resolve: async (__oot, _, { prisma }) => {
        return await prisma.book.findMany();
      },
    });
  },
});

export const BookMutation = extendType({
  type: "Mutation",
  definition(t) {
    t.field("createBook", {
      type: "Book",
      args: {
        title: nonNull(stringArg()),
        author: nonNull(stringArg()),
        image: nonNull(stringArg()),
      },
      resolve: async (_, { title, author, image }, { prisma }) => {
        return await prisma.book.create({
          data: {
            title,
            author,
            image,
          },
        });
      },
    });
  },
});
