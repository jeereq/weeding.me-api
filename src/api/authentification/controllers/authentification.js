"use strict";
const utils = require("@strapi/utils");
const { getService } = require("../utils");
const bcrypt = require("bcryptjs");

const { sanitize } = utils;

const generatePasswordHashed = async (password) => {
  return await bcrypt.genSalt(10).then(async function (salt) {
    return await bcrypt.hash(password, salt)
  })
}
const validatePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
}

const ENTITY = "BUKU PRO";

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");

  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = {
  createUser: async (ctx) => {
    try {
      const { confirmPassword, password, phoneNumber, categories } =
        ctx.request.body.data;

      const isPasswordExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(password);
      const isPhoneNumberExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(phoneNumber);
      const isCategoryExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(categories);

      const passwordCorrespond = await strapi
        .service("api::authentification.authentification")
        .confirmedPass(password, confirmPassword);


      if (!isPasswordExist || !isPhoneNumberExist)
        return ctx.send(
          { message: "Les champs obligatoires sont vides ." },
          400
        );

      if (!passwordCorrespond)
        return ctx.send(
          { message: "Les mots de passe ne correspondent pas." },
          400
        );

      const userWithThisPhoneNumberExists = await strapi
        .service("api::authentification.authentification")
        .userWithTheSamePhoneNumber(phoneNumber);

      if (userWithThisPhoneNumberExists)
        return ctx.send(
          { message: "Ce numéro de téléphone est déjà utilisé." },
          400
        );

      const user = await strapi
        .service("api::authentification.authentification")
        .createUser({ data: { ...ctx.request.body.data, password: await generatePasswordHashed(password) } });

      if (user.message) return ctx.send(user, 404);

      const generatedCode = strapi
        .service("api::authentification.authentification")
        .generateCode(2);

      if (user.phoneNumber) {
        user.resetPasswordToken = generatedCode;
        user.receiptedSMS = false;
        user.confirmed = true;
        const data = user;
        const { id } = user;
        await strapi
          .query("plugin::users-permissions.user")
          .update({ data, where: { id } });
        if (isCategoryExist) {
          categories.forEach((category) => {
            strapi.service("api::user-category.user-category").create({
              connect: { user: id, category },
              data: { user: id, category },
            });
          });
        }
      }

      return ctx.send(await sanitizeUser(user, ctx), 200);
    } catch (err) {
      console.log(err)
      return ctx.send({ message: "Quelque chose a mal tourné" }, 500);
    }
  },
  confirmedAccount: async (ctx) => {
    try {
      const { phoneNumber, code } = ctx.request.body.data;

      const isCodeExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(code);
      const isPhoneNumberExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(phoneNumber);

      if (!isCodeExist || !isPhoneNumberExist)
        return ctx.send(
          { message: "Les champs obligatoires sont vides." },
          400
        );

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phoneNumber, resetPasswordToken: code } });

      if (!user)
        return ctx.send(
          { message: "Utilisateur non présent sur la plateforme" },
          404
        );

      user.confirmed = true;
      user.resetPasswordToken = null;

      const data = user;
      const { id } = user;
      await strapi
        .query("plugin::users-permissions.user")
        .update({ data, where: { id } });

      return ctx.send(
        {
          message:
            "Nous vous confirmons la création et la confirmation de votre compte.",
        },
        200
      );
    } catch (error) {
      return ctx.send({ message: "Quelque chose a mal tourné." }, 500);
    }
  },
  RequestChangePasswordAccount: async (ctx) => {
    try {
      const { phoneNumber } = ctx.request.body.data;

      const isPhoneNumberExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(phoneNumber);

      if (!isPhoneNumberExist) {
        return ctx.send(
          { message: "Les champs obligatoires sont vides." },
          400
        );
      }

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phoneNumber } });

      if (!user) {
        return ctx.send(
          { message: "Utilisateur non présent sur la plateforme" },
          404
        );
      }

      const generatedCode = strapi
        .service("api::authentification.authentification")
        .generateCode(2);

      if (user.phoneNumber) {
        const paramsMessage = {};

        paramsMessage.message = `Bonjour ${user.username},
         Nous avons reçu une demande de modification de votre mot de passe pour votre compte BUKU.
         Pour confirmer que vous êtes bien à l'origine de cette demande, veuillez saisir le code suivant dans l'interface de modification du mot de passe : ${generatedCode}
         Si vous n'avez pas demandé cette modification, veuillez ignorer ce message.
         Si vous avez des questions, n'hésitez pas à nous contacter.`;

        paramsMessage.recipient = user.phoneNumber;

        const sendSMS = await strapi
          .service("api::sms.sms")
          .sendSms(paramsMessage);

        if (sendSMS) {
          user.resetPasswordToken = generatedCode;
          user.receiptedSMS = true;
        } else {
          user.receiptedSMS = false;
        }

        console.log("ICI", generatedCode);

        const data = user;
        const { id } = user;
        await strapi
          .query("plugin::users-permissions.user")
          .update({ data, where: { id } });
      }

      user.resetPasswordToken = generatedCode;

      const data = user;
      const { id } = user;
      await strapi
        .query("plugin::users-permissions.user")
        .update({ data, where: { id } });

      return ctx.send({ message: "Traitement de la demande en cours" }, 200);
    } catch (error) {
      return ctx.send({ message: "Quelque chose a mal tourné." }, 500);
    }
  },
  changePasswordAccount: async (ctx) => {
    try {
      const { phoneNumber, code, password, confirmPassword } =
        ctx.request.body.data;

      const isCodeExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(code);
      const isPasswordExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(password);
      const isPhoneNumberExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(phoneNumber);
      const passwordCorrespond = await strapi
        .service("api::authentification.authentification")
        .confirmedPass(password, confirmPassword);

      if (!isCodeExist || !isPhoneNumberExist || !isPasswordExist)
        return ctx.send(
          { message: "Les champs obligatoires sont vides." },
          400
        );

      if (!passwordCorrespond)
        return ctx.send(
          { message: "Les mots de passe ne sont pas identiques." },
          400
        );

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phoneNumber, resetPasswordToken: code } });

      if (!user)
        return ctx.send(
          { message: "Utilisateur non présent sur la plateforme" },
          404
        );

      user.password = await generatePasswordHashed(password);
      user.confirmed = true;
      user.confirmPassword = await generatePasswordHashed(password);;
      user.resetPasswordToken = null;

      const data = user;
      const { id } = user;
      await strapi
        .query("plugin::users-permissions.user")
        .update({ data, where: { id } });

      if (user.phoneNumber) {
        const paramsMessage = {};
        paramsMessage.message = `Bonjour ${user.username},
          Nous vous confirmons que votre mot de passe pour votre compte ${ENTITY} a été modifié avec succès.
          Votre nouveau mot de passe est : ${password}
          Veuillez noter que ce mot de passe est désormais votre mot de passe principal pour ce compte.
          Si vous avez des questions, n'hésitez pas à nous contacter.
          Cordialement,
          ${ENTITY}`;
        paramsMessage.recipient = user.phoneNumber;
        const sendSMS = await strapi
          .service("api::sms.sms")
          .sendSms(paramsMessage);

        if (sendSMS) {
          user.receiptedSMS = true;
        } else {
          user.receiptedSMS = false;
        }
        const data = user;
        const { id } = user;
        await strapi
          .query("plugin::users-permissions.user")
          .update({ data, where: { id } });
      }

      return ctx.send(
        {
          message:
            "Nous vous confirmons que votre mot de passe a été modifié avec succès.",
        },
        200
      );
    } catch (error) {
      return ctx.send({ message: "Quelque chose a mal tourné." }, 500);
    }
  },
  login: async (ctx) => {
    try {
      const { phoneNumber, password } = ctx.request.body.data;
      const isPasswordExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(password);
      const isPhoneNumberExist = await strapi
        .service("api::authentification.authentification")
        .paramsExist(phoneNumber);

      if (!isPasswordExist || !isPhoneNumberExist) {
        return ctx.send(
          { message: "Les champs obligatoires sont vides" },
          400
        );
      }

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phoneNumber } });

      if (!user) {
        return ctx.send(
          { message: "Utilisateur non présent sur la plateforme" },
          404
        );
      }

      if (!await validatePassword(password, user.password)) {
        return ctx.send(
          { message: "Mot de passe incorrecte" },
          400
        );
      }

      if (!user.confirmed) {
        return ctx.send({ message: "Compte non confirmé" }, 400);
      }

      if (user.blocked) {
        return ctx.send({ message: "Compte bloqué" }, 400);
      }
      const userCategories = await strapi.query('api::user-category.user-category').findMany({ where: { user: { id: user.id } }, populate: true })
      return ctx.send(
        {
          jwt: getService("jwt").issue({ id: user.id }),
          user: { ...await sanitizeUser(user, ctx), userCategories },
        },
        200
      );
    } catch (error) {
      return ctx.send({ message: "Quelque chose a mal tourné." }, 500);
    }
  },
  async updateUser(ctx) {
    const { id, ...data } = ctx.request.body.data;
    const user = await strapi
      .query("plugin::users-permissions.user")
      .update({ data, where: { id } });
    return ctx.send({ data: user, status: 200 }, 200)
  }
};
