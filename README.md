# A simple funding contract

This little project was built in order to practice Solidity's smart contracts
usage of oracles by codification, build, deployment and interaction/execution,
via Remix & web3.js.

Run:

- `npm install`

- `npm run dev`

## FundMe.sol

This smart contract was written at Remix IDE and deployed to Rinkeby testnet:

- Basically it allows funders to donate amounts of ETH.

- It keeps track of what account and how much funds were sent to the contract.

- Only the owner of the contract can withdraw funds, but anyone can check
  how much ETH was sent by a specific account

## app.js + index.html

Via web3.js, the objective here is to build the wiring blocks of code that
bond the Smart Contract with the front-end.

Basically, it works by invoking MetaMask as provider to sign transactions and
publish it into Rinkeby.

On the other hand, it implements the code that handle events and update
information and possible actions for a specific account.

At the front-end, some operations were designed to be shown only for the
owner account, like the consult of amount of ETH donated per account.

---

Code can be refactored to decouple some information or to divide
responsibilities in some places. All suggestions are welcome.
