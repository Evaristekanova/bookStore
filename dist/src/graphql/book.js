"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookMutation = exports.BookQuery = exports.Book = void 0;
const nexus_1 = require("nexus");
const cloudinary_1 = __importDefault(require("cloudinary"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.Book = (0, nexus_1.objectType)({
    name: "Book",
    definition(t) {
        t.int("id");
        t.string("title");
        t.string("author");
        t.string("image");
    },
});
exports.BookQuery = (0, nexus_1.extendType)({
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
exports.BookMutation = (0, nexus_1.extendType)({
    type: "Mutation",
    definition(t) {
        t.field("createBook", {
            type: "Book",
            args: {
                title: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                author: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
                image: (0, nexus_1.nonNull)((0, nexus_1.stringArg)()),
            },
            resolve: async (_, { title, author, image }, { prisma }) => {
                cloudinary_1.default.v2.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                });
                try {
                    const uploadResponse = await cloudinary_1.default.v2.uploader.upload(image, {
                        folder: "bookStore",
                    });
                    console.log(uploadResponse);
                    return await prisma.book.create({
                        data: {
                            title,
                            author,
                            image: uploadResponse.secure_url,
                        },
                    });
                }
                catch (error) {
                    console.log(error);
                    throw new Error("Failed to upload image and create book entry.");
                }
            },
        });
    },
});
//# sourceMappingURL=book.js.map