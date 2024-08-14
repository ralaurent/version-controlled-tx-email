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
      TemplateModel: {...templateModel, customHtmlContent: '<p>Click <a href="https://www.google.com" class="button button-- trackable-link" target="_blank">Do this Next</a></p>'},
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
        version: EmailTemplates[templateId][EmailTemplates[templateId].length - 1].version,
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
    if (!foundEmail) return res.status(500).send("No email found");

    const foundEmailStats = EmailStats.find(
        (stat) => stat.emailId === foundEmail?.id
    );

    if (!foundEmailStats) return res.status(500).send("No stats found for email");

    const foundEmailTemplate = EmailTemplates[foundEmail.emailTemplateId]?.find(template => template.version === foundEmail.version)

    if(!foundEmailTemplate) return res.status(500).send("No template found for email");

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
