const express = require("express");
const {
  Emails,
  Users,
  UserEmails,
  EmailStats,
  EmailTemplates,
} = require("../db");
const { findEmailStatsByMessageId } = require("../utils");
const router = express.Router();

router.get("/openRate", (req, res) => {
  const { MessageID } = req.body;

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  res
    .status(200)
    .send(`${(foundEmailStats.openCount / foundEmailStats.totalSent) * 100}%`);
});

router.get("/clickRate", (req, res) => {
  const { MessageID } = req.body;

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  res
    .status(200)
    .send(`${(foundEmailStats.clickCount / foundEmailStats.totalSent) * 100}%`);
});

module.exports = router;
