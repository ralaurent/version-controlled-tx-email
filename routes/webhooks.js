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

router.post("/open", (req, res) => {
  const { RecordType, MessageID } = req.body;

  if (RecordType !== "Open") return res.status(200).send("OK");

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  if (foundEmailStats) {
    if (foundEmailStats.openCount < foundEmailStats.totalSent)
      foundEmailStats.openCount++;

    res.status(200).send("OK");
  } else {
    res.status(404).send("No stats found for email");
  }
});

router.post("/click", (req, res) => {
  const { RecordType, MessageID, Recipient } = req.body;

  if (RecordType !== "Click") return res.status(200).send("OK");

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  if (foundEmailStats) {
    if (
      foundEmailStats.clickCount < foundEmailStats.totalSent &&
      !foundEmailStats.recipients.includes(Recipient)
    ) {
      foundEmailStats.clickCount++;
      foundEmailStats.recipients.push(Recipient);
    }

    res.status(200).send("OK");
  } else {
    res.status(404).send("No stats found for email");
  }
});

module.exports = router;
