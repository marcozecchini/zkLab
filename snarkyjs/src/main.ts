import { Sudoku, Puzzle } from './Sudoku.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';

await isReady;

console.log('SnarkyJS loaded');

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];

// ----------------------------------------------------

// Create a public/private key pair. The public key is our address and where we will deploy to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Sudoku - and deploy it to zkAppAddress
const zkAppInstance = new Sudoku(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// ----------------------------------------------------
const localPuzzle = new Puzzle({cell: [[Field(0), Field(2)], [Field(0), Field(1)]]});
const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.initPuzzle(localPuzzle);
});
await txn1.prove();
console.log(txn1.toPretty());
await txn1.sign([senderKey]).send();

// get the initial state of Square after deployment
const puzzle = zkAppInstance.puzzle.get();
console.log('state after init:', puzzle.cell.toString());

// ----------------------------------------------------
const localSolution = new Puzzle({cell: [[Field(1), Field(2)], [Field(2), Field(1)]]})

try {
  const txn2 = await Mina.transaction(senderAccount, () => {
    zkAppInstance.updateSolution(localSolution);
  });
  await txn2.prove();
  console.log(txn2.toPretty());
  await txn2.sign([senderKey]).send();
} catch (ex: any) {
  console.log(ex.message);
}
const solu = zkAppInstance.solution.get();
console.log('state after txn2:', solu.cell.toString());

// ----------------------------------------------------

console.log('Shutting down');

await shutdown();