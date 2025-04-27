"use strict";


module.exports = {
  BuyChapter: async (ctx) => {
    try {
      const { user, chapter } = ctx.request.body;
      const { userCoins } = await strapi.db
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: user } });
      const { coinsPrice } = await strapi.db
        .query("api::chapter.chapter")
        .findOne({ where: { id: chapter } });
      if (+userCoins >= +coinsPrice) {
        const answer = +userCoins - +coinsPrice;
        await strapi.db
          .query("plugin::users-permissions.user")
          .update({ where: { id: user }, data: { userCoins: answer } });
        const data = await strapi.db
          .query("api::user-chapter-buy.user-chapter-buy")
          .create({ data: { user, chapter } });
        ctx.send({ data, message: "Achat reussi !" }, 200);
      } else {
        ctx.send({ message: "Vous n'avez pas assez des coins !" }, 400);
      }
    } catch (err) {
      ctx.send({ message: err.message }, 400);
    }
  },
  createChapter: async (ctx) => {
    try {
      const { data } = ctx.request.body;
      const chapterCreated = await strapi.db
        .query("api::chapter.chapter")
        .create({ data });

      const chaptersOfThisTome = await strapi.db
        .query("api::chapter.chapter")
        .findMany({ where: { tome: { id: data.tome.id } } });

      const initialValue = 0;
      const coinsPricesofAllTheChaptersOfThisTome = chaptersOfThisTome.reduce(
        (accumulator, currentValue) => {
          return accumulator + currentValue.coinsPrice;
        },
        initialValue
      );

      const tome = await strapi.db.query("api::tome.tome").update({
        data: { coinsPrice: coinsPricesofAllTheChaptersOfThisTome },
        where: { id: data.tome.id },
      });

      return ctx.send(
        {
          data: {
            id: chapterCreated?.id,
            attributes: { ...chapterCreated },
          },
        },
        200
      );
    } catch (err) {
      ctx.send({ message: err.message }, 400);
    }
  },
  updateChapter: async (ctx) => {
    try {
      const { data } = ctx.request.body;
      const { chapterId } = ctx.params;

      console.log("TEST", chapterId);

      const chapterUpdated = await strapi.db
        .query("api::chapter.chapter")
        .update({
          data,
          where: { id: chapterId },
        });

      const chaptersOfThisTome = await strapi.db
        .query("api::chapter.chapter")
        .findMany({ where: { tome: { id: data.tome.id } } });

      const initialValue = 0;
      const coinsPricesofAllTheChaptersOfThisTome = chaptersOfThisTome.reduce(
        (accumulator, currentValue) => {
          return accumulator + currentValue.coinsPrice;
        },
        initialValue
      );

      const tome = await strapi.db.query("api::tome.tome").update({
        data: { coinsPrice: coinsPricesofAllTheChaptersOfThisTome },
        where: { id: data.tome.id },
      });

      return ctx.send(
        {
          data: {
            id: chapterUpdated?.id,
            attributes: { ...chapterUpdated },
          },
        },
        200
      );
    } catch (err) {
      ctx.send({ message: err.message }, 400);
    }
  },
};
