const express = require("express");
const postmark = require("postmark");
const {
  Emails,
  Users,
  UserEmails,
  EmailStats,
  EmailTemplates,
} = require("../db");
const { getTemplateById } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const router = express.Router();
require("dotenv").config();

var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

router.post("/send", async (req, res) => {
  const { from, to, subject, text, templateId, templateModel, campaignName } =
    req.body;

  const unqiueRecipients = Array.isArray(to) ? [...new Set(to)] : to;

  try {
    const result = await client.sendEmailWithTemplate({
      From: from,
      To: Array.isArray(unqiueRecipients)
        ? unqiueRecipients.join(", ")
        : unqiueRecipients,
      TemplateId: templateId,
      TemplateModel: templateModel,
      MessageStream: "outbound",
      TrackOpens: true,
      TrackLinks: "HtmlAndText",
    });

    let lastUserId = Users.length;
    const newUsers = unqiueRecipients.map((email) => ({
      id: ++lastUserId,
      userEmail: email,
      createdAt: new Date(),
    }));
    Users.push(...newUsers);

    const template = await getTemplateById(templateId);
    EmailTemplates[templateId] = EmailTemplates[templateId] || [];
    EmailTemplates[templateId] = [
      ...EmailTemplates[templateId],
      {
        id: EmailTemplates[templateId]?.length
          ? EmailTemplates[templateId].length + 1
          : 1,
        version: uuidv4(),
        subject: subject,
        content: template.HtmlBody,
        sentStatus: true,
        createdAt: new Date(),
      },
    ];

    const newEmail = {
      id: Emails.length + 1,
      messageId: result.MessageID,
      campaignName: campaignName || "Default Campaign",
      subject: subject,
      emailTemplateId: templateId,
      version:
        EmailTemplates[templateId][EmailTemplates[templateId].length - 1]
          .version,
      createdAt: new Date(),
    };
    Emails.push(newEmail);

    let lastUserEmailId = UserEmails?.length;
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
      recipients: [],
      totalSent: Array.isArray(unqiueRecipients) ? unqiueRecipients.length : 1,
      createdAt: new Date(),
    });

    res
      .status(201)
      .send(`New Campaign started, copy campaign id: ${result.MessageID}!`);
  } catch (err) {
    res.status(500).send(`Error sending email: ${err}`);
  }
});

router.post("/metrics", (req, res) => {
  const { MessageID } = req.body;

  const foundEmail = Emails.find((email) => email.messageId === MessageID);
  if (!foundEmail) return res.status(404).send("No email found");

  const foundEmailStats = EmailStats.find(
    (stat) => stat.emailId === foundEmail?.id
  );

  if (!foundEmailStats) return res.status(404).send("No stats found for email");

  const foundEmailTemplate = EmailTemplates[foundEmail.emailTemplateId]?.find(
    (template) => template.version === foundEmail.version
  );

  if (!foundEmailTemplate)
    return res.status(404).send("No template found for email");

  const data = {
    template: foundEmailTemplate,
    stats: {
      openRate: `${
        ((foundEmailStats.openCount / foundEmailStats.totalSent) * 100).toFixed(2)
      }%`,
      clickRate: `${
        ((foundEmailStats.clickCount / foundEmailStats.totalSent) * 100).toFixed(2)
      }%`,
      totalSent: foundEmailStats.totalSent,
      usersWhoClicked: foundEmailStats.recipients,
    },
  };

  res.status(200).send(data);
});

router.post("/getRecipients", (req, res) => {
  const { MessageID } = req.body;

  const foundEmailId = Emails.find((email) => email.messageId === MessageID).id;

  if (!foundEmailId) return res.status(404).send("No email found");

  const foundUserIds = UserEmails.filter(
    (userEmail) => userEmail.emailId === foundEmailId
  ).map((userEmail) => userEmail.userId);

  if (!foundUserIds.length) return res.status(404).send("User ids not found");

  const uniqueEmails = [
    ...new Set(
      Users.filter((user) => foundUserIds.includes(user.id)).map(
        (user) => user.userEmail
      )
    ),
  ];

  if (!uniqueEmails.length) return res.status(404).send("Emails not found");

  res.status(200).send(uniqueEmails);
});

module.exports = router;
