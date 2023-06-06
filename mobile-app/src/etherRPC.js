import "@ethersproject/shims";

import { Buffer } from "buffer";
import { ethers, providers } from "ethers";
import { Alchemy, Network } from "alchemy-sdk";
import TokenABI from "../assets/abi/Token.json";
global.Buffer = global.Buffer || Buffer;

import { API_KEY } from "@env";

const alchemy = new Alchemy({ apiKey: API_KEY, network: Network.MATIC_MUMBAI });
const tokenContractAddresses = ["0xC7932824AdF77761CaB1988e6B886eEe90D35666"];

const getChainId = async () => {
  try {
    const ethersProvider = new ethers.providers.AlchemyProvider(
      "maticmum",
      API_KEY
    );
    const networkDetails = await ethersProvider.getNetwork();
    return networkDetails;
  } catch (error) {
    return error;
  }
};

const getAccounts = async (key) => {
  try {
    const wallet = new ethers.Wallet(key);
    const address = await wallet.address;
    return address;
  } catch (error) {
    return error;
  }
};

const getBalance = async (address) => {
  try {
    const balance = [];
    await alchemy.core
      .getTokenBalances(address, tokenContractAddresses)
      .then((result) => {
        result = ethers.utils.formatEther(result.tokenBalances[0].tokenBalance);
        balance.push(result);
      });
    await alchemy.core.getBalance(address).then((result) => {
      result = ethers.utils.formatEther(result);
      balance.push(result);
    });
    return balance;
  } catch (error) {
    return error;
  }
};

const signMessage = async (key) => {
  try {
    const ethersProvider = new ethers.providers.AlchemyProvider(
      "maticmum",
      API_KEY
    );
    const wallet = new ethers.Wallet(key, ethersProvider);

    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await wallet.signMessage(originalMessage);

    return signedMessage;
  } catch (error) {
    return error;
  }
};

const sendTransaction = async (key, addressTo, value) => {
  try {
    const ethersProvider = new ethers.providers.AlchemyProvider(
      "maticmum",
      API_KEY
    );
    const wallet = new ethers.Wallet(key, ethersProvider);
    const tokenContract = new ethers.Contract(
      tokenContractAddresses[0],
      TokenABI.abi,
      wallet
    );

    const tx = await tokenContract.transfer(
      addressTo,
      ethers.utils.parseEther(value.toString())
    );
    const receipt = await tx.wait();
    console.log(receipt);
    return receipt;
  } catch (error) {
    return error;
  }
};

export default {
  getChainId,
  getAccounts,
  getBalance,
  signMessage,
  sendTransaction,
};
