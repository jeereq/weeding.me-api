module.exports = {
  routes: [
    {
      method: "GET",
      path: "/book-infos/tomes/:bookId",
      handler: "book-infos.tomesBook",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/book-infos/user/:userId",
      handler: "book-infos.getUserBooks",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
