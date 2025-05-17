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
      path: "/auth/loginByEmail",
      handler: "auth.loginByEmail",
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
      path: "/auth/users/templates",
      handler: "auth.templates",
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
      path: "/auth/users/invitationPublic",
      handler: "auth.invitationPublic",
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
    {
      method: "POST",
      path: "/auth/invitations/desctiveCommand",
      handler: "auth.desctiveCommand",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/activeCommand",
      handler: "auth.activeCommand",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",   
      path: "/auth/invitations/commandeUpdate",
      handler: "auth.commandeUpdate", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/statEditor",
      handler: "auth.statEditor", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/statAdmin",
      handler: "auth.statAdmin", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/create",
      handler: "auth.createInvitation", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/delete",
      handler: "auth.deleteInvitation", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invite/delete",
      handler: "auth.deleteInvite", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invite/active",
      handler: "auth.confirmPresence", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invite/desactive",
      handler: "auth.declinedPresence", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invite/createMessage",
      handler: "auth.createMessage", 
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/auth/invitations/commanderWithoutUser",
      handler: "auth.commanderWithoutUser",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
