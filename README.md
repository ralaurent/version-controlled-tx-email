# Version-Controlled Transactional Email Service
![JavaScript](https://img.shields.io/badge/JavaScript-ESLint-brightgreen)
![Node.js Version](https://img.shields.io/badge/Node.js-18.x-brightgreen)
![Prettier](https://img.shields.io/badge/Prettier-enabled-brightgreen)

[Demo Video](https://www.loom.com/share/c333c367397349439b21f924635d66c4?sid=37d0fba8-a4b2-43c8-a2ea-fc80f02a3010)

## Features

- **Version-Controlled Email Templates**: Manage and store multiple versions of email templates for easy updates and rollbacks.

The most recent version of an email template is stored as the last element in the array associated with the templateId key.
```javascript
const EmailTemplates = {
  "templateId": [
    {
      id: Number,
      subject: String,
      version: String,
      content: String,
      sentStatus: Boolean,
      createdAt: Date,
    },
  ],
};
```

- **Email Tracking**: Monitor email performance with detailed statistics, including open rates, click counts, and total emails sent.
- **Multi-Recipient Support**: Send transactional emails to multiple recipients simultaneously.
- **Email Metadata Storage**: Maintain records of sent emails, associated campaigns, and user interactions.

## Database Schema

![Database Schema](images/database-schema.png)