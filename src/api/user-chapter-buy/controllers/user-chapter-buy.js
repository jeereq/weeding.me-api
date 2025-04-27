"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::user-chapter-buy.user-chapter-buy",
  ({ strapi }) => ({
    async getChapterBuy(ctx) {
      const userChapterBuy = await strapi.db
        .query("api::user-chapter-buy.user-chapter-buy")
        .findMany({
          where: { chapter: { id: ctx.params.chapterId } },
          populate: true,
        });

      return ctx.send({ data: userChapterBuy }, 200);
    },
    async buyChapter(ctx) {
      const { chapterId, userId } = ctx.request.body.data;
      const chapter = await strapi.db
        .query("api::chapter.chapter")
        .findOne({ where: { id: chapterId }, populate: { tome: true } });
      const user = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });

      if (!chapter) {
        return ctx.send(
          {
            data: null,
            message: "Chapitre inexistant sur la plateforme !",
            status: 404,
          },
          404
        );
      }
      if (!user) {
        return ctx.send(
          {
            data: null,
            message: "Utilisateur inexistant sur la plateforme !",
            status: 404,
          },
          404
        );
      }
      if (+user.userCoins < +chapter.coinsPrice) {
        return ctx.send(
          {
            data: null,
            message:
              "Vous n'avez pas assez des pieces pour acheter le chapitre !",
            status: 400,
          },
          400
        );
      } else {
        const userChapterBuyExist = await strapi.db
          .query("api::user-chapter-buy.user-chapter-buy")
          .findOne({
            where: { user: { id: userId }, chapter: { id: chapterId } },
            populate: true,
          });

        if (userChapterBuyExist) {
          return ctx.send({ data: userChapterBuyExist, status: 200 }, 200);
        } else {
          const userChapterBuy = await strapi.db
            .query("api::user-chapter-buy.user-chapter-buy")
            .create({
              data: { chapter: chapterId, user: userId },
              populate: true,
            })
            .then((res) => {
              strapi.db.query("plugin::users-permissions.user").update({
                where: { id: userId },
                data: {
                  userCoins: +user.userCoins - +chapter.coinsPrice,
                },
              });
              strapi.db.query("api::tome.tome").update({
                where: { id: chapter.tome.id },
                data: {
                  userPurchase: +chapter.tome.userPurchase + 1,
                },
              });
              return res;
            });

          return ctx.send({ data: userChapterBuy, status: 200 }, 200);
        }
      }
    },
    async getUserChapterBuy(ctx) {
      const userChapterBuy = await strapi.db
        .query("api::user-chapter-buy.user-chapter-buy")
        .findOne({
          where: {
            chapter: { id: ctx.params.chapterId },
            user: { id: ctx.params.userId },
          },
          populate: true,
        });

      return ctx.send({ data: userChapterBuy }, 200);
    },
  })
);
