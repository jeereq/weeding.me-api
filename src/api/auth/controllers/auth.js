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

const ENTITY = "wedding.me";

const sanitizeUser = (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel("plugin::users-permissions.user");
  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = {
  createUser: async (ctx) => {
    try {
      const { confirmPassword, password, phone } =
        ctx.request.body.data;

      const isPasswordExist = await strapi
        .service("api::auth.auth")
        .paramsExist(password);
      const isPhoneNumberExist = await strapi
        .service("api::auth.auth")
        .paramsExist(phone);

      const passwordCorrespond = await strapi
        .service("api::auth.auth")
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
        .service("api::auth.auth")
        .userWithTheSamePhoneNumber(phone);

      if (userWithThisPhoneNumberExists)
        return ctx.send(
          { message: "Ce numéro de téléphone est déjà utilisé." },
          400
        );

      const user = await strapi
        .service("api::auth.auth")
        .createUser({ data: { confirmPassword: await generatePasswordHashed(confirmPassword), phone, password: await generatePasswordHashed(password) } });

      if (user.message) return ctx.send(user, 404);

      const generatedCode = strapi
        .service("api::auth.auth")
        .generateCode(2);

      if (user.phone) {

        user.resetPasswordToken = generatedCode;
        user.confirmed = true;

        const data = user;
        const { id } = user;

        await strapi
          .query("plugin::users-permissions.user")
          .update({ data, where: { id } });
      }

      return ctx.send(await sanitizeUser(user, ctx), 200);
    } catch (err) {
      console.log(err)
      return ctx.send({ message: "Quelque chose a mal tourné" }, 500);
    }
  },
  confirmedAccount: async (ctx) => {
    try {
      const { phone, code } = ctx.request.body.data;

      const isCodeExist = await strapi
        .service("api::auth.auth")
        .paramsExist(code);
      const isPhoneNumberExist = await strapi
        .service("api::auth.auth")
        .paramsExist(phone);

      if (!isCodeExist || !isPhoneNumberExist)
        return ctx.send(
          { message: "Les champs obligatoires sont vides." },
          400
        );

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phone, resetPasswordToken: code } });

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
      const { phone } = ctx.request.body.data;

      const isPhoneNumberExist = await strapi
        .service("api::auth.auth")
        .paramsExist(phone);

      if (!isPhoneNumberExist) {
        return ctx.send(
          { message: "Les champs obligatoires sont vides." },
          400
        );
      }

      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { phone } });

      if (!user) {
        return ctx.send(
          { message: "Utilisateur non présent sur la plateforme" },
          404
        );
      }

      const generatedCode = strapi
        .service("api::auth.auth")
        .generateCode(2);

      if (user.phone) {
        const paramsMessage = {};

        paramsMessage.message = `Bonjour ${user.username},
         Nous avons reçu une demande de modification de votre mot de passe pour votre compte BUKU.
         Pour confirmer que vous êtes bien à l'origine de cette demande, veuillez saisir le code suivant dans l'interface de modification du mot de passe : ${generatedCode}
         Si vous n'avez pas demandé cette modification, veuillez ignorer ce message.
         Si vous avez des questions, n'hésitez pas à nous contacter.`;

        paramsMessage.recipient = user.phone;

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
      const { phone, code, password, confirmPassword } =
        ctx.request.body.data;

      const isCodeExist = await strapi
        .service("api::auth.auth")
        .paramsExist(code);
      const isPasswordExist = await strapi
        .service("api::auth.auth")
        .paramsExist(password);
      const isPhoneNumberExist = await strapi
        .service("api::auth.auth")
        .paramsExist(phone);
      const passwordCorrespond = await strapi
        .service("api::auth.auth")
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
        .findOne({ where: { phone, resetPasswordToken: code } });

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

      if (user.phone) {
        const paramsMessage = {};
        paramsMessage.message = `Bonjour ${user.username},
          Nous vous confirmons que votre mot de passe pour votre compte ${ENTITY} a été modifié avec succès.
          Votre nouveau mot de passe est : ${password}
          Veuillez noter que ce mot de passe est désormais votre mot de passe principal pour ce compte.
          Si vous avez des questions, n'hésitez pas à nous contacter.
          Cordialement,
          ${ENTITY}`;
        paramsMessage.recipient = user.phone;
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
  async login(ctx) {
    try {
      const { email, password } = ctx.request.body.data;
      const isPasswordExist = await strapi
        .service("api::auth.auth")
        .paramsExist(password);
      const isEmail = await strapi
        .service("api::auth.auth")
        .paramsExist(email);

      if (!isPasswordExist || !isEmail) {
        return ctx.send(
          { message: "Les champs obligatoires sont vides" },
          400
        );
      }

      const user = await strapi
        .query("plugin::users-permissions.user")
        .update({ where: { email }, data: { lastLogin: new Date() }, populate: true });

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

      const templates = await strapi
        .query("api::user-template.user-template").findMany({
          where: { user: { email } }
        })
      return ctx.send(
        {
          jwt: getService("jwt").issue({ id: user.id }),
          data: {
            ...await sanitizeUser(user, ctx),
            templates,
            guests: []
          }
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
      .update({ data, where: { id }, populate: true });
    return ctx.send({ data: user, status: 200 }, 200)
  },
  async users(ctx) {
    const { } = ctx.request.body.data || {}
    const users = await strapi
      .query("plugin::users-permissions.user")
      .findMany({ populate: true });

    ctx.send({ data: users })
  },
  async invitations(ctx) {
    const { id } = ctx.request.body.data || {}
    const users = await strapi
      .query("api::invitation.invitation")
      .findMany({
        where: {
          userTemplate: {
            user: { id }
          }
        },
        populate: true
      });

    ctx.send({ data: users })
  },
  async templates(ctx) {
    const { id } = ctx.request.body.data
    console.log(id)
    const templates = await strapi
      .query("api::user-template.user-template")
      .findMany({
        where: {
          user: { id }
        },
        populate: true
      });

    ctx.send({ data: templates })
  },
  async commander(ctx) {
    const { address, nameInvitation, time, color, date, men, image, typeInvitation, women, initiateurDeLaDemande, phone, password = "123456", email = "mingandajeereq@gmail.com", template, day, month, year, lat, lng, title, invitations, city, country } = ctx.request.body.data || {}

    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { phone }, populate: true });

    if (user) {
      ctx.send({
        data: null,
        message: "Utulisateur présent dans notre bd, connectez vous dans votre compte et ajouter d'autre model d'invitation  !"
      }, 200)
    } else {
      const { id } = await strapi
        .query("plugin::users-permissions.user")
        .create({
          data: {
            email,
            username: initiateurDeLaDemande,
            phone,
            password,
            confirmed: false,
            role: 4
          }
        });
      const invitation = await strapi
        .query("api::user-template.user-template")
        .create({
          data: {
            user: id,
            template,
            day,
            month,
            year,
            lat,
            lng,
            men,
            women,
            image,
            title,
            invitations,
            initiateurDeLaDemande,
            city,
            country,
            typeInvitation,
            address,
            color,
            nameInvitation,
            date,
            phone,
            time
          }
        })

      ctx.send({
        data: invitation,
        message: "Votre commande a été envoyé !"
      })

    }
  },
  async commandeUpdate(ctx) {
    const { id, ...data } = ctx.request.body.data || {}

    const invitation = await strapi
      .query("api::user-template.user-template")
      .update({
        where: { id },
        data
      })

    ctx.send({
      data: invitation,
      message: "Votre commande a été modifié !"
    })
  },
  async activeCommand(ctx) {
    const { id } = ctx.request.body.data || {}

    const invitation = await strapi
      .query("api::user-template.user-template")
      .update({
        where: { id },
        data: { active: true }
      })
    console.log(invitation)

    ctx.send({
      data: invitation,
      message: "Votre commande a été activé !"
    })
  },
  async commanderWithoutUser(ctx) {
    const { user, address, nameInvitation, time, date, men, image, typeInvitation, women, initiateurDeLaDemande, phone, template, day, month, year, lat, lng, title, invitations, city, country } = ctx.request.body.data || {}

    const invitation = await strapi
      .query("api::user-template.user-template")
      .create({
        data: {
          user,
          template,
          day,
          month,
          year,
          lat,
          lng,
          men,
          women,
          image,
          title,
          invitations,
          initiateurDeLaDemande,
          city,
          country,
          typeInvitation,
          address,
          nameInvitation,
          date,
          phone,
          time
        }
      })

    ctx.send({
      data: invitation,
      message: "Votre commande a été envoyé !"
    })
  }
};
