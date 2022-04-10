import { ethers, upgrades } from "hardhat";

async function main() {
  const StudentFaucet = await ethers.getContractFactory("StudentFaucet");
  const instance = await upgrades.deployProxy(StudentFaucet, [
    "ShibuyaStudentFaucet",
    "SSF",
    "https://www.as-faucet.xyz/api/metadata?type=shibuya&id=",
    ethers.utils.parseEther("0.05"),
    7 * 24 * 60 * 60,
  ]);

  await instance.deployed();

  console.log("StudentFaucet deployed to:", instance.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
