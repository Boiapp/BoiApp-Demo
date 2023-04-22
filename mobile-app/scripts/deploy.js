// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
require("dotenv").config();
const { utils } = require("ethers");
const hre = require("hardhat");

const {
  PUBLIC_KEY_DRIVER,
  PUBLIC_KEY_PASSENGER,
  PUBLIC_KEY_ARBITROR,
  PRIVATE_KEY_ARBITROR,
} = process.env;

async function main() {
  const Factory = await hre.ethers.getContractFactory("Factory");
  const factory = await Factory.deploy();

  console.log("Escrow deployed to:", factory.address);
}

async function escrow() {
  const Escrow = await hre.ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    PUBLIC_KEY_ARBITROR,
    PUBLIC_KEY_PASSENGER,
    utils.parseEther("0.08"),
    utils.parseEther("0.05")
  );

  await escrow.deployed();
  console.log("Escrow deployed to:", escrow.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
