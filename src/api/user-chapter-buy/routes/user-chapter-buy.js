module.exports = {
  routes: [
    {
      method: "GET",
      path: "/user-chapter-buy/:chapterId",
      handler: "user-chapter-buy.getChapterBuy",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/user-chapter-buy/:chapterId/:userId",
      handler: "user-chapter-buy.getUserChapterBuy",
      config: {
        policies: [],
        middlewares: [],
      },
    }, {
      method: "POST",
      path: "/user-chapter-buy/create",
      handler: "user-chapter-buy.buyChapter",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
