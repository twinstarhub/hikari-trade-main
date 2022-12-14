import { ContractFactory, ethers } from "ethers";
import { HIKARI_ADDR } from "../abis/address";
import ERC20ABI from "../abis/ERC20ABI.json";
import HIKARIABI from "../abis/HIKARIABI.json";
import FactoryV2ABI from "../abis/IUniswapV2Factory.json";
import RouterV2ABI from "../abis/IUniswapV2Router02.json";
import PairV2ABI from "../abis/IUniswapV2Pair.json";
import UniswapV2TWAP from "../abis/UniswapV2TWAP.json";

export const RPC_ENDPOINT =
  "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161";

export const addresses = {
  twapAddress: "0x83a5aae175B863467bbd93688cc6Ac5BA5c7de59",
  token1: "0x6eF5b03Aa311801B585fd460C5F569d1DA05b347",
  token2: "0xE366eCB27D3C29df9F286f1C67e5985A76389A33",
  factoryV2: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
  priceFeed: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
  routerV2: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
};

export const getContract = (abi, address, signer) => {
  const simpleRpcProvider = new ethers.providers.JsonRpcProvider(RPC_ENDPOINT);
  const signerOrProvider = signer ?? simpleRpcProvider;
  return new ethers.Contract(address, abi, signerOrProvider);
};

export const getTokenContract = (address, signer) => {
  return getContract(ERC20ABI, address, signer);
};

export const getHikariContract = (signer) => {
  return getContract(HIKARIABI, HIKARI_ADDR, signer);
};

export const getFactoryV2Contract = (signer) => {
  return getContract(FactoryV2ABI, addresses.factoryV2, signer);
};

export const getRouterV2Contract = (signer) => {
  return getContract(RouterV2ABI, addresses.routerV2, signer);
};

export const getPairV2Contract = (pairAddress, signer) => {
  return getContract(PairV2ABI, pairAddress, signer);
};

export const getV2OracleFactory = async (signer) => {
  const uniswapV2OracleFactory = new ContractFactory(
    UniswapV2TWAP.abi,
    UniswapV2TWAP.bytecode,
    signer
  );
  return uniswapV2OracleFactory;
};

export const getV2OracleFactoryContract = (twapAddress, signer) => {
  return getContract(UniswapV2TWAP.abi, twapAddress, signer);
};
