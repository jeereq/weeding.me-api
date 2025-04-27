"use strict";

/**
 * A set of functions called "actions" for `tome-infos`
 */

function supprimerDoublonsParPropriete(tableau, propriete) {
  // Créer un objet pour stocker les valeurs uniques de la propriété
  const uniques = {};
  // Filtrer le tableau en conservant uniquement les éléments dont la propriété n'est pas encore dans l'objet uniques
  return tableau.filter(element => {
    if (!uniques[element[propriete]]) {
      uniques[element[propriete]] = true;
      return true;
    }
    return false;
  });
}

module.exports = {

  async chaptersOfTome(ctx) {
    try {
      const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
      const count = await strapi.db
        .query("api::chapter.chapter")
        .count({ where: { tome: ctx.params.tomeId } });
      const chapters = await Promise.all(
        await strapi.db
          .query("api::chapter.chapter")
          .findMany({
            where: { tome: ctx.params.tomeId }, ...args,
            orderBy: { number: "asc" }
          })
      );
      const data = [];
      for (let index = 0; index < chapters.length; index++) {
        let chapter = chapters[index];
        const buyedChapter = await strapi.db
          .query("api::user-chapter-buy.user-chapter-buy")
          .findOne({
            where: {
              chapter: { id: chapter.id },
              user: { id: ctx.params.userId },
            },
          });
        chapter.buyedChapter = buyedChapter;
        data.push({ ...chapter, buyedChapter });
      }
      const meta = args;
      const { offset, limit } = meta;
      return ctx.send({ data, meta: { offset, limit, number: count } });
    } catch (error) {
      ctx.send({ message: "Error" }, 400);
    }
  },
  async createChapter(ctx) {
    try {
      const chapter = await strapi.db
        .query("api::chapter.chapter")
        .create({ data: ctx.request.body.data, populate: true });

      const buyedChapter = await strapi.db
        .query("api::user-chapter-buy.user-chapter-buy")
        .findOne({
          where: {
            chapter: { id: chapter.id },
            user: { id: ctx.params.userId },
          }
        });

      chapter.buyedChapter = buyedChapter;

      return ctx.send({ data: chapter });

    } catch (error) {
      ctx.send({ message: "Error" }, 400);
    }
  },
  async updateReadChapter(ctx) {
    const buyedChapter = await strapi.db
      .query("api::user-chapter-buy.user-chapter-buy")
      .update({
        where: {
          chapter: { id: ctx.params.chapterId },
          user: { id: ctx.params.userId },
        },
        data: { read: true },
      });
    ctx.send({ data: buyedChapter, status: 200 }, 200);
  },
  async updateTome(ctx) {
    // @ts-ignore
    const { id, ...data } = ctx.request?.body?.data;
    strapi
      .query("api::tome.tome")
      .update({ data, where: { id } });
    ctx.send({ data, status: 200 })
  },
  async categoriesOfTome(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const categoriesList = await strapi
      .query("api::tome-category.tome-category")
      .findMany({
        where: { tome: { id: ctx.params.tomeId } },
        populate: {
          category: { populate: true },
        },
      });
    const data = categoriesList.map(({ category }) => {
      return category;
    });
    const count = await await strapi
      .query("api::tome-category.tome-category")
      .count({
        where: { tome: { id: ctx.params.tomeId } },
        populate: {
          category: { populate: true },
        },
      });
    const meta = args;
    const { offset, limit } = meta;
    return ctx.send({ data, meta: { offset, limit, number: count } });
  },
  async tomesOfCategory(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const categoriesList = await strapi
      .query("api::tome-category.tome-category")
      .findMany({
        where: { category: { id: ctx.params.categoryId } },
        populate: {
          tome: { populate: true },
        },
      });


    const data = categoriesList.map(({ tome }) => {
      return tome;
    });
    const count = await strapi.db
      .query("api::tome-category.tome-category")
      .count({
        where: { category: { id: ctx.params.categoryId } },
      });
    const { offset, limit } = args;
    return ctx.send({
      data: data.filter(function (item, index) {
        return index >= offset - 1 && index <= offset + limit
      }), meta: { offset, limit, number: count }
    });
  },
  async tomesFavorites(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const categoriesList = await strapi
      .query("api::user-tome-favorite.user-tome-favorite")
      .findMany({ where: { user: { id: ctx.params.userId } }, populate: { tome: true } });

    let tomes = categoriesList
      .filter(function ({ tome }) { return tome })

    const data = supprimerDoublonsParPropriete(tomes.map(function ({ tome }) { return tome }), "id")
    const count = data.length
    const { offset, limit } = args;
    return ctx.send(
      {
        data: data.filter(function (item, index) {
          return (index >= (offset - 1)) && (index < ((offset - 1) + limit))
        }), meta: {
          offset,
          limit,
          number: count,
          countPage: Math.ceil(count / limit)
        }, status: 200
      },
      200
    );
  },
  async tomesSearch(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);

    const count = await strapi.db.query("api::tome.tome").count({
      where: {
        $or: [
          {
            name: {
              $containsi: ctx.request.body.data.search,
            },
          },
          {
            author: {
              $containsi: ctx.request.body.data.search,
            },
          },
        ],
      },
      ...args,
    });
    const data = await strapi.db.query("api::tome.tome").findMany({
      where: {
        $or: [
          {
            name: {
              $containsi: ctx.request.body.data.search,
            },
          },
          {
            author: {
              $containsi: ctx.request.body.data.search,
            },
          },
        ],
      },
      ...args,
    });
    const { offset, limit } = args;
    return ctx.send(
      {
        data, meta: {
          offset, limit, number: count,
          countPage: Math.ceil(count / limit)
        }, status: 200
      },
      200
    );
  },
  async tomesSearchCategory(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const count = await strapi.db.query("api::tome-category.tome-category").count({
      where: {
        $or: [
          {
            category: {
              id: { $eq: ctx.request.body.data.tomeId, }
            },
            tome: {
              coinsPrice: {
                $gte: 0,
                $lte: ctx.request.body.data.coinsPrice
              }
            }
          },
        ],
      },
      ...args,
    });
    const data = await strapi.db.query("api::tome-category.tome-category").findMany({
      where: {
        $or: [
          {
            category: {
              id: { $eq: ctx.request.body.data.tomeId, }
            },
            tome: {
              coinsPrice: {
                $gte: 0,
                $lte: ctx.request.body.data.coinsPrice
              }
            }
          },
        ],
      },
      ...args,
    });
    const meta = args;
    const { offset, limit } = meta;
    return ctx.send(
      {
        data, meta: {
          offset,
          limit,
          number: count,
          countPage: Math.ceil(count / limit)
        }, status: 200
      },
      200
    );
  },
  async tomesBuyed(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const chaptersBuyedList = await strapi
      .query("api::user-chapter-buy.user-chapter-buy")
      .findMany({
        where: {
          user: {
            id: ctx.params.userId
          }
        },
        populate: {
          chapter: {
            populate: true
          }
        }
      });
  
    const data = supprimerDoublonsParPropriete(
      chaptersBuyedList
        .map(function ({ chapter: { tome } }) {
          return tome
        })
        .filter(function (tome) {
          return tome
        })
    )

    const count = data.length
    const { offset, limit } = args;

    return ctx.send(
      {
        data: data.filter(function (item, index) {
          return (index >= (offset - 1)) && (index < ((offset - 1) + limit))
        }),
        meta: { offset, limit, number: count, countPage: Math.ceil(count / limit) }, status: 200
      },
      200
    );
  },
  async increment(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const find = await strapi.db
      .query("api::tome.tome")
      .findOne({ where: { id: ctx.params.tomeId } });

    if (!find) {
      return ctx.send({ message: "Tome inexistant sur la plateforme" }, 404);
    }
    const views = +find.userViews;
    const data = await strapi.db.query("api::tome.tome").update({
      where: { id: ctx.params.tomeId },
      data: {
        userViews: +views + 1,
      },
      ...args,
    });
    if (ctx.query.userId) {
      const find = await strapi.db
        .query("api::user-tome-favorite.user-tome-favorite")
        .findOne({
          where: { tome: ctx.params.tomeId, user: ctx.query.userId },
        });
      data.favorite = find ? true : false;
    }

    return ctx.send({ data });
  },
  async createFavorite(ctx) {
    const tome = await strapi.db
      .query("api::tome.tome")
      .findOne({ where: { id: ctx.request.body.data.tomeId } });
    const user = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: ctx.request.body.data.userId } });

    if (!tome) {
      return ctx.send({ message: "Tome inexistant sur la plateforme !" }, 404);
    }
    if (!user) {
      return ctx.send(
        { message: "Utilisateur inexistant sur la plateforme !" },
        404
      );
    }
    const exist = await strapi.db
      .query("api::user-tome-favorite.user-tome-favorite")
      .findOne({
        where: {
          tome: ctx.request.body.data.tomeId,
          user: ctx.request.body.data.userId,
        },
      });

    if (exist) {
      strapi.db
        .query("api::user-tome-favorite.user-tome-favorite")
        .delete({
          where: {
            tome: ctx.request.body.data.tomeId,
            user: ctx.request.body.data.userId,
          },
        })
        .then((data) => {
          strapi.db.query("api::tome.tome").update({
            data: {
              likesNumber:
                +tome.likesNumber != 0
                  ? +tome.likesNumber - 1
                  : tome.likesNumber,
            },
            where: { id: ctx.request.body.data.tomeId },
          });
          return data;
        });
      return ctx.send(
        {
          data: exist,
          message: "Deja enregistrer dans vos favoris",
          status: 400,
        },
        400
      );
    } else {
      const data = await strapi.db
        .query("api::user-tome-favorite.user-tome-favorite")
        .create({
          data: {
            tome: ctx.request.body.data.tomeId,
            user: ctx.request.body.data.userId,
            active: true,
          },
        })
        .then((data) => {
          strapi.db.query("api::tome.tome").update({
            data: { likesNumber: +tome.likesNumber + 1 },
            where: { id: ctx.request.body.data.tomeId },
          });

          return data;
        });

      return ctx.send({ data, status: 200 }, 200);
    }
  },
  async createTomeWithHisCategories(ctx) {
    try {
      const { categories, ...data } = ctx.request.body.data || { categories: [] }
      const tomeCreated = await strapi.db
        .query("api::tome.tome")
        .create({ data });

      const categoriesToPush = [];
      if (categories.length > 0) {
        for (let i = 0; i < categories.length; i++) {
          const category = await strapi.db
            .query("api::tome-category.tome-category")
            .create({
              data: {
                tome: tomeCreated?.id,
                category: categories[i],
              },
              populate: true
            });
          categoriesToPush.push(category)
        }
      }
      return ctx.send({ data: { ...tomeCreated, categories: categoriesToPush }, status: 200 }, 200);

    } catch (error) {
      console.log(error);
      return ctx.send({ data: "Une Erreur a survenue du coté serveur !", status: 500 }, 500);
    }
  },
  async getTomeWithHisCategories(ctx) {
    try {
      const tomeFound = await strapi.db
        .query("api::tome.tome")
        .findOne({ where: { id: ctx.params.tomeId } });

      const tomeCategories = await strapi.db
        .query("api::tome-category.tome-category")
        .findMany({
          where: { tome: { id: ctx.params.tomeId } },
          populate: true,
        });

      const userChapterBuy = await strapi.db
        .query("api::user-chapter-buy.user-chapter-buy")
        .findMany({
          where: {
            chapter: {
              tome: { id: ctx.params.tomeId },
            },
            active: true,
          },
          populate: true,
          orderBy: { chapter: { name: "asc" } }
        });

      const initialValue = 0;
      const coinsToRetrieve = userChapterBuy.reduce(
        (accumulator, currentValue) => {
          return accumulator + currentValue.chapter.coinsPrice;
        },
        initialValue
      );

      const categoriesOfThisTome = tomeCategories.map((item) => item.category);

      // Link categories to this tome

      return ctx.send(
        {
          data: {
            ...tomeFound,
            categories: categoriesOfThisTome,
            coinsToRetrieve,
          },
        },
        200
      );
    } catch (error) {
      console.log(error);
    }
  },
  async updateTomeWithHisCategories(ctx) {
    try {
      const tomeFound = await strapi.db
        .query("api::tome.tome")
        .findOne({ where: { id: ctx.params.tomeId } });

      const tomeUpdated = await strapi.db.query("api::tome.tome").update({
        data: ctx.request.body.data,
        where: { id: ctx.params.tomeId },
      });

      const { categories } = ctx.request.body.data;
      let categoriesToReturn = [];

      if (categories) {
        const tomeToDelete = await strapi.db
          .query("api::tome-category.tome-category")
          .findMany({
            where: { tome: { id: ctx.params.tomeId } },
            populate: true,
          });

        for (let i = 0; i < tomeToDelete.length; i++) {
          // @ts-ignore
          const tomeDeleted = await strapi.db
            .query("api::tome-category.tome-category")
            .delete({
              where: { id: tomeToDelete[i].id },
              populate: true,
            });
        }

        for (let i = 0; i < categories.length; i++) {
          const tomeCategoryCreated = await strapi.db
            .query("api::tome-category.tome-category")
            .create({
              data: {
                tome: tomeFound,
                category: categories[i],
              },
              populate: { category: true },
            });

          categoriesToReturn.push(tomeCategoryCreated?.category);
        }
      }

      return ctx.send(
        { data: { ...tomeUpdated, categories: categoriesToReturn } },
        200
      );
    } catch (error) {
      console.log(error);
    }
  },
  async getNote(ctx) {
    return await strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
  },
  async tomesPreferences(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    const userTomesList = await strapi
      .query("api::user-tome-favorite.user-tome-favorite")
      .findMany({ where: { user: { id: ctx.params.userId } }, populate: true });
    const tomesList = userTomesList.filter(function ({ tome }) {
      return tome
    }).map(({ tome: { id } }) => {
      return { tome: { id } };
    });
    const tomes = await strapi
      .query("api::tome-category.tome-category")
      .findMany({
        where: { $or: tomesList },
        populate: true,
        orderBy: [{ tome: { name: "asc" } }],
      });

    // @ts-ignore
    const data = supprimerDoublonsParPropriete(tomes.map(({ tome }) => tome), "id")
    const count = data.length
    const { offset, limit } = args;
    return ctx.send(
      {
        // @ts-ignore
        data: data.filter(function (item, index) {
          return (index >= (offset - 1)) && (index < ((offset - 1) + limit))
        }),
        meta: {
          offset,
          limit,
          number: count,
          countPage: Math.ceil(count / limit)
        },
        status: 200,
      },
      200
    );
  },
  async tomesCreated(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    let tomes = await strapi.query("api::tome.tome").findMany({
      where: { creator: { id: ctx.params.userId } },
      ...args,
      orderBy: [{ name: "asc" }],
    });

    // @ts-ignore
    tomes = supprimerDoublonsParPropriete(tomes, "id")
    const count = tomes.length

    const { offset, limit } = args;
    return ctx.send(
      {
        data: tomes,
        meta: {
          offset,
          limit,
          number: count,
          countPage: Math.ceil(count / limit)
        }, status: 200
      },
      200
    );
  },
  async tomesMostPopulars(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    let tomes = await strapi.query("api::tome.tome").findMany({
      ...args,
      orderBy: [{ userViews: "desc" }],
    });

    // @ts-ignore
    tomes = supprimerDoublonsParPropriete(tomes, "id")
    const count = tomes.length
    const { offset, limit } = args;
    return ctx.send(
      {
        data: tomes,
        meta: {
          offset, limit, number: count,
          countPage: Math.ceil(count / limit)
        }, status: 200
      },
      200
    );
  },
  async tomesMostBuyed(ctx) {
    const args = strapi.service("api::tome-infos.tome-infos").getArgs(ctx);
    let tomes = await strapi.query("api::tome.tome").findMany({
      ...args,
      orderBy: [{ userPurchase: "desc" }],
    });

    // @ts-ignore
    tomes = supprimerDoublonsParPropriete(tomes, "id")
    const count = tomes.length
    const { offset, limit } = args;
    return ctx.send(
      {
        data: tomes,
        meta: {
          offset, limit,
          number: count,
          countPage: Math.ceil(count / limit)
        }, status: 200
      },
      200
    );
  },
};
