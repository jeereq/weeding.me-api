"use strict";

/**
 * book-infos service
 */

module.exports = () => ({
  getArgs(ctx) {
    const offset = ctx.query.offset || 0;
    const limit = ctx.query.limit || 10;
    const populate = ctx.query.populate || "";
    const select = ctx.query.select || "";

    console.log("ctx.query", ctx.params.userId);

    const args = {
      select: select?.split(","),
      populate: populate?.split(","),
      offset: +offset,
      limit: +limit,
    };
    if (args.select == "") delete args.select;
    if (args.populate == "") delete args.populate;
    return args;
  },
});
