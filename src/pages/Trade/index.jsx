/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from "react";
import {
  Box,
  Link,
  useMediaQuery,
  Input,
  TextField,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from "@mui/material";
import { FaTwitter, FaDiscord, FaTelegramPlane } from "react-icons/fa";
import ReactLoading from "react-loading";
import styled from "styled-components";
import {
  AiOutlineDown,
  AiOutlineSwap,
  AiOutlineArrowRight,
} from "react-icons/ai";
import AccountCircle from "@mui/icons-material/AccountCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Parse from "parse/dist/parse.min.js";
import { ethers, ContractFactory } from "ethers";
import BigNumber from "bignumber.js";
import { useWeb3Context, useAddress } from "../../hooks/web3Context";
import {
  addresses,
  getTokenContract,
  getHikariContract,
  getFactoryV2Contract,
  getRouterV2Contract,
  getV2OracleFactory,
  getV2OracleFactoryContract,
  getPairV2Contract,
} from "../../utils/contracts";
import { db } from "../../utils/firebase";

function Trade() {
  const sm = useMediaQuery("(max-width : 710px)");
  const [duration, setDuration] = useState("");
  const [sellToken, setSellToken] = useState(
    "0xA7Aab5027E758Ccc1813C97b36e7Cb475e72671D"
  );
  const [sellAmount, setSellAmount] = useState("");
  const [buyToken, setBuyToken] = useState(
    "0xcB7b1FaD22A2E93040b44b41F66be5797db1d673"
  );
  const [buyAmount, setBuyAmount] = useState("");
  const [counterParty, setCounterParty] = useState("");
  const [expried, setExpried] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [twapCreated, setTwapCreated] = useState(false);
  const [loading, setLoading] = useState(0);
  const [isTWAP, setTWAP] = useState(true);
  const [quantity, setQuantity] = useState("");
  const [durationIn, setDurationIn] = useState("");
  const HikariSwap = "0x00d42411b240F71A611f634dec54a6cc42f0e801";

  const handleDuration = (event) => {
    setDuration(event.target.value);
  };

  const handleAdvance = (event) => {
    setTWAP(event.target.value);
  };

  const [pending, setPending] = useState(false);

  const account = useAddress();
  const { connect, disconnect, provider } = useWeb3Context();
  const wallet = useWeb3Context();

  // const onApproveContract = async (address) => {
  //   setPending(true);
  //   const tokenContract = getTokenContract(address, provider.getSigner());
  //   const estimateGas = await tokenContract.estimateGas.approve(
  //     HikariSwap,
  //     ethers.utils.parseEther(sellAmount)
  //   );
  //   console.log(estimateGas.toString());
  //   if (estimateGas / 1 === 0) {
  //     console.log("Insufficient funds");
  //     // setNotification({
  //     //   type: "error",
  //     //   title: "Error",
  //     //   detail: "Insufficient funds",
  //     // });
  //     setPending(false);
  //     return;
  //   }
  //   const tx = {
  //     gasLimit: estimateGas.toString(),
  //   };
  //   const approvetx = await tokenContract.approve(
  //     HikariSwap,
  //     ethers.utils.parseEther(sellAmount),
  //     tx
  //   );
  //   await approvetx.wait();
  //   setPending(false);
  // };

  // const onMakeOffer = async () => {
  //   setPending(true);
  //   const estimateGas = await hikariContract.estimateGas.makeOffer(
  //     sellToken,
  //     ethers.utils.parseEther(sellAmount),
  //     buyToken,
  //     ethers.utils.parseEther(buyAmount)
  //   );
  //   console.log(estimateGas.toString());
  //   if (estimateGas / 1 === 0) {
  //     console.log("Insufficient funds");
  //     // setNotification({
  //     //   type: "error",
  //     //   title: "Error",
  //     //   detail: "Insufficient funds",
  //     // });
  //     setPending(false);
  //     return;
  //   }
  //   const tx = {
  //     gasLimit: estimateGas.toString(),
  //   };
  //   const approvetx = await hikariContract.makeOffer(
  //     sellToken,
  //     ethers.utils.parseEther(sellAmount),
  //     buyToken,
  //     ethers.utils.parseEther(buyAmount),
  //     tx
  //   );
  //   await approvetx.wait();
  //   setPending(false);
  // };

  const CreateOrder = async () => {
    try {
      if (!account) {
        alert("Please connect your wallet");
        return;
      }
      if (!sellAmount) {
        alert("Input Sell Amount");
        return;
      }
      setPending(true);
      const tokenContract1 = getTokenContract(
        addresses.token1,
        provider.getSigner()
      );
      console.log(tokenContract1);

      const estimateGas1 = await tokenContract1.estimateGas.approve(
        addresses.routerV2,
        ethers.utils.parseEther(sellAmount)
      );
      const tx1 = {
        gasLimit: estimateGas1.toString(),
      };
      const instanceT1Approve = await tokenContract1.approve(
        addresses.routerV2,
        ethers.utils.parseEther(sellAmount),
        tx1
      );
      await instanceT1Approve.wait();

      const uniswapV2Router = getRouterV2Contract(provider.getSigner());
      const estimateGas2 =
        await uniswapV2Router.estimateGas.swapExactTokensForTokens(
          ethers.utils.parseEther(sellAmount),
          0,
          [addresses.token1, addresses.token2],
          account,
          ethers.constants.MaxUint256
        );
      const tx2 = {
        gasLimit: estimateGas2.toString(),
      };
      const routerinstance = await uniswapV2Router.swapExactTokensForTokens(
        ethers.utils.parseEther(sellAmount),
        0,
        [addresses.token1, addresses.token2],
        account,
        ethers.constants.MaxUint256,
        tx2
      );
      await routerinstance.wait();

      const uniswapV2Oracle = getV2OracleFactoryContract(
        addresses.twapAddress,
        provider.getSigner()
      );
      const consult = await uniswapV2Oracle.consult(
        addresses.token1,
        ethers.utils.parseEther(sellAmount)
      );
      await db.collection("orders").add({
        orderId: new Date().valueOf(),
        sellTokenAddress: addresses.token1,
        sellTokenAmount: sellAmount,
        buyTokenAddress: addresses.token2,
        buyTokenAmount: consult.toString(),
      });
      alert("Order Created");
      setPending(false);
    } catch (error) {
      setPending(false);
      setPending(false);
      console.log(error);
    }
  };

  const TwapOrVwap = async () => {
    try {
      if (!account) {
        alert("Please connect your wallet");
        return;
      }

      setPending(true);
      const uniswapV2Oracle = getV2OracleFactoryContract(
        addresses.twapAddress,
        provider.getSigner()
      );
      console.log(ethers.utils.parseEther(quantity));
      const consult = await uniswapV2Oracle.consult(
        addresses.token1,
        ethers.utils.parseEther(quantity)
      );

      let amount1;
      let amount2;
      let sellTokenAddress;
      let buyTokenAddress;

      if (isTWAP == false || isTWAP == "false") {
        amount1 = consult;
        amount2 = ethers.utils.parseEther(quantity);
        sellTokenAddress = addresses.token1;
        buyTokenAddress = addresses.token2;
      } else {
        amount1 = ethers.utils.parseEther(quantity);
        amount2 = consult;
        sellTokenAddress = addresses.token2;
        buyTokenAddress = addresses.token1;
      }

      const tokenContract1 = getTokenContract(
        sellTokenAddress,
        provider.getSigner()
      );
      const tokenContract2 = getTokenContract(
        buyTokenAddress,
        provider.getSigner()
      );

      const eGas1 = await tokenContract1.estimateGas.approve(
        addresses.routerV2,
        amount1
      );

      const tx1 = {
        gasLimit: eGas1.toString(),
      };
      await tokenContract1.approve(addresses.routerV2, amount1, tx1);

      const eGas2 = await tokenContract2.estimateGas.approve(
        addresses.routerV2,
        amount2
      );

      const tx2 = {
        gasLimit: eGas2.toString(),
      };
      const instanceT2Approve = await tokenContract2.approve(
        addresses.routerV2,
        amount2,
        tx2
      );
      await instanceT2Approve.wait();

      const dration = Number(durationIn) * 60 * 1000 + new Date().valueOf();
      const uniswapV2Router = getRouterV2Contract(provider.getSigner());

      const eGas3 = await uniswapV2Router.estimateGas.addLiquidity(
        sellTokenAddress,
        buyTokenAddress,
        amount1,
        amount2,
        "0",
        "0",
        `${account}`,
        `${dration}`
      );

      const tx3 = {
        gasLimit: eGas3.toString(),
      };

      console.log(tx3);

      const instanceAddLiquidity = await uniswapV2Router.addLiquidity(
        sellTokenAddress,
        buyTokenAddress,
        amount1,
        amount2,
        "0",
        "0",
        `${account}`,
        `${dration}`,
        tx3
      );
      await instanceAddLiquidity.wait();

      await db.collection("orders").add({
        orderId: new Date().valueOf(),
        sellTokenAddress,
        sellTokenAmount: amount1.toString(),
        buyTokenAddress,
        buyTokenAmount: amount2.toString(),
      });
      setPending(false);

      alert(
        isTWAP == false || isTWAP == "false"
          ? "VWAP created successfully."
          : "TWAP created successfully."
      );
    } catch (error) {
      setPending(false);
      console.log(error);
      alert("Something went wrong, plz try again.");
    }
  };

  return (
    <StyledContainer>
      <Background />
      <Box position={"relative"}>
        <TradeBox>
          {!advanced && (
            <>
              <TradeHead>Start a Trade</TradeHead>
              <TradeText>
                Select the tokens, amounts, and expiration for your trade
              </TradeText>
              <Box
                marginTop={"65px"}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-end"
                >
                  <TradeDesc>You'll send</TradeDesc>
                  <Box
                    marginTop="36px"
                    display="flex"
                    alignItems="center"
                    gap="8px"
                  >
                    <Box
                      display="flex"
                      gap="8px"
                      alignItems="center"
                      sx={{ cursor: "pointer" }}
                    >
                      <TokenName>HIKARI</TokenName>
                      <AiOutlineDown />
                    </Box>
                    <Input
                      inputProps={{ style: { fontSize: 30 } }} // font size of input text
                      sx={{ width: "100px" }}
                      value={sellAmount}
                      onChange={(e) => {
                        setSellAmount(e.target.value);
                      }}
                    />
                  </Box>
                  <Box
                    marginTop="16px"
                    display="flex"
                    alignItems="center"
                    gap="8px"
                  >
                    <TokenSmallName>1 HIKARI = </TokenSmallName>
                    <Box display="flex" alignItems="center" gap="8px">
                      <Input
                        inputProps={{
                          style: { fontSize: 15, textAlign: "right" },
                        }} // font size of input text
                        sx={{ width: "100px" }}
                        value={
                          buyAmount / sellAmount ? buyAmount / sellAmount : ""
                        }
                        onChange={(e) => {
                          setBuyAmount(sellAmount * e.target.value);
                        }}
                      />
                      <TokenSmallName>ETH</TokenSmallName>
                    </Box>
                  </Box>
                </Box>
                <Box
                  display="flex"
                  border="1px solid black"
                  borderRadius="50%"
                  padding="12px"
                  sx={{ cursor: "pointer" }}
                >
                  <AiOutlineSwap />
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                >
                  <TradeDesc>You'll receive</TradeDesc>
                  <Box
                    marginTop="36px"
                    display="flex"
                    alignItems="center"
                    gap="8px"
                  >
                    <Input
                      inputProps={{ style: { fontSize: 30 } }} // font size of input text
                      sx={{ width: "100px" }}
                      value={buyAmount}
                      onChange={(e) => {
                        setBuyAmount(e.target.value);
                      }}
                    />
                    <Box
                      display="flex"
                      gap="8px"
                      alignItems="center"
                      sx={{ cursor: "pointer" }}
                    >
                      <TokenName>ETH</TokenName>
                      <AiOutlineDown />
                    </Box>
                  </Box>
                  <Box
                    marginTop="16px"
                    display="flex"
                    alignItems="center"
                    gap="8px"
                  >
                    <TokenSmallName>1 ETH = </TokenSmallName>
                    <Box display="flex" alignItems="center" gap="8px">
                      <Input
                        inputProps={{ style: { fontSize: 15 } }} // font size of input text
                        sx={{ width: "100px" }}
                        value={
                          sellAmount / buyAmount ? sellAmount / buyAmount : ""
                        }
                        onChange={(e) => {
                          setSellAmount(buyAmount * e.target.value);
                        }}
                      />
                      <TokenSmallName>HIKARI</TokenSmallName>
                    </Box>
                  </Box>
                </Box>
              </Box>
              <Box
                marginTop={"112px"}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap="12px"
              >
                <Box display="flex" alignItems="center" gap="8px">
                  <AccountCircle />
                  <Input
                    value={counterParty}
                    onChange={(e) => {
                      setCounterParty(e.target.value);
                    }}
                  />
                </Box>
                <Box display="flex" alignItems="center" gap="8px">
                  <AccessTimeIcon />
                  Expired in
                  <Input
                    sx={{ width: "50px" }}
                    value={expried}
                    onChange={(e) => {
                      setExpried(e.target.value);
                    }}
                  />
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      labelId="demo-simple-select-standard-label"
                      id="demo-simple-select-standard"
                      value={duration}
                      onChange={handleDuration}
                      sx={{ width: "100px" }}
                    >
                      <MenuItem value={3600}>Hour</MenuItem>
                      <MenuItem value={60}>Minutes</MenuItem>
                      <MenuItem value={86400}>Day</MenuItem>
                      <MenuItem value={604800}>Weeks</MenuItem>
                      <MenuItem value={2629743}>Months</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <CreateBtn
                  pending={(pending === false).toString()}
                  onClick={() => !pending && CreateOrder()}
                >
                  {!pending ? (
                    <>
                      Create
                      <AiOutlineArrowRight />
                    </>
                  ) : (
                    <>
                      Create
                      <AiOutlineArrowRight />
                      <CircularProgress
                        size={24}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    </>
                  )}
                </CreateBtn>
              </Box>
            </>
          )}
          {advanced && (
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              alignItems="center"
              height="100%"
            >
              <Box display="flex" justifyContent="center" marginTop="42px">
                <FormControl>
                  <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={isTWAP}
                    onChange={handleAdvance}
                    row={true}
                  >
                    <FormControlLabel
                      value={true}
                      control={<Radio />}
                      label="TWAP"
                    />
                    <FormControlLabel
                      value={false}
                      control={<Radio />}
                      label="VWAP"
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
              <Box>
                <Box display="flex" alignItems="center" gap="24px">
                  <Box
                    fontWeight="400"
                    fontSize="13px"
                    lineHeight="16px"
                    color="#000"
                  >
                    Quantity
                  </Box>
                  <TextField
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                    }}
                    variant="outlined"
                  />
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  gap="24px"
                  marginTop="32px"
                >
                  <Box
                    fontWeight="400"
                    fontSize="13px"
                    lineHeight="16px"
                    color="#000"
                    width="54px"
                  >
                    Duration in (min)
                  </Box>
                  <TextField
                    value={durationIn}
                    onChange={(e) => {
                      setDurationIn(e.target.value);
                    }}
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-end" width="100%">
                <CreateBtn
                  pending={(pending === false).toString()}
                  onClick={() => {
                    if (!loading) TwapOrVwap();
                  }}
                >
                  {!pending ? (
                    <>
                      Create
                      <AiOutlineArrowRight />
                    </>
                  ) : (
                    <>
                      Create
                      <AiOutlineArrowRight />
                      <CircularProgress
                        size={24}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          marginTop: "-12px",
                          marginLeft: "-12px",
                        }}
                      />
                    </>
                  )}
                </CreateBtn>
              </Box>
            </Box>
          )}
          <PowerBox>Powered by Hikari Token</PowerBox>
          <IconBox>
            <img src="/images/logo.png"></img>
          </IconBox>
          <AdvancedBox
            onClick={() => {
              if (!pending) {
                setAdvanced(!advanced);
                if (advanced) {
                  setTwapCreated(!twapCreated);
                }
              }
            }}
          >
            {!advanced ? (
              <AdvancedText>Advanced Options</AdvancedText>
            ) : (
              <>
                <img src="/images/back.png" style={{ width: "30px" }}></img>
                <BackText>Back</BackText>
              </>
            )}
          </AdvancedBox>
        </TradeBox>
      </Box>
    </StyledContainer>
  );
}

