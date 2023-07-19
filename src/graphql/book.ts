import { objectType, extendType } from "nexus";

export const Book = objectType({
    name: "Book",
    definition(t) { 
        t.int("id")
        t.string("title")
        t.string("author")
        t.string("image");
    }
})

export const BookQuery = extendType({
    type: "Query",
    definition(t) { 
        t.list.field("books", {
            type: "Book",
        })
    }
})