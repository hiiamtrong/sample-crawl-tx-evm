import { ethers } from 'ethers';

// The signed transaction string (EIP-1559 Type 2)
const signedTx =
  '0x02f8a58054808080947729df104c50d2aed49fa271a27a56b36e1316bc80b844a9059cbb000000000000000000000000093a07fb89db473c520e0ca20ab533a922d0b48d0000000000000000000000000000000000000000000000056a6c98e4e8eda7a4c001a089d9a836267ab10f426c7104ae1f298841e9727db874f5eb7bf75d4252f52077a06fc9ac8b83803031013881fd2fcc5983d5b78f6f6814f2b3256846a4eedd2af4';

// Compute the correct transaction hash
async function getTxHash() {
  // Parse the signed transaction using ethers.js
  const tx = ethers.Transaction.from(signedTx);
  console.log({ tx });
  // Output the correct transaction hash
  console.log('Correct Transaction Hash:', tx.hash);
}

getTxHash();
