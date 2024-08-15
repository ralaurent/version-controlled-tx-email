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
  const { MessageID } = req.query;

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  if (!foundEmailStats) return res.status(404).send("No stats found for email");
  res
    .status(200)
    .send(
      `Your open rate is: ${(
        (foundEmailStats.openCount / foundEmailStats.totalSent) *
        100
      ).toFixed(2)}%`
    );
});

router.get("/clickRate", (req, res) => {
  const { MessageID } = req.query;

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  if (!foundEmailStats) return res.status(404).send("No stats found for email");
  res
    .status(200)
    .send(
      `Your click rate is: ${(
        (foundEmailStats.clickCount / foundEmailStats.totalSent) *
        100
      ).toFixed(2)}%`
    );
});

module.exports = router;
