"use strict";
/**
 * authentification service
 */

const crypto = require("crypto");

module.exports = ({ strapi }) => ({
  createUser: async (params) => {
    const { email, phoneNumber, username } = params;


    const messageExistUser = {
      message: "Number or Username are already taken",
    };
    if (email) {
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { email } });

      if (user) return messageExistUser;
    }

    if (phoneNumber) {
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phoneNumber } });

      if (user) return messageExistUser;
    }

    if (username) {
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { username } });
      if (user) return messageExistUser;
    }

    const user = await strapi
      .query("plugin::users-permissions.user")
      .create(params);
    return user;
  },

  paramsExist: (params) => {
    if (params) {
      return true;
    }
    return false;
  },

  confirmedPass: (passsword, confirmedPassword) => {
    if (passsword === confirmedPassword) return true;
    return false;
  },

  generateCode: (randomBytes) => {
    const resetPasswordToken = crypto.randomBytes(randomBytes).toString("hex");
    return resetPasswordToken;
  },
});
