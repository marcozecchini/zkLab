# Tutorial on zkSNARK

Ethereum runs computations on all nodes of the network, resulting in high costs, limits in complexity, and low privacy. zkSNARKs have been enabling to only verify computations on-chain for a fraction of the cost of running them, but are hard to grasp and work with.

Some libraries (such as ZoKrates and SnarkyJS) bridges this gap. It helps you create off-chain programs and link them to the Ethereum blockchain, expanding the possibilities for your DApp.


## ZoKrates

ZoKrates is a toolbox for zkSNARKs on Ethereum. It helps you use verifiable computation in your DApp, from the specification of your program in a high level language to generating proofs of computation to verifying those proofs in Solidity.

Install ZoKrates executing this command (on Linux, MacOS):
```
curl -LSfs get.zokrat.es | sh
```

or using Docker:
```
docker run -ti zokrates/zokrates /bin/bash
```

Different phase of the protocol can be executed with these commands:
```bash
# compile
zokrates compile -i root.zok
# perform the setup phase
zokrates setup
# execute the program
zokrates compute-witness -a 337 113569
# generate a proof of computation
zokrates generate-proof
# export a solidity verifier
zokrates export-verifier
# or verify natively
zokrates verify
```

## Mina and SnarkyJS

### What is Mina?
Mina is an L1 blockchain based on zero-knowledge proofs (“ZKP”) with smart contracts written in TypeScript. It is the first cryptocurrency protocol with a succinct blockchain (22KB).

### Why Mina?
Mina Protocol uses zero-knowledge proofs to build a more ideal blockchain architecture.

Early blockchains, like Bitcoin and Ethereum, accumulate data over time and are currently hundreds of gigabytes in size. As time goes on, their blockchains will continue to increase in size. The entire chain history is required in order to verify the current consensus state of these networks.

With Mina, the blockchain always remains a constant size–about 22KB (the size of a few tweets). It’s possible to verify the current consensus state of the protocol using this one recursive, 22KB zero-knowledge proof. This means participants can quickly sync and verify the current consensus state of the network.

![zksnark](https://miro.medium.com/v2/resize:fit:1200/0*9-C_ktghnQRf696P)

![mina blockchain size](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROc4tz7a8Qw2hCFYgJn2tkVPRx46utRQ-K1qcYs-vRt3qyYMsKBnAT1pR_uEe-Zv127BA&usqp=CAU)


>[zkApps](https://docs.minaprotocol.com/zkapps/zkapps-for-ethereum-developers) are the smart contracts on Mina

### Writing zkApp

https://docs.minaprotocol.com/zkapps/how-to-write-a-zkapp 

### Deployment 
Partially follows:

1. https://docs.minaprotocol.com/zkapps/tutorials/deploying-to-a-network 
2. https://docs.minaprotocol.com/zkapps/tutorials/interacting-with-zkapps-server-side 

### Recursion
Follow:

* https://docs.minaprotocol.com/zkapps/tutorials/recursion 