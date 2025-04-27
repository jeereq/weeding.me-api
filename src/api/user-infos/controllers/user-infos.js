'use strict';

/**
 * A set of functions called "actions" for `user-infos`
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::user-category.user-category', ({ strapi }) => ({
  async tomesByCategory(ctx) {
    const args = strapi.service("api::user-infos.user-infos").getArgs(ctx)
    const categoriesList = await strapi.query('api::user-category.user-category').findMany({ where: { user: ctx.params.user }, populate: true })
    const categories = categoriesList.map(({ category: { id } }) => {
      return ({ category: id })
    })
    const count = await strapi.db.query('api::tome-category.tome-category').count({
      where: {
        $or: categories
      }
    })
    const data = await strapi.db.query('api::tome-category.tome-category').findMany({
      where: {
        $or: categories
      }, ...args
    })
    const meta = args
    const { offset, limit } = meta
    return ctx.send({ data, meta: { offset, limit, number: count } })
  },
  async getUserCategories(ctx) {
    const { user } = ctx.request.body.data
    const data = await strapi.query('api::user-category.user-category').findMany({ where: { user: { id: user } }, populate: true })

    return ctx.send({
      data: data.map(function ({ category }) {
        return category
      }),
    })
  },
  async createUserCategories(ctx) {
    const { userCategories } = ctx.request.body.data
    const data = []
    for (let index = 0; index < userCategories.length; index++) {
      const element = userCategories[index];
      let find = await strapi.query('api::user-category.user-category').findOne({ where: element, populate: true })
      if (!find) find = await strapi.query('api::user-category.user-category').create({ data: element, populate: true })
      data.push(find)
    }

    return ctx.send({
      data: data.map(function ({ category }) {
        return category
      }),
    })
  },
  async tomesByFavorite(ctx) {
    const args = strapi.service("api::user-infos.user-infos").getArgs(ctx)
    const count = await strapi.db.query('api::user-tome-favorite.user-tome-favorite').count({ where: { user: ctx.params.user } })
    const data = await strapi.db.query('api::user-tome-favorite.user-tome-favorite').findMany({ where: { user: ctx.params.user }, ...args })
    const meta = args
    const { offset, limit } = meta
    return ctx.send({ data, meta: { offset, limit, number: count } })
  },
  async updateUser(ctx) {
    // @ts-ignore
    const data = ctx.request?.body?.data;
    strapi
      .query("plugin::users-permissions.user")
      .update({ data, where: { id: ctx.params.userId } });
    ctx.send({ data, status: 200 })
  },
  async updateUserPassword(ctx) {
    // @ts-ignore
    const { password, newPassword } = ctx.request?.body?.data;
    const user = await strapi
      .query("plugin::users-permissions.user").findOne({ where: { id: ctx.params.userId } })
    if (!user) {
      {
        ctx.send({ message: "Utilisateur non trouver!", status: 404 }, 404)
      }
    }
    // @ts-ignore
    if (password == user?.password) {
      const res = await strapi
        .query("plugin::users-permissions.user")
        .update({ data: { password: newPassword }, where: { id: ctx.params.userId } });

      ctx.send({ data: res, status: 200 }, 200)
    } else {
      ctx.send({ status: 400, message: "Mot de passe non identique " }, 400)
    }
  }
}));
