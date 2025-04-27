"use strict";
/**
 * authentification service
 */

const crypto = require("crypto");

module.exports = ({ strapi }) => ({
  createUser: async (params) => {

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

  generateCode: () => {
    const resetPasswordToken = crypto.randomInt(1000, 9999).toString();
    return resetPasswordToken;
  },

  userWithTheSamePhoneNumber: (phoneNumber) => {
    return strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { phoneNumber } });
  },
});
