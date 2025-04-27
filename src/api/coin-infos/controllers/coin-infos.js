"use strict";

const MerchantID = "ff450180dd4d4e7baa0ac76f1af67f9a"
const MerchantPassword = "48db430ae36c4788bd6eacb614a503fe"
const URL = "https://webapi-test.maxicashapp.com/Integration/PayNowSync"

module.exports = {
  async activeCoins(ctx) {
    const args = strapi.service("api::coin-infos.coin-infos").getArgs(ctx);
    const data = await strapi.db
      .query("api::coin.coin")
      .findMany({ where: { active: true }, ...args });
    return ctx.send({ data }, 200);
  },
  async buyCoin(ctx) {
    const { userId, coinId } = ctx.params;
    const { phoneNumber, successURL, failureURL, cancelURL, notifyURL } =
      ctx.request.body.data;

    console.log("ICI", ctx.request.body.data);

    const { coinsNumber, price } = await strapi.db
      .query("api::coin.coin")
      .findOne({ where: { id: coinId } });
    const { userCoins } = await strapi.db
      .query("plugin::users-permissions.user")
      .findOne({ where: { id: userId } });

    await fetch(process.env.URL_MAXICASH, {
      method: "POST",
      body: JSON.stringify({
        PayType: "MaxiCash",
        MerchantID: process.env.MERCHANT_ID,
        MerchantPassword: process.env.MERCHANT_PASSWORD,
        Amount: price,
        "Devise ": "maxiDollar",
        Telephone: phoneNumber,
        "Expiry Date": "12/2021",
        Langue: "en",
        Reference: "{REFERENCE_OF_TRANSACTION}",
        SuccessURL: successURL,
        FailureURL: failureURL,
        CancelURL: cancelURL,
        NotifyURL: notifyURL,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        console.log("SUCCESS", response);
        return strapi.db
          .query("api::user-coin.user-coin")
          .create({ data: { user: userId, coin: coinId } })
          .then(async (res) => {
            const user = await strapi.db
              .query("plugin::users-permissions.user")
              .update({
                where: { id: userId },
                data: { userCoins: +userCoins + +coinsNumber },
              });
            const data = { ...res, user };
            return ctx.send({ data }, 200);
          });
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  },
  async buy(ctx) {
    const { phoneNumber, Amount, successURL, failureURL, cancelURL, notifyURL } =
      ctx.request.body.data;

    console.log({
      PayType: 2,
      MerchantID,
      MerchantPassword,
      CurrencyCode: "USD",
      RequestData: {
        Amount,
        Reference: "0123456789",
        Telephone: phoneNumber,
      },
      SuccessURL: successURL,
      FailureURL: failureURL,
      CancelURL: cancelURL,
      NotifyURL: notifyURL,
    })
    await fetch(URL, {
      method: "POST",
      body: JSON.stringify({
        PayType: 2,
        MerchantID,
        MerchantPassword,
        CurrencyCode: "USD",
        RequestData: {
          Amount,
          Reference: "jeereq",
          Telephone: phoneNumber,
        }
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        return response.json()
      }).then(function (res) {
        console.log(res)
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  },
  async getMoney(ctx) {
    const { tomeId, userId } = ctx.params;
    const { phoneNumber, successURL, failureURL, cancelURL, notifyURL } =
      ctx.request.body.data;

    const userChapterBuy = await strapi.db
      .query("api::user-chapter-buy.user-chapter-buy")
      .findMany({
        where: {
          chapter: {
            tome: { id: tomeId },
          },
          active: true,
        },
        populate: true,
      });

    const initialValue = 0;
    const coinsToRetrieve = userChapterBuy.reduce(
      (accumulator, currentValue) => {
        return accumulator + currentValue.chapter.coinsPrice;
      },
      initialValue
    );

    const coinsToRetrieveInFrancCongolais = coinsToRetrieve * 100;
    const coinsToRetrieveInRand = 1 / 149.2537;
    const moneyToSendTheUser = Math.floor(coinsToRetrieveInRand * 65) / 100;
    const ourMoney = Math.ceil(coinsToRetrieveInRand * 35) / 100;
    const coinValueActive = await strapi.db.query("api::coin.coin").findOne({
      where: {
        active: true,
      },
      populate: true,
    });

    await fetch(process.env.URL_MAXICASH, {
      method: "POST",
      body: JSON.stringify({
        PayType: "MaxiCash",
        MerchantID: process.env.MERCHANT_ID,
        MerchantPassword: process.env.MERCHANT_PASSWORD,
        // Amount: price,
        Amount: moneyToSendTheUser,
        "Devise ": "maxiRand",
        Telephone: phoneNumber,
        "Expiry Date": "12/2021",
        Langue: "en",
        Reference: "{REFERENCE_OF_TRANSACTION}",
        SuccessURL: successURL,
        FailureURL: failureURL,
        CancelURL: cancelURL,
        NotifyURL: notifyURL,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => {
        for (const item of userChapterBuy) {
          strapi.db.query("api::user-chapter-buy.user-chapter-buy").update({
            where: { id: item?.id },
            data: { active: false },
          });
        }

        return ctx.send(
          {
            data: {
              message: "Argent transféré avec succès",
            },
          },
          200
        );
      })
      .catch((error) => {
        console.log(error);
        return error;
      });
  },
};
