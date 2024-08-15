const { v4: uuidv4 } = require("uuid");

const Emails = [
  {
    id: 1,
    messageId: "24bb8c04-e78a-4b36-9465-b96de21a2e27",
    campaignName: "Default Campaign",
    subject: "Email Subject",
    emailTemplateId: "36959949",
    version: uuidv4(),
    createdAt: new Date(),
  },
];

const Users = [
  {
    id: 1,
    userEmail: "admin@interviewninja.dev",
    createdAt: new Date(),
  },
];

const UserEmails = [
  {
    id: 1,
    userId: 1,
    emailId: 1,
    createdAt: new Date(),
  },
];

const EmailStats = [
  {
    id: 1,
    emailId: 1,
    clickCount: 0,
    openCount: 0,
    totalSent: 0,
    recipients: [],
    createdAt: new Date(),
  },
];

const EmailTemplates = {
  36943148: [
    {
      id: 1,
      subject: "Email Subject",
      version: uuidv4(),
      content: "<></>",
      sentStatus: false,
      createdAt: new Date(),
    },
  ],
};

module.exports = {
  Emails,
  Users,
  UserEmails,
  EmailStats,
  EmailTemplates,
};
