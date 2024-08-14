const express = require("express");
const webhooks = require("./routes/webhooks");
const stats = require("./routes/stats");
const api = require("./routes/api");
require('./cronjob'); 

const app = express();
app.use(express.json());

app.use("/webhook", webhooks);
app.use("/stats", stats);
app.use("/api", api);

const port = 3000;
app.listen(port, () => {
  console.log(`Demo app listening at http://localhost:${port}`);
});
