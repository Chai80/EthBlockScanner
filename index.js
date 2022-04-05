const { Wallet, utils, providers: { JsonRpcProvider } } = require("ethers");

const PROVIDERS = {
  MAINNET: "mainnet",
  ROPSTEN: "ropsten",
  KOVAN: "kovan",
  RINKEBY: "rinkeby"
}


//No functionality atm - needs front end

/*
const providerChoice = PROVIDERS.MAINNET;
const providerString = `https://${providerChoice}.infura.io/v3/5e72d707056f4973899767e9768afbc1`


function setProvider(prov) {
  let providerChoice;
  switch(prov){
  case '0':
    providerChoice = PROVIDERS.MAINNET;
    break;
  case '1':
    providerChoice = PROVIDERS.ROPSTEN;
    break;
  case '2':
    providerChoice = PROVIDERS.KOVAN;
    break;
  case '3':
    providerChoice = PROVIDERS.RINKEBY;
    break;
  default:
    providerChoice = PROVIDERS.MAINNET;
  }
  var providerString = `https://${providerChoice}.infura.io/v3/5e72d707056f4973899767e9768afbc1`
  var provider = new JsonRpcProvider(providerString);
}
*/

//Gets the current block and extracts and prints out relevant information
async function getCurrentBlock() {

  let blockHeight = await provider.getBlockNumber();
  let blockDetails = await provider.getBlockWithTransactions(blockHeight);

  const blockTimeStamp = blockDetails.timestamp;
  const transactionCount = blockDetails.transactions.length
  const difficulty = blockDetails.difficulty;
  const blockHash = blockDetails.hash;
  const nonce = blockDetails.nonce;
  const miner = blockDetails.miner;

  const totalETHArray = await getBlockTotalETH(blockHeight);
  const totalETH = totalETHArray[0];
  const highestETH = totalETHArray[1];
  const transactionSortedArray = await getSortedTransactions();
  const zeroTotalTransactionValue = transactionSortedArray[0];
  const totalTransactionValue = transactionSortedArray[1];

  console.log(`Block Height: ${blockHeight}
    Block Hash: ${blockHash}
    TimeStamp: ${blockTimeStamp}
    Nonce: ${nonce}
    Difficulty: ${difficulty}
    Mined By: ${miner}
    Transactions: ${transactionCount}
        With No Value: ${zeroTotalTransactionValue}
        With Some Value: ${totalTransactionValue}
            Highest Value Transfer: ${highestETH} ETH
    Total ETH Transferred in Block: ${totalETH} ETH`);
}


//Takes an address and outputs its balance
async function getAccountBalance(address = "0x84E3F9bfBeA2aE09f032DB53eB9f994CC157252f") {
    let balance = await provider.getBalance(address);
    balance = utils.formatEther(balance);
    console.log(`${balance} ETH`);
}

//Takes a block's hash (or no arg will get latest)
//and prints the sum of each transaction's "value" element, and which was highest
async function outputBlockTotalETH(blockHash = "latest") {
  const outputArray = await getBlockTotalETH(blockHash);
  console.log(`Block: ${blockHash}
    Total ETH Transferred: ${outputArray[0]} ETH
    Highest Value Transfer: ${outputArray[1]} ETH`);

}

//Helper function to get a block and extract just the transactions, then just the "value" elements
//returns a tuple array of the total ETH transferred and the highest value transfer "value"
async function getBlockTotalETH(blockNumber = "latest") {
  let blockHeight;
  if (blockNumber === "latest") {
    blockHeight = await provider.getBlockNumber();

  }
  else {
    blockHeight = blockNumber;
  }

  let blockDetails = await provider.getBlockWithTransactions(blockHeight);
  let Transactions = blockDetails.transactions;
  let transactionSum = 0;
  let val = 0;
  for (let i = 0; i < Transactions.length; i++){
    let current = parseInt(Transactions[i].value, 16);
    if (current > val) {
      val = current;
    }
    transactionSum += current;
  }
  transactionSum = transactionSum.toString();
  val = val.toString();

  transSum = utils.formatEther(transSum);
  val = utils.formatEther(val);

  return [transactionSum, val];
}


//Helper function
//Returns an array with each element as a condensed transaction object
async function getLatestBlockTransactions() {
    let blockNumber = await provider.getBlockNumber();
    let blockDetails = await provider.getBlockWithTransactions(blockNumber);
    let Transactions = blockDetails.transactions;  
    let transactionArray = [];
  
    //Pushes all transaction details into a transaction array 
    for (let i = 0; i < Transactions.length; i++){
      transactionArray.push({
        transactionIndex: Transactions[i].transactionIndex,
        hash: Transactions[i].hash,
        to: Transactions[i].to,
  
        from: {
          address: Transactions[i].from,
          r: Transactions[i].r,
          s: Transactions[i].s,
          v: Transactions[i].v
        },
  
        value: Transactions[i].value,
  
        gas: {
          amount: Transactions[i].gas,
          gasPrice: Transactions[i].gasPrice,
          gasLimit: Transactions[i].gasLimit
        },
  
        type: Transactions[i].type,
        nonce: Transactions[i].nonce
        
        //input, data
      });
    }
    return transactionArray;
  }

  // Helper Function - Prints out a condensed list of all transactions in the latest block
async function outputLatestBlockTransactions() {

    const transactionArray = await getLatestBlockTransactions();
    console.log(transactionArray);
  }

async function getSortedTransactions() {

    const transactionArray = await getLatestBlockTransactions();
    let transactionArrayOfValueZero = [];
    let transactionArrayOfValue = [];
  
    //Separate transactions into transfers (value is non zero) and others (value is zero)
    for (let t in transArray){
      if (transArray[t].value === '0x0'){
        transactionArrayOfValueZero.push(transArray[t]);
      }
      else {
        transactionArrayOfValue.push(transArray[t]);
      }
    }
    return [transactionArrayOfValueZero.length, transactionArrayOfValue.length];
  }
  


module.exports = { getCurrentBlock, getAccountBalance, outputLatestBlockTransactions, outputBlockTotalETH }
