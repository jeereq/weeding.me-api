"use strict";

const utils = require("@strapi/utils");
const { getService } = require("../utils");
const bcrypt = require("bcryptjs");

var axios = require('axios');
const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilioPhoneNumber = process.env.TWILIONUM

const client = require('twilio')(accountSid, authToken);

const { sanitize } = utils;

const getCivility = (type) => {
  switch (type) {
    case "family":
      return "Famille"
    case "company":
      return "Compagnie"
    case "couple":
      return "Couple"
    case "group":
      return "Monsieur(Madame)"
    case "singel":
      return "Monsieur(Madame)"
    default:
      break;
  }
}

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

      if (user?.message) return ctx.send(user, 404);

      const generatedCode = strapi
        .service("api::auth.auth")
        .generateCode(2);

      if (user?.phone) {

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

      if (user?.phone) {
        const paramsMessage = {};

        paramsMessage.message = `Bonjour ${user?.username},
         Nous avons reçu une demande de modification de votre mot de passe pour votre compte BUKU.
         Pour confirmer que vous êtes bien à l'origine de cette demande, veuillez saisir le code suivant dans l'interface de modification du mot de passe : ${generatedCode}
         Si vous n'avez pas demandé cette modification, veuillez ignorer ce message.
         Si vous avez des questions, n'hésitez pas à nous contacter.`;

        paramsMessage.recipient = user?.phone;

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

      if (user?.phone) {
        const paramsMessage = {};
        paramsMessage.message = `Bonjour ${user?.username},
          Nous vous confirmons que votre mot de passe pour votre compte ${ENTITY} a été modifié avec succès.
          Votre nouveau mot de passe est : ${password}
          Veuillez noter que ce mot de passe est désormais votre mot de passe principal pour ce compte.
          Si vous avez des questions, n'hésitez pas à nous contacter.
          Cordialement,
          ${ENTITY}`;
        paramsMessage.recipient = user?.phone;
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

      if (!await validatePassword(password, user?.password)) {
        return ctx.send(
          { message: "Mot de passe incorrecte" },
          400
        );
      }

      if (!user?.confirmed) {
        return ctx.send({ message: "Compte non confirmé" }, 400);
      }

      if (user?.blocked) {
        return ctx.send({ message: "Compte bloqué" }, 400);
      }

      let templates = user?.role.id == 3 ? await strapi
        .query("api::user-template.user-template").findMany({}) : await strapi
          .query("api::user-template.user-template").findMany({
            where: { user: { email } }
          })
      for (let index = 0; index < templates.length; index++) {
        const { id } = templates[index];
        const guests = await strapi
          .query("api::invitation.invitation").findMany({
            where: { userTemplate: { id } },
            populate: true
          })
        templates[index]["guests"] = guests
      }
      return ctx.send(
        {
          jwt: getService("jwt").issue({ id: user?.id, role: user.role }),
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
  async loginByEmail(ctx) {
    try {
      const { email } = ctx.request.body.data;

      const isEmail = await strapi
        .service("api::auth.auth")
        .paramsExist(email);

      if (!isEmail) {
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

      if (!user?.confirmed) {
        return ctx.send({ message: "Compte non confirmé" }, 400);
      }

      if (user?.blocked) {
        return ctx.send({ message: "Compte bloqué" }, 400);
      }

      let templates = (user?.role?.id == 3) ? await strapi
        .query("api::user-template.user-template").findMany({}) :
        await strapi
          .query("api::user-template.user-template").findMany({
            where: { user: { email } }
          });
      for (let index = 0; index < templates.length; index++) {
        const { id } = templates[index];
        const guests = await strapi
          .query("api::invitation.invitation").findMany({
            where: { userTemplate: { id } },
            populate: true
          })
        templates[index]["guests"] = guests
      }
      return ctx.send(
        {
          jwt: getService("jwt").issue({ id: user?.id, role: user.role }),
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
    const invitations = await strapi
      .query("api::invitation.invitation")
      .findMany({
        where: {
          userTemplate: {
            user: { id },
            active: true
          }
        },
        populate: true
      });

    ctx.send({ data: invitations })
  },
  async invitationPublic(ctx) {
    const { id } = ctx.request.body.data || {}
    const invitation = await strapi
      .query("api::invitation.invitation")
      .findOne({
        where: {
          id
        },
        populate: true
      });

    ctx.send({ data: invitation })
  },
  async createMessage(ctx) {
    const { userTemplate } = ctx.request.body.data || {}
    const invitations = await strapi
      .query("api::invitation.invitation")
      .findMany({
        where: {
          userTemplate: { id: userTemplate },
          status: {
            $eq: "noStarted"
          }
        },
        populate: true
      });

    for (let index = 0; index < invitations.length; index++) {
      const guest = invitations[index];

      const name = guest.type != "singel" ? guest?.members?.map(function ({ name }) {
        return name
      }).join(" & ") : guest.name

      const civility = getCivility(guest?.type)

      var data = JSON.stringify({
        "token": "jo7b35pjjdu2s80w",
        "to": guest.phone,
        "image": guest.userTemplate.image,
        "caption": `Bonjour ${civility} ${name}. C'est avec une immense joie que nous vous invitons à célébrer notre mariage ! ${guest.userTemplate.title} s'unissent pour la vie le ${new Date(guest.userTemplate.date).toDateString()} à ${guest.userTemplate.time}. Nous serions honorés de vous compter parmi nous pour partager ce moment si spécial. Merci de nous confirmer votre présence avant le ${new Date(guest.userTemplate.date).toDateString()}. Voici le lien de votre invitation : https://www.weeding.me/invite/${guest.id}.`
      });

      var config = {
        method: 'post',
        url: 'https://api.ultramsg.com/instance120422/messages/image?token=jo7b35pjjdu2s80w',
        headers: {
          'Content-Type': 'application/json'
        },
        data: data
      };

      axios(config)
        .then(function (response) {
          strapi
            .query("api::invitation.invitation")
            .update({
              where: {
                id: guest.id,
              },
              data: {
                status: "pending"
              }
            });
          console.log(response.data)
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    ctx.send({ data: invitations })
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

    const userTemplate = await strapi
      .query("api::user-template.user-template")
      .update({
        where: { id },
        data: { active: true }
      })

    ctx.send({
      data: userTemplate,
      message: "Votre commande a été activé !"
    })
  },
  async statEditor(ctx) {
    const { id } = ctx.request.body.data || {}

    const invitations = await strapi
      .query("api::user-template.user-template")
      .findMany({
        where: { user: id },
      })

    ctx.send({
      data: {
        totalInvitations: invitations.length,
        invitationsPayed: invitations.filter(function ({ active }) {
          return active
        }).length,
        invitationsUnPayed: invitations.filter(function ({ active }) {
          return !active
        }).length
      },
      message: "vos données !"
    })
  },
  async statAdmin(ctx) {
    const { } = ctx.request.body.data || {}

    const invitations = await strapi
      .query("api::user-template.user-template")
      .findMany({})

    ctx.send({
      data: {
        totalInvitations: invitations.length,
        invitationsPayed: invitations.filter(function ({ active }) {
          return active
        }).length,
        invitationsUnPayed: invitations.filter(function ({ active }) {
          return !active
        }).length
      },
      message: "vos données !"
    })
  },
  async createInvitation(ctx) {
    const { userTemplate, ...rest } = ctx.request.body.data || {}

    try {
      const invitation = await strapi
        .query("api::user-template.user-template")
        .findOne({ where: { id: userTemplate, active: true } })
      if (invitation) {
        if (parseFloat(`${invitation.invitations}`) > parseFloat(`${invitation.invitationsUser}`)) {
          const data = await strapi
            .query("api::invitation.invitation")
            .create({ data: { userTemplate, ...rest }, populate: true })
            .then(function (response) {
              strapi
                .query("api::user-template.user-template")
                .update({
                  where: { id: userTemplate },
                  data: {
                    invitationsUser: parseFloat(`${parseFloat(invitation.invitationsUser) + 1}`)
                  }
                })
              return response
            })

          ctx.send({
            data,
            message: "Vous avez créé un invité !"
          })
        } else {

          ctx.send({
            data: null,
            message: "Vous avez Dépassé le quota d'invitation acheter !"
          })
        }
      } else {
        ctx.send({
          data: null,
          message: "Invitations pas encore activé ou non présente sur la plateforme !"
        })
      }
    } catch (error) {
      console.log(error)
      ctx.send({
        data: null,
        message: "Quelque chose s'est mal passé !"
      })
    }
  },
  async deleteInvitation(ctx) {
    const { id } = ctx.request.body.data || {}

    await strapi
      .query("api::user-template.user-template")
      .delete({ where: { id } })
    ctx.send({
      data: {},
      message: "Invitation supprimer !"
    })
  },
  async deleteInvite(ctx) {
    const { id } = ctx.request.body.data || {}

    await strapi
      .query("api::invitation.invitation")
      .delete({ where: { id } })
    ctx.send({
      data: {},
      message: "Invité supprimer !"
    })
  },
  async confirmPresence(ctx) {
    const { id } = ctx.request.body.data || {}

    const guest = await strapi
      .query("api::invitation.invitation")
      .update({
        where: { id },
        data: {
          status: "attending",
          approvedAt: new Date()
        },
        populate: true
      })
    const name = guest.type != "singel" ? guest?.members?.map(function ({ name }) {
      return name
    }).join(" & ") : guest.name

    const civility = getCivility(guest?.type)

    var data = JSON.stringify({
      "token": "jo7b35pjjdu2s80w",
      "to": guest.phone,
      "image": guest.userTemplate.image,
      "caption": `Merci d'avoir validé votre présence ${civility} ${name} ! Vous allez recevoir un message avec la localisation du lieu.`
    });

    var config = {
      method: 'post',
      url: 'https://api.ultramsg.com/instance120422/messages/image?token=jo7b35pjjdu2s80w',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    };

    const dataLoc = JSON.stringify({
      "token": "jo7b35pjjdu2s80w",
      "to": guest.phone,
      "address": guest.userTemplate.address,
      "lat": guest.userTemplate.lat,
      "lng": guest.userTemplate.lng,
    });

    const configLoc = {
      method: 'post',
      url: 'https://api.ultramsg.com/instance120422/messages/location?token=jo7b35pjjdu2s80w',
      headers: {
        'Content-Type': 'application/json'
      },
      data: dataLoc
    };
    axios(config)
      .then(function () {
        axios(configLoc)
          .catch(function (error) {
            console.log(error);
          });
      })
      .catch(function (error) {
        console.log(error);
      });

    ctx.send({
      data: guest,
      message: "Merci d'avoir validé votre présence !"
    })
  },
  async declinedPresence(ctx) {
    const { id } = ctx.request.body.data || {}

    const guest = await strapi
      .query("api::invitation.invitation")
      .update({
        where: { id },
        data: {
          status: "declined",
          approvedAt: new Date()
        },
        populate: true
      })

    ctx.send({
      data: guest,
      message: "Vous avez décliné votre présence !"
    })
  },
  async desctiveCommand(ctx) {
    const { id } = ctx.request.body.data || {}

    const userTemplate = await strapi
      .query("api::user-template.user-template")
      .update({
        where: { id },
        data: { active: false }
      })

    ctx.send({
      data: userTemplate,
      message: "Votre commande a été activé !"
    })
  },
  async commanderWithoutUser(ctx) {
    const { user, address, nameInvitation, time, date, men, image, typeInvitation, women, initiateurDeLaDemande, price, phone, template, day, month, year, lat, lng, title, invitations, city, country } = ctx.request.body.data || {}

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
          time,
          price
        }
      })

    ctx.send({
      data: invitation,
      message: "Votre commande a été envoyé !"
    })
  }
};
