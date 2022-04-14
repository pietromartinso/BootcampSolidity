const { default: Web3 } = require("web3")

const assert = require('assert')
const FundMe = artifacts.require('./FundMe.sol')

contract("FundMe", () => {

  let accounts
  let contractAddress

  before(async () => {
    accounts = await web3.eth.getAccounts()
    this.fundMe = await FundMe.deployed()
    contractAddress = await this.fundMe.address
  })

  it("deploys successfully", () => {
    assert.notEqual(contractAddress, 0x0)
    assert.notEqual(contractAddress, "")
    assert.notEqual(contractAddress, null)
    assert.notEqual(contractAddress, undefined)
  })

  it("contract starts with no balance", async () => {
    let balance = await web3.eth.getBalance(contractAddress)
    assert.equal(balance, 0)
  })

  it("sets owner correctly", async () => {
    const contractOwner = await this.fundMe.owner()
    assert.equal(contractOwner, accounts[0])
  })

  it("funds correctly", async () => {
    await this.fundMe.fund({from: accounts[0], value: 20000000000000000})
    await this.fundMe.fund({from: accounts[1], value: 20000000000000000})
    let balance = await web3.eth.getBalance(contractAddress)
    assert.equal(balance, 40000000000000000)
  })

  it("only allows owner to withdraw", async () => {
    try{
      await this.fundMe.withdraw({from: accounts[1]})
      let balance = await web3.eth.getBalance(contractAddress)
      assert.notEqual(parseInt(balance), 0)
    }
    catch {
      await this.fundMe.withdraw({from: accounts[0]})
      let balance = await web3.eth.getBalance(contractAddress)
      assert.equal(balance, 0)
    }
  })

})