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

  if (foundEmailStats?.totalSent) {
    res
      .status(200)
      .send(
        `Your open rate is: ${
          (foundEmailStats?.openCount || 0 / foundEmailStats.totalSent) * 100
        }%`
      );
  } else {
    res.status(404).send("No stats found for email");
  }
});

router.get("/clickRate", (req, res) => {
  const { MessageID } = req.query;

  const foundEmailStats = findEmailStatsByMessageId(MessageID);

  if (foundEmailStats?.totalSent) {
    res
      .status(200)
      .send(
        `Your click rate is: ${
          (foundEmailStats?.clickCount || 0 / foundEmailStats.totalSent) * 100
        }%`
      );
  } else {
    res.status(404).send("No stats found for email");
  }
});

module.exports = router;
