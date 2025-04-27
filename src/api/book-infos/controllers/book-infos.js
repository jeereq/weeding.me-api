"use strict";

/**
 * A set of functions called "actions" for `book-infos`
 */

module.exports = {
  async tomesBook(ctx) {
    const args = strapi.service("api::book-infos.book-infos").getArgs(ctx);
    const count = await strapi.db
      .query("api::tome.tome")
      .count({ where: { book: ctx.params.bookId } });
    const data = await strapi.db
      .query("api::tome.tome")
      .findMany({ where: { book: ctx.params.bookId }, ...args });
    const meta = args;
    const { offset, limit } = meta;
    return ctx.send({ data, meta: { offset, limit, number: count } });
  },
  async getUserBooks(ctx) {
    const args = strapi.service("api::book-infos.book-infos").getArgs(ctx);
    const booksOfTheRequestedUser = await strapi.db
      .query("api::book.book")  
      .findMany({ where: { creator: ctx.params.userId }, ...args });

    const numberOfBooks = await strapi.db
      .query("api::book.book")
      .count({ where: { creator: ctx.params.userId }, ...args });

    const meta = args;
    const { offset, limit } = meta;
    return ctx.send({
      data: booksOfTheRequestedUser,
      meta: { offset, limit, number: numberOfBooks },
    });
  },
};