const BackText = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;

  color: #000000;
  margin-top: 4px;
`;

const AdvancedText = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 18px;
  line-height: 22px;
  text-align: center;
  text-decoration-line: underline;

  color: #000000;
`;

const AdvancedBox = styled(Box)`
  position: absolute;
  top: 65px;
  left: 50px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const IconBox = styled(Box)`
  position: absolute;
  top: 40px;
  right: 60px;
  opacity: 0.15;
`;

const PowerBox = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;

  color: #000000;
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translate(-50%, 0);
`;

const CreateBtn = styled(Box)`
  opacity: 0.75;
  border: 1px solid #30252f;
  border-radius: 28px;
  padding: 12px 28px;
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 18px;

  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: ${({ pending }) => (pending === "true" ? "pointer" : "not-allowed")};
  position: relative;
  :hover {
    background-color: rgb(75, 198, 139);
    color: white;
  }
  transition: all 0.5s ease-out;
`;
const TokenSymbol = styled(Box)``;
const TokenSmallName = styled(Box)`
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 400;
  font-size: 15px;
  line-height: 20px;

  color: #000000;
`;
const TokenName = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 30px;
  line-height: 36px;

  color: #000000;
  cursor: pointer;
`;

const TradeDesc = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 22px;
  line-height: 27px;
  text-align: center;

  color: #000000;
`;

