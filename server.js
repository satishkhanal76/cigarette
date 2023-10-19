const express = require("express");
const app = express();
const port = 3000;

const fs = require("fs");
const cigarettes = JSON.parse(
  fs.readFileSync("./data/cigarettes.json", "utf8")
);
const discounts = JSON.parse(fs.readFileSync("./data/discounts.json", "utf8"));

app.get("/", (req, res) => {
  res.json({
    messsage: "success",
    code: 200,
  });
});

app.get("/cigarettes", (req, res) => {
  res.json(cigarettes);
});

app.get("/discounts", (req, res) => {
  res.json(discounts);
});

app.listen(port, () => {
  console.log(`App running on ${port}`);
});
