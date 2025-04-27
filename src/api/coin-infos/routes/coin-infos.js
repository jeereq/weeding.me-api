module.exports = {
  routes: [
    {
      method: "GET",
      path: "/coin-infos/actives-coin",
      handler: "coin-infos.activeCoins",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/coin-infos/buy-coin/:coinId/:userId",
      handler: "coin-infos.buyCoin",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/coin-infos/buy",
      handler: "coin-infos.buy",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/coin-infos/get-money/:tomeId/:userId",
      handler: "coin-infos.getMoney",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