const TradeText = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 22px;
  line-height: 27px;
  text-align: center;

  color: #000000;
  margin-top: 24px;
`;

const TradeHead = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 45px;
  line-height: 54px;
  text-align: center;

  color: #000000;
`;
const TradeBox = styled(Box)`
  background: #fffcf1;
  opacity: 0.92;
  border: 1px solid #000000;
  box-shadow: inset 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 37px;
  padding: 60px 150px 50px 150px;
  width: fit-content;
  margin: auto;
  position: relative;
  width: 990px;
  height: 600px;
`;
const LaunchApp = styled(Box)`
  margin: 45px 0 0 0;
  width: 200px;
  height: 64px;
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 23px;
  line-height: 120%;

  cursor: pointer;
  -webkit-touch-callout: none; /* iOS Safari */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Old versions of Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
  user-select: none; /* Non-prefixed version, currently
                        supported by Chrome, Edge, Opera and Firefox */

  border: 1px solid #30252f;
  border-radius: 27px;

  display: flex;
  justify-content: center;
  align-items: center;
  :hover:not(:disabled) {
    background-color: rgb(43, 113, 255);
  }
  transition: background-color 0.5s ease-out;

  @media screen and (max-width: 720px) {
    width: 120px;
    height: 48px;
    font-size: 16px;
    margin-top: 35px;
  }
`;

