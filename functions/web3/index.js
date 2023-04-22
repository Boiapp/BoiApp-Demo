const fetch = require("node-fetch");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ethers = require("ethers");
const Factory = require("../contracts/Factory.sol/Factory.json");
const POT = require("../contracts/POT.sol/POT.json");

const PRIVATE_KEY_ARBITROR = require("./arbitratorKey.js");
const API_KEY = require("./apiKey.js");
const FACTORY_ADDRESS = "0x8b2cC10f3f04d039C228336D50C2918A543eF156";
const PUBLIC_KEY_ARBITROR = "0xd6dd6C7e69D5Fa4178923dAc6A239F336e3c40e3";
const tokenAddress = "0xC7932824AdF77761CaB1988e6B886eEe90D35666";

exports.create_new_pot = functions.https.onRequest(
  async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const { passenger, value } = request.body;
    if (passenger.length === 42 && typeof value === "number") {
      let amountToDriver = value * 0.9; // 90% of the value
      let amountFee = value * 0.1; // 10% of the value
      let alchemy = new ethers.providers.AlchemyProvider("maticmum", API_KEY);
      const arbitror = PRIVATE_KEY_ARBITROR;
      const arbitrorAddress = PUBLIC_KEY_ARBITROR;
      const factoryAddress = FACTORY_ADDRESS;
      const signerArbitror = new ethers.Wallet(arbitror, alchemy);
      const factoryContract = new ethers.Contract(
        factoryAddress,
        Factory.abi,
        signerArbitror
      );
      const ifaceFactory = new ethers.utils.Interface(Factory.abi);
      const createNewPOT = ifaceFactory.encodeFunctionData("createNew", [
        passenger,
        ethers.utils.parseEther(amountToDriver.toString()),
        ethers.utils.parseEther(amountFee.toString()),
        tokenAddress,
      ]);

      const nonceArbitror = await alchemy.getTransactionCount(arbitrorAddress);

      const txCreateNewPOT = {
        to: `${factoryAddress}`,
        data: `${createNewPOT}`,
        nonce: nonceArbitror,
      };

      const signed = signerArbitror.connect(alchemy);

      try {
        const tx = await signed
          .sendTransaction(txCreateNewPOT)
          .then(async (res) => {
            const receipt = await res.wait();
            return receipt;
          });
      } catch (err) {
        response.status(400).send({ message: "Bad request " + err });
      }

      const addressNewContract = await factoryContract
        .lastContractAddress()
        .then((res) => {
          return res;
        })
        .catch((err) => {
          console.log(err);
        });

      response.status(200).send({ addressNewContract });
    } else {
      response.status(400).send({ message: "Bad request" });
    }
  }
);

exports.withdraw_for_passenger = functions.https.onRequest(
  async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const { address } = request.body;
    if (address.length === 42) {
      let alchemy = new ethers.providers.AlchemyProvider("maticmum", API_KEY);
      const arbitror = PRIVATE_KEY_ARBITROR;
      const arbitrorAddress = PUBLIC_KEY_ARBITROR;
      const signerArbitror = new ethers.Wallet(arbitror, alchemy);

      const ifacePOT = new ethers.utils.Interface(POT.abi);
      const withdrawForPassenger = ifacePOT.encodeFunctionData(
        "withdrawByPassenger",
        []
      );

      const nonceArbitror = await alchemy.getTransactionCount(arbitrorAddress);

      const txWithdrawForPassenger = {
        to: `${address}`,
        data: `${withdrawForPassenger}`,
        nonce: nonceArbitror,
      };

      const signed = signerArbitror.connect(alchemy);

      try {
        const tx = await signed
          .sendTransaction(txWithdrawForPassenger)
          .then(async (res) => {
            const receipt = await res.wait();
            return receipt;
          });
      } catch (err) {
        console.log("Error:", err);
        response.status(400).send({ message: "Bad request " + err });
      }

      response.status(200).send({ message: "OK" });
    } else {
      response.status(400).send({ message: "Bad request" });
    }
  }
);

exports.confirm_by_app = functions.https.onRequest(
  async (request, response) => {
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Headers", "Content-Type");
    const { address } = request.body;
    if (address.length === 42) {
      let alchemy = new ethers.providers.AlchemyProvider("maticmum", API_KEY);
      const arbitror = PRIVATE_KEY_ARBITROR;
      const arbitrorAddress = PUBLIC_KEY_ARBITROR;
      const signerArbitror = new ethers.Wallet(arbitror, alchemy);

      const ifacePOT = new ethers.utils.Interface(POT.abi);
      const confirmByApp = ifacePOT.encodeFunctionData(
        "confirmDeliveryByApp",
        []
      );

      const nonceArbitror = await alchemy.getTransactionCount(arbitrorAddress);

      const txConfirmByApp = {
        to: `${address}`,
        data: `${confirmByApp}`,
        nonce: nonceArbitror,
      };

      const signed = signerArbitror.connect(alchemy);

      try {
        const tx = await signed
          .sendTransaction(txConfirmByApp)
          .then(async (res) => {
            const receipt = await res.wait();
            return receipt;
          });
      } catch (err) {
        console.log("Error:", err);
        response.status(400).send({ message: "Bad request " + err });
      }

      response.status(200).send({ message: "OK" });
    } else {
      response.status(400).send({ message: "Bad request" });
    }
  }
);
