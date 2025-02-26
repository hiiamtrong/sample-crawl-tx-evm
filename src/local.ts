import { ethers } from "ethers";

function main() {
  const fee = "0.003505829504320000"
  const feeInToken = ethers.parseUnits(fee, 18)
  console.log(feeInToken)
}

main();
