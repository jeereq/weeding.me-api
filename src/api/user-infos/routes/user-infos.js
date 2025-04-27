module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user-infos-tome-categories/:user',
      handler: 'user-infos.tomesByCategory',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/user-infos-tome-favorites/:user',
      handler: 'user-infos.tomesByFavorite',
      config: {
        policies: [],
        middlewares: [],
      },
    }, {
      method: 'POST',
      path: '/user-infos-update/:userId',
      handler: 'user-infos.updateUser',
      config: {
        policies: [],
        middlewares: [],
      },
    }, {
      method: 'POST',
      path: '/user-infos-update-password/:userId',
      handler: 'user-infos.updateUserPassword',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/user-infos/categories/get',
      handler: 'user-infos.getUserCategories',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/user-infos/categories/create',
      handler: 'user-infos.createUserCategories',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
