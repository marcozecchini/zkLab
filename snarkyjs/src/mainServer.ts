import { Sudoku, Puzzle } from './Sudoku.js';
import { deploy, loopUntilAccountExists } from './util.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';
import fs from 'fs';

const useProof = false;
await isReady;

console.log('SnarkyJS loaded');


// ----------------------------------------------------
const Berkeley = Mina.Network(
  'https://proxy.berkeley.minaexplorer.com/graphql'
);
Mina.setActiveInstance(Berkeley);

const transactionFee = 100_000_000;

const deployAlias = process.argv[2];
const deployerKeysFileContents = fs.readFileSync(
  'keys/' + deployAlias + '.json',
  'utf8'
);
const deployerPrivateKeyBase58 = JSON.parse(
  deployerKeysFileContents
).privateKey;
const deployerPrivateKey = PrivateKey.fromBase58(deployerPrivateKeyBase58);
const deployerPublicKey = deployerPrivateKey.toPublicKey();

const zkAppPrivateKey = PrivateKey.fromBase58(
  'EKFTMuvTirzrwpeHP8RKe7bGufBGiKs27nTMzD5XyMV8NcK3upt2'
);
// const zkAppPrivateKey = PrivateKey.random();

// ----------------------------------------------------

let account = await loopUntilAccountExists({
       account: deployerPublicKey,
       eachTimeNotExist: () => {
         console.log(
           'Deployer account does not exist. ' +
             'Request funds at faucet ' +
             'https://faucet.minaprotocol.com/?address=' +
             deployerPublicKey.toBase58()
         );
       },
       isZkAppAccount: false,
    });
    
console.log(
    `Using fee payer account with nonce ${account.nonce}, balance ${account.balance}`
);

// ----------------------------------------------------
console.log('Compiling smart contract...');
let { verificationKey } = await Sudoku.compile();
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
let zkapp = new Sudoku(zkAppPublicKey);
// Programmatic deploy:
//   Besides the CLI, you can also create accounts programmatically. This is useful if you need
//   more custom account creation - say deploying a zkApp to a different key than the deployer
//   key, programmatically parameterizing a zkApp before initializing it, or creating Smart
//   Contracts programmatically for users as part of an application.
await deploy(deployerPrivateKey, zkAppPrivateKey, zkapp, verificationKey);
await loopUntilAccountExists({
  account: zkAppPublicKey,
  eachTimeNotExist: () =>
    console.log('waiting for zkApp account to be deployed...'),
  isZkAppAccount: true
});
// ----------------------------------------------------

const localPuzzle = new Puzzle({cell: [[Field(0), Field(2)], [Field(0), Field(1)]]});
const txn1 = await Mina.transaction(
  { sender: deployerPublicKey, fee: transactionFee }, 
  () => {
    zkapp.initPuzzle(localPuzzle);
});

let time0 = performance.now();
await txn1.prove();
console.log(txn1.toPretty());
let time1 = performance.now();
console.log(`creating proof took ${(time1 - time0) / 1e3} seconds`);

let pendingTransaction = await txn1.sign([deployerPrivateKey]).send();

if (!pendingTransaction.isSuccess) {
    console.log('error sending transaction 1 (see above)');
    process.exit(0);
  }
console.log(
    `See transaction at https://berkeley.minaexplorer.com/transaction/${pendingTransaction.hash()}
  Waiting for transaction to be included...`
  );
await pendingTransaction.wait();
console.log(`updated state! ${await zkapp.puzzle.fetch()}`);

// ----------------------------------------------------
const localSolution = new Puzzle({cell: [[Field(1), Field(2)], [Field(2), Field(1)]]})

try {
  const txn2 = await Mina.transaction({ sender: deployerPublicKey, fee: transactionFee }, () => {
    zkapp.updateSolution(localSolution);
  });
  await txn2.prove();
  pendingTransaction = await txn2.sign([deployerPrivateKey]).send();
} catch (ex: any) {
  console.log(ex.message);
}

if (!pendingTransaction.isSuccess) {
    console.log('error sending transaction 2 (see above)');
    process.exit(0);
  }
console.log(
    `See transaction at https://berkeley.minaexplorer.com/transaction/${pendingTransaction.hash()}
  Waiting for transaction to be included...`
  );
await pendingTransaction.wait();
console.log(`updated state! ${await zkapp.solution.fetch()}`);
// ----------------------------------------------------

console.log('Shutting down');

await shutdown();