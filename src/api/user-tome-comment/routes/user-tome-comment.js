module.exports = {
  routes: [
    {
      method: "GET",
      path: "/user-tome-comment/:tomeId",
      handler: "user-tome-comment.getCommentsOfATome",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/user-tome-comment/stat/:tomeId",
      handler: "user-tome-comment.getCommentsOfATomeStat",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/user-tome-comment/create",
      handler: "user-tome-comment.create",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
