'use strict';

module.exports = () => ({
    sendSms: async ({ message, recipient }) => {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const myNum = process.env.MYNUM;
            const twilioNum = process.env.TWILIONUM;
            const client = require("twilio")(accountSid, authToken);
            await client.messages
                .create({
                    body: message,
                    from: twilioNum, //the phone number provided by Twillio
                    to: recipient, // your own phone number
                }).catch(function (error) { 
                    console.log(error)
                })

            console.log("sms sended")
            return true

        } catch (error) {
            console.log("Sending sms failed");
            console.log(error)
            return false
        }

    }
});
