"use strict";

/**
 * user-tome-comment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::user-tome-comment.user-tome-comment",
  ({ strapi }) => ({
    async getCommentsOfATome(ctx) {
      const comments = await strapi.db
        .query("api::user-tome-comment.user-tome-comment")
        .findMany({
          where: { tome: { id: ctx.params.tomeId } },
          populate: true,
          orderBy: [{ createdAt: "desc" }],
        });

      return ctx.send({ data: comments, status: 200 }, 200);
    },
    async getCommentsOfATomeStat(ctx) {
      const data = await Promise.all([
        strapi.db.query("api::user-tome-comment.user-tome-comment").count({
          where: { tome: { id: ctx.params.tomeId } },
        }),
        strapi.db.query("api::user-tome-comment.user-tome-comment").count({
          where: { tome: { id: ctx.params.tomeId }, note: 1 },
        }),
        strapi.db.query("api::user-tome-comment.user-tome-comment").count({
          where: { tome: { id: ctx.params.tomeId }, note: 2 },
        }),
        strapi.db.query("api::user-tome-comment.user-tome-comment").count({
          where: { tome: { id: ctx.params.tomeId }, note: 3 },
        }),
        strapi.db.query("api::user-tome-comment.user-tome-comment").count({
          where: { tome: { id: ctx.params.tomeId }, note: 4 },
        }),
        strapi.db.query("api::user-tome-comment.user-tome-comment").count({
          where: { tome: { id: ctx.params.tomeId }, note: 5 },
        }),
      ]).then(([all, un, deux, trois, quatre, cinq]) => {
        let comments = 0;
        comments = un + deux * 2 + trois * 3 + quatre * 4 + cinq * 5;
        const taux = comments / all;
        return {
          data: {
            all: { number: all || 0, "%": Math.ceil(taux) || 0 },
            1: { number: un || 0, "%": Math.ceil((un / all) * 100) || 0 },
            2: { number: deux || 0, "%": Math.ceil((deux / all) * 100) || 0 },
            3: { number: trois || 0, "%": Math.ceil((trois / all) * 100) || 0 },
            4: {
              number: quatre || 0,
              "%": Math.ceil((quatre / all) * 100) || 0,
            },
            5: { number: cinq || 0, "%": Math.ceil((cinq / all) * 100) || 0 },
          },
          status: 200,
        };
      });
      ctx.send(data, 200);
    },
    async create(ctx) {
      const { tomeId, userId, comment, note } = ctx?.request?.body?.data;
      const data = await strapi.db
        .query("api::user-tome-comment.user-tome-comment")
        .create({
          data: { tome: tomeId, user: userId, comment, note },
          populate: true,
          orderBy: [{ createdAt: "desc" }],
        })
        .then((data) => {
          strapi.db
            .query("api::tome.tome")
            .findOne({ where: { id: tomeId } })
            .then((tome) => {
              strapi.db.query("api::tome.tome").update({
                where: { id: tomeId },
                data: { likesNumber: +tome.likesNumber + note },
              });
            });
          return data;
        });

      return ctx.send({ data, status: 200 }, 200);
    },
  })
);
