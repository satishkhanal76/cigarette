const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.json({
    messsage: "success",
    code: 200,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
