module.exports = {
  routes: [
    {
      method: "POST",
      path: "/chapter-infos/buy",
      handler: "chapter-infos.BuyChapter",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/chapter-infos/createChapter",
      handler: "chapter-infos.createChapter",
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/chapter-infos/updateChapter/:chapterId",
      handler: "chapter-infos.updateChapter",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
