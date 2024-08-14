const express = require("express");
const postmark = require("postmark");
const {
  Emails,
  Users,
  UserEmails,
  EmailStats,
  EmailTemplates,
} = require("../db");
const { findEmailStatsByMessageId } = require("../utils");
const { shortPolling } = require("../cronjob");
const router = express.Router();
require("dotenv").config();

var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

router.post("/send", (req, res) => {
  const { from, to, subject, text, templateId, templateModel, campaignName } =
    req.body;

  const unqiueRecipients = Array.isArray(to) ? [...new Set(to)] : to;

  client
    .sendEmailWithTemplate({
      From: from,
      To: Array.isArray(unqiueRecipients) ? unqiueRecipients.join(", ") : unqiueRecipients,
      TemplateId: templateId,
      TemplateModel: templateModel,
      MessageStream: "outbound",
      TrackOpens: true,
      TrackLinks: "HtmlAndText",
    })
    .then(function (result) {
      let lastUserId = Users.length;
      const newUsers = unqiueRecipients.map((email) => ({
        id: ++lastUserId,
        userEmail: email,
        createdAt: new Date(),
      }));
      Users.push(...newUsers);

      shortPolling(); //Force short polling to update templates

      const newEmail = {
        id: Emails.length + 1,
        messageId: result.MessageID,
        campaignName: campaignName || "Default Campaign",
        subject: subject,
        emailTemplateId: templateId,
        createdAt: new Date(),
      };
      Emails.push(newEmail);

      let lastUserEmailId = UserEmails.length;
      const newUserEmails = newUsers.map((user) => ({
        id: ++lastUserEmailId,
        userId: user.id,
        emailId: newEmail.id,
        createdAt: new Date(),
      }));
      UserEmails.push(...newUserEmails);

      EmailStats.push({
        id: EmailStats.length + 1,
        emailId: newEmail.id,
        clickCount: 0,
        openCount: 0,
        totalSent: Array.isArray(unqiueRecipients) ? unqiueRecipients.length : 1,
        createdAt: new Date(),
      });

      res
        .status(200)
        .send(`New Campaign started, copy campaign id: ${result.MessageID}!`);
    })
    .catch(function (err) {
      res.status(500).send(`Error sending email: ${err}`);
    });
});

router.post("/metrics", (req, res) => {
    const { MessageID } = req.body;

    const foundEmail = Emails.find((email) => email.messageId === MessageID);
    if (!foundEmail) return null;

    const foundEmailStats = EmailStats.find(
        (stat) => stat.emailId === foundEmail.id
    );

    const foundEmailTemplate = EmailTemplates[foundEmail.emailTemplateId][EmailTemplates[foundEmail.emailTemplateId].length - 1]

    const data = {
        template: foundEmailTemplate,
        stats: {
            openRate: `${(foundEmailStats.openCount / foundEmailStats.totalSent) * 100}%`,
            clickRate: `${(foundEmailStats.clickCount / foundEmailStats.totalSent) * 100}%`,
        }
    }

    res.status(200).send(data);
});

module.exports = router;
