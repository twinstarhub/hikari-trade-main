#!/usr/bin/env node

require("dotenv").config();
var express = require("express");
var app = express();
var cors = require("cors");
const path = require("path");

var bodyParser = require("body-parser");
const { ethers } = require("ethers");
const {
  encrypt,
  decrypt,
  getV2OracleFactoryContract,
  addresses,
} = require("./utils");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
// When you have your own Client ID and secret, put down their values here:

// app.use(express.static(path.join(__dirname, "/public")));

// app.get("*", (req, res) => res.sendFile(`${__dirname}/public/index.html`));

let url = "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";
let provider = new ethers.providers.JsonRpcProvider(url);
const signer = new ethers.Wallet(decrypt(process.env.MAINPRIVE), provider);

const updateTwap = async () => {
  const V2TwapContract = getV2OracleFactoryContract(addresses.twapAddress);
  await V2TwapContract.connect(signer).update();
  console.log("update done");
};

updateTwap();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`server listen ${port} port!`);
});
