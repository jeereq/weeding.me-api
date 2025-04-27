"use strict";

/**
 * A set of functions called "actions" for `user-tome-buyed`
 */

// na lingi na reccuperer
const _ = require("lodash");

module.exports = {
  userTomeBuyed: async (ctx, next) => {
    try {
      const tomes = await strapi
        .query("api::user-chapter-buy.user-chapter-buy")
        .findMany({
          where: {
            user: ctx.params.userId,
          },
          populate: {
            chapter: {
              populate: {
                tome: {
                  populate: true,
                },
              },
            },
          },
        });
      ctx.send(
        {
          data: _.uniqBy(
            tomes.map(({ chapter: { tome } }) => tome),
            "id"
          ),
          status: 200,
        },
        200
      );
    } catch (err) {
      ctx.send({ message: err.message || "Error", status: 400 }, 400);
    }
  },
};
