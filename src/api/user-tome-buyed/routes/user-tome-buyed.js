module.exports = {
  routes: [
    {
     method: 'GET',
     path: '/user-tome-buyed/:userId',
     handler: 'user-tome-buyed.userTomeBuyed',
     config: {
       policies: [],
       middlewares: [],
     },
    },
  ],
};
