module.exports = {
  routes: [
    {
      method: "POST",
      path: "/auth/register",
      handler: "auth.createUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/update",
      handler: "auth.updateUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/confirm",
      handler: "auth.confirmedAccount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/requestChange",
      handler: "auth.RequestChangePasswordAccount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/auth/RequestChangePasswordAccount',
      handler: 'auth.RequestChangePasswordAccount',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/change",
      handler: "auth.changePasswordAccount",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/login",
      handler: "auth.login",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/users",
      handler: "auth.users",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/users/invitations",
      handler: "auth.invitations",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/command",
      handler: "auth.commander",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
