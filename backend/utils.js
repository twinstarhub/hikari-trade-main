const { ContractFactory, ethers } = require("ethers");
const crypto = require("crypto");

const { HIKARI_ADDR } = require("./abis/address");
const ERC20ABI = require("./abis/ERC20ABI.json");
const HIKARIABI = require("./abis/HIKARIABI.json");
const FactoryV2ABI = require("./abis/IUniswapV2Factory.json");
const RouterV2ABI = require("./abis/IUniswapV2Router02.json");
const PairV2ABI = require("./abis/IUniswapV2Pair.json");
const UniswapV2TWAP = require("./abis/UniswapV2TWAP.json");

const encrypt = (text) => {
  let iv = crypto.randomBytes(Number(process.env.IV_LENGTH));
  let cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(process.env.ENCRYPTION_KEY),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + "::" + encrypted.toString("hex");
};

const decrypt = (text) => {
  try {
    let textParts = text.split("::");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join("::"), "hex");
    let decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(process.env.ENCRYPTION_KEY),
      iv
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return "";
  }
};

const RPC_ENDPOINT =
  "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

const addresses = {
  twapAddress: "0x83a5aae175B863467bbd93688cc6Ac5BA5c7de59",
  token1: "0x6eF5b03Aa311801B585fd460C5F569d1DA05b347",
  token2: "0xE366eCB27D3C29df9F286f1C67e5985A76389A33",
  factoryV2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  routerV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
};

const getContract = (abi, address, signer) => {
  const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
  const signerOrProvider = signer ?? simpleRpcProvider;
  return new ethers.Contract(address, abi, signerOrProvider);
};

const getTokenContract = (address, signer) => {
  return getContract(ERC20ABI, address, signer);
};

const getHikariContract = (signer) => {
  return getContract(HIKARIABI, HIKARI_ADDR, signer);
};

const getFactoryV2Contract = (signer) => {
  return getContract(FactoryV2ABI, addresses.factoryV2, signer);
};

const getRouterV2Contract = (signer) => {
  return getContract(RouterV2ABI, addresses.routerV2, signer);
};

const getPairV2Contract = (pairAddress, signer) => {
  return getContract(PairV2ABI, pairAddress, signer);
};

const getV2OracleFactory = async (signer) => {
  const uniswapV2OracleFactory = new ContractFactory(
    UniswapV2TWAP.abi,
    UniswapV2TWAP.bytecode,
    signer
  );
  return uniswapV2OracleFactory;
};

const getV2OracleFactoryContract = (twapAddress, signer) => {
  return getContract(UniswapV2TWAP.abi, twapAddress, signer);
};

module.exports = {
  encrypt,
  decrypt,
  RPC_ENDPOINT,
  addresses,
  getContract,
  getTokenContract,
  getHikariContract,
  getFactoryV2Contract,
  getRouterV2Contract,
  getPairV2Contract,
  getV2OracleFactory,
  getV2OracleFactoryContract,
};