const RowContainer = styled(Box)`
  display: flex;
  align-items: center;
`;

const Socials = styled(Link)`
  margin: 0 37px 0 0 !important;
  text-decoration: none;
  font-size: 30px;
  color: black !important;
`;

const Title = styled(Box)`
  font-family: "DM Sans";
  font-style: normal;
  font-weight: 400;
  font-size: 96px;
  line-height: 130%;
  color: #000000;
  display: flex;

  @media screen and (max-width: 710px) {
    /* flex-direction: column; */
    font-size: 64px;
  }
  @media screen and (max-width: 475px) {
    font-size: 48px;
  }
`;

const Content = styled(Box)`
  font-family: "Inter";
  font-style: normal;
  font-weight: 400;
  font-size: 25px;
  line-height: 120%;
  width: 50%;
  color: #000000;
  margin: 0 0 45px 0;
  @media screen and (max-width: 1000px) {
    width: 80%;
  }
  @media screen and (max-width: 900px) {
    width: 85%;
    font-size: 20px;
  }
  @media screen and (max-width: 710px) {
    width: 90%;
    font-size: 16px;
    margin-top: 36px;
  }
`;

const StyledContainer = styled(Box)`
  padding: 270px 70px 70px 70px;
  width: 100vw;
  min-height: 100vh;

  @media screen and (max-width: 710px) {
    padding: 140px 40px 70px 40px;
  }
  position: relative;
`;

const Background = styled(Box)`
  background-image: url("/images/trade_back.png");
  background-repeat: no-repeat;
  background-size: 1728px 100%;
  background-position-x: 60%; //auto 100vh;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 1177px;
  @media screen and (min-width: 1728px) {
    background-size: 100% 100%;
    height: calc(100vw / 1728 * 1177);
  }

  @media screen and (max-width: 900px) {
    background-size: 1296px 75%;
    background-position-y: 250px;
    height: 100vh;
  }

  @media screen and (max-width: 700px) {
    background-size: 864px 50%;
    background-position-y: 300px;
    height: 100vh;
  }
`;

export default Trade;
