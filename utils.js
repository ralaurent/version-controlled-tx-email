const {
  Emails,
  Users,
  UserEmails,
  EmailStats,
  EmailTemplates,
} = require("./db");
const postmark = require("postmark");
require("dotenv").config();

var client = new postmark.ServerClient(process.env.POSTMARK_API_KEY);

const findEmailStatsByMessageId = (MessageID) => {
  const foundEmail = Emails.find((email) => email.messageId === MessageID);
  if (!foundEmail) return null;

  const foundEmailStats = EmailStats.find(
    (stat) => stat.emailId === foundEmail.id
  );
  return foundEmailStats || null;
};

const getTemplateById = async (templateId) => {
  return await client.getTemplate(templateId);
};

module.exports = {
  findEmailStatsByMessageId,
  getTemplateById,
};
