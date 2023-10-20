const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const port = 3000;

const fs = require("fs");
const { kMaxLength } = require("buffer");
const cigarettes = JSON.parse(
  fs.readFileSync("./data/cigarettes.json", "utf8")
);
const discounts = JSON.parse(fs.readFileSync("./data/discounts.json", "utf8"));

app.get("/", (req, res) => {
  res.json({
    messsage: "Running Server!",
    code: 200,
  });
});

app.get("/cigarettes", (req, res) => {
  res.json(cigarettes);
});

app.get("/discounts", (req, res) => {
  res.json(discounts);
});

app.post("/chosen-cigarettes", jsonParser, (req, res) => {
  const responseObj = [];
  const chosenCigarettes = req.body.data;
  console.log(req.body.data);
  for (let i = 0; i < chosenCigarettes.length; i++) {
    const cigarette = chosenCigarettes[i];
    const discountObject = getDiscountObject(cigarette);
    //no discount available for this smoke
    if (!discountObject) {
      const cigaretteObj = {
        hasADiscount: false,
        category: 0,
        sizeDetails: {
          size: cigarette.size,
        },
        cigarettes: [],
      };
      cigaretteObj.cigarettes.push(cigarette);
      responseObj.push(cigaretteObj);
      continue;
    }

    //discount available
    const foundExisting = responseObj.find(
      (discounts) =>
        discounts.category === discountObject.category &&
        discounts.sizeDetails.size === discountObject.sizeDetails.size &&
        discounts.sizeDetails.price === discountObject.sizeDetails.price
    );
    if (foundExisting) {
      foundExisting.cigarettes.push(cigarette);
    } else {
      discountObject.hasADiscount = true;
      discountObject.cigarettes = [];
      discountObject.cigarettes.push(cigarette);
      responseObj.push(discountObject);
    }
  }

  const formattedResponseObj = responseObj.map((obj) => {
    const totalQuantity = obj.cigarettes.reduce((accumulator, cigarette) => {
      return accumulator + parseInt(cigarette.quantity);
    }, 0);
    if (!obj.hasADiscount) {
      obj.scanDetails = {
        openDepartment: 0,
        scan: totalQuantity,
      };
    } else {
      const openDepartment = Math.trunc(totalQuantity / 2);
      const scan = Math.trunc(totalQuantity % 2);
      obj.scanDetails = {
        openDepartment,
        scan,
      };
    }
    return obj;
  });

  res.json(formattedResponseObj);
});

app.listen(port, () => {
  console.log(`App running on ${port}`);
});

const getDiscountObject = (cigarette) => {
  const returningObj = {};
  for (let i = 0; i < discounts.length; i++) {
    const discount = discounts[i];
    if (discount.name !== cigarette.name) continue;
    const flavours = discount.flavours;

    if (!(flavours.includes("all") || flavours.includes(cigarette.flavour)))
      continue;
    const sizes = discount.sizes;

    let foundSize = false;
    for (let j = 0; j < sizes.length; j++) {
      const sizeObj = sizes[j];
      if (sizeObj.size !== cigarette.size) continue;
      foundSize = true;
      returningObj.sizeDetails = sizeObj;
      break;
    }

    if (!foundSize) continue;
    returningObj.category = discount.category;

    return returningObj;
  }
  return null;
};
