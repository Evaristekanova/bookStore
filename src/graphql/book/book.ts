import { objectType, extendType, nonNull, stringArg, intArg, nullable } from 'nexus';
import cloudinary from 'cloudinary';
import cloudinaryConfig from '../../cloudinary/config';
import { Book } from '@prisma/client';

export const Books = objectType({
  name: 'Book',
  definition(t) {
    t.int('id');
    t.string('title');
    t.string('author');
    t.string('image');
    t.string('cloudinaryId');
    t.string('categoryId');
  },
});

export const BookQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('books', {
      type: 'Book',
      resolve: async (_parent, _args, { prisma }): Promise<Book[]> => {
        try {
          return await prisma.book.findMany();
        } catch (error) {
          console.log(error);
          throw new Error('Failed to fetch books.');
        }
      },
    });

    t.field('oneBook', {
      type: 'Book',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_parent, { id }, { prisma }): Promise<Book | null> => {
        try {
          return await prisma.book.findUnique({ where: { id: id } });
        } catch (error) {
          console.log(error);
          throw new Error('The book you are looking for does not exist.');
        }
      },
    });
  },
});

export const BookMutation = extendType({
  type: 'Mutation',
  definition(t) {
    // BOOK CREATE
    t.field('createBook', {
      type: 'Book',
      args: {
        title: nonNull(stringArg()),
        author: nonNull(stringArg()),
        image: nonNull(stringArg()),
        categoryId: nonNull(intArg()),
      },
      resolve: async (
        _,
        { title, author, image, categoryId },
        { prisma, userId, role },
      ): Promise<Book> => {
        cloudinaryConfig;
        try {
          if (!userId && !role) throw new Error('You must be logged in to perform this action');
          if (role && role !== 'admin')
            throw new Error('You are not authorized to perform this action');

          const uploadResponse = await cloudinary.v2.uploader.upload(image, {
            folder: 'bookStore',
          });

          return await prisma.book.create({
            data: {
              title,
              author,
              image: uploadResponse.secure_url,
              cloudinaryId: uploadResponse.public_id,
              categoryId,
              createdBy: userId as number,
            },
          });
        } catch (error) {
          console.log(error);
          throw new Error('Failed to upload image and create book entry.');
        }
      },
    });

    // BOOK UPDATE
    t.field('updateBook', {
      type: 'Book',
      args: {
        id: nonNull(intArg()),
        title: nonNull(stringArg()),
        author: nonNull(stringArg()),
        image: nonNull(stringArg()),
        categoryId: nonNull(intArg()),
      },
      resolve: async (_, { id, title, author, image }, { prisma, userId, role }): Promise<Book> => {
        cloudinaryConfig;
        try {
          if (!userId && !role) throw new Error('You must be logged in to perform this action');
          if (role && role !== 'admin')
            throw new Error('You are not authorized to perform this action');

          const book = await prisma.book.findUnique({
            where: { id },
          });
          if (!book) throw new Error('Book not found!');

          await cloudinary.v2.uploader.destroy(book?.cloudinaryId as string);
          const uploadResponse = await cloudinary.v2.uploader.upload(image, {
            folder: 'bookStore',
          });
          if (book.createdBy !== userId)
            throw new Error(
              'You are not allow to perform this action, you are not the owner of this book.',
            );
          return await prisma.book.update({
            where: { id },
            data: {
              title,
              author,
              image: uploadResponse.secure_url,
              cloudinaryId: uploadResponse.public_id,
            },
          });
        } catch (error) {
          console.log(error);
          throw new Error('Failed to upload image and create book entry.');
        }
      },
    });

    // BOOK DELETE
    t.field('deleteBook', {
      type: 'Book',
      args: {
        id: nonNull(intArg()),
      },
      resolve: async (_, { id }, { prisma, userId, role }): Promise<Book | null> => {
        try {
          if (!userId && !role) throw new Error('You must be logged in to perform this action');
          if (role && role !== 'admin')
            throw new Error('You are not authorized to perform this action');
          const book = await prisma.book.findUnique({
            where: { id },
          });
          if (!book) throw new Error('Book not found!');

          await cloudinary.v2.uploader.destroy(book?.cloudinaryId as string);

          return await prisma.book.delete({
            where: { id },
          });
        } catch (error) {
          console.log(error);
          throw new Error('Failed to delete book entry.');
        }
      },
    });
  },
});
