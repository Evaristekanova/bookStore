import { objectType, extendType, nonNull, stringArg } from "nexus";
import cloudinary from "cloudinary";
import cloudinaryConfig from "../cloudinary/config";

interface BookArgs {
  title: string;
  author: string;
  image: string;
}

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
      resolve: async (_parent, _args, { prisma }) => {
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
      resolve: async (_, { title, author, image }: BookArgs, { prisma }) => {
        cloudinaryConfig;
        try {
          const uploadResponse = await cloudinary.v2.uploader.upload(image, {
            folder: "bookStore",
          });

          return await prisma.book.create({
            data: {
              title,
              author,
              image: uploadResponse.secure_url,
            },
          });
        } catch (error) {
          console.log(error);
          throw new Error("Failed to upload image and create book entry.");
        }
      },
    });
  },
});
