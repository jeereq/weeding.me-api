module.exports = {
  routes: [
    {
      method: "POST",
      path: "/authentification/register",
      handler: "authentification.createUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/authentification/update",
      handler: "authentification.updateUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/authentification/confirm",
      handler: "authentification.confirmedAccount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/authentification/requestChange",
      handler: "authentification.RequestChangePasswordAccount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/authentification/RequestChangePasswordAccount',
      handler: 'authentification.RequestChangePasswordAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/authentification/change",
      handler: "authentification.changePasswordAccount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/authentification/login",
      handler: "authentification.login",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
