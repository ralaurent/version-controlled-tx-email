const cron = require("node-cron");
const {
  Emails,
  Users,
  UserEmails,
  EmailStats,
  EmailTemplates,
} = require("./db");
const { v4: uuidv4 } = require("uuid");
const { getTemplateById } = require("./utils");

async function shortPolling() {
  const uniqueTemplates = [
    ...new Set(Emails.map((template) => template.emailTemplateId)),
  ];

  await Promise.all(
    uniqueTemplates.map(async (templateId) => {
      const template = await getTemplateById(templateId);
      if (!template) return null;
      if (
        EmailTemplates[templateId] &&
        template.HtmlBody !==
          EmailTemplates[templateId][EmailTemplates[templateId].length - 1]
            .content
      ) {
        console.log("Change detected");
        EmailTemplates[templateId] = [
          ...EmailTemplates[templateId],
          {
            id: EmailTemplates[templateId].length + 1,
            version: uuidv4(),
            subject: template.Subject,
            content: template.HtmlBody,
            sentStatus: false,
            createdAt: new Date(),
          },
        ];
      } else if (!EmailTemplates[templateId]) {
        EmailTemplates[templateId] = [
          {
            id: 1,
            version: uuidv4(),
            subject: template.Subject,
            content: template.HtmlBody,
            sentStatus: false,
            createdAt: new Date(),
          },
        ];
      }
    })
  );
}

const job = cron.schedule("*/5 * * * * *", shortPolling);

job.start();

module.exports = {
  shortPolling,
  job,
};
