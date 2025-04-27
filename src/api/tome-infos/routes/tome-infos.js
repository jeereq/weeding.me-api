module.exports = {
  routes: [
    {
      method: "GET",
      path: "/tome-infos/chapters-of-tome/:tomeId/:userId",
      handler: "tome-infos.chaptersOfTome",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/tome-infos/search",
      handler: "tome-infos.tomesSearch",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/tome-infos/tome/update",
      handler: "tome-infos.updateTome",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/tome-infos/search/category",
      handler: "tome-infos.tomesSearchCategory",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/read-chapter/:chapterId/:userId",
      handler: "tome-infos.updateReadChapter",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/categories-of-tome/:tomeId",
      handler: "tome-infos.categoriesOfTome",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/favorites-tome/:userId",
      handler: "tome-infos.tomesFavorites",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tomes-buyed/:userId",
      handler: "tome-infos.tomesBuyed",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tomes-created/:userId",
      handler: "tome-infos.tomesCreated",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/tome-infos/create-favorite",
      handler: "tome-infos.createFavorite",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tomes-of-category/:categoryId",
      handler: "tome-infos.tomesOfCategory",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tomes-preferences/:userId",
      handler: "tome-infos.tomesPreferences",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tomes-most-populars",
      handler: "tome-infos.tomesMostPopulars",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tomes-most-buyed",
      handler: "tome-infos.tomesMostBuyed",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tome-increment/:tomeId",
      handler: "tome-infos.increment",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/tome-infos/create-tome-with-his-categories",
      handler: "tome-infos.createTomeWithHisCategories",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/tome-infos/tome-with-his-categories/:tomeId",
      handler: "tome-infos.getTomeWithHisCategories",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/tome-infos/tome-with-his-categories/:tomeId",
      handler: "tome-infos.updateTomeWithHisCategories",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
