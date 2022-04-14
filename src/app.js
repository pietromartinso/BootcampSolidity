App = {
  contractAddress: undefined,
  loading: false,
  isOwner: false,
  fundMe: null,

  load: async () => {
    if(await App.loadWeb3()){
      
      await App.loadContract();

      await App.render();
      //[ALTERAR]
    }
    
  },

  loadWeb3: async () => {
    if(window.ethereum){
      if(window.web3){
        window.web3 = new Web3(ethereum);
      } else {
        alert("Metamask was found, but web3 isn't installed");
        return false;
      }
    } else {
      console.log("Non-ethereum browser detected. You should consider trying Metamask!");
      return false;
    }
    
    try {
      const accounts = await window.ethereum.request(
        {
          method: 'eth_requestAccounts'
        }
      );
      App.account = accounts[0];
      if(App.account){
        window.ethereum.on("accountsChanged", App.handleAccountsChanged)
        return true;
      }

    } catch (err){
      if(err.code == 4001){
        alert("User rejected account connection.");
      }
      console.log(err);
      return false;
    }
  },

  loadContract: async () => {
    const file = await fetch("FundMe.json");
    const fileJson = await file.json();
    const fileAbi = fileJson.abi;

    App.contractAddress = fileJson.networks["5777"].address;

    App.fundMe = await new window.web3.eth.Contract(fileJson.abi, App.contractAddress);

    App.isOwner = await App.verifyIsOwner();
    
    let options = {
      filter: {
        value: [],
      },
      fromBlock: 0
    };

    App.fundMe.events.NewFund(options)
    .on("data", event => {App.onNewFund(event)})
    .on("changed", changed => {})
    .on("error", error => {})
    .on("connected", str => {})
    
  },

  verifyIsOwner: async () => {
    try{
      const response = await App.fundMe.methods.owner().call(
        {
          from: App.account.toString()
        }
      )
      if(response.toString().toUpperCase() == App.account.toString().toUpperCase()){
        return true;
      } else {
        return false;
      }

    } catch (err) {
      console.log(err)
      return false;
    }
  },

  handleAccountsChanged: () => {
    window.location.reload();
  },

  onNewFund: (event) => {
    App.renderLastFunded(event.returnValues._value);
  },

  handleClickEth: async () => {
    try{
      let _val = document.getElementById("inputEthValue").value;

      if(_val){
        App.renderFundEthLoading(true);

        _val = App.formatFloatToWei(_val);

        await App.fundMe.methods.fund().send({from: App.account, value: _val});

        App.renderFundEthLoading(false);

        window.location.reload();

      } else {
        alert("Please insert a correct ETH value to fund.");
        return;
      }

    } catch (err) {
      window.location.reload();
      console.log(err);
    }
  },

  handleClickWithdraw: async () => {
    try{
      App.renderWithdrawLoading(true);

      await App.fundMe.methods.withdraw().send({from: App.account});

      App.renderWithdrawLoading(false);

      window.location.reload();
    } catch (err) {
      alert("Could not withdraw funds.");
      window.location.reload();
      console.log(err);
    }
  },

  handleClickFind: async () => {
    try {
      App.renderConsultLoading(true);

      let address = document.getElementById("inputAmountByAddress").value;

      if(address){
        address = address.toString();

        let totalFunded = await App.fundMe.methods.addressToAmountFunded(address).call(
          {
            from: App.account
          }
        );

        let ethText = App.formatWeiToFloat(totalFunded, 5);

        document.getElementById("ethFundAmount").innerText = ethText;

        document.getElementById("amountFundedText").classList.remove("hidden");

        App.renderConsultLoading(false);

      } else {
        App.renderConsultLoading(false);
        addListener("Please, insert a proper Ethereum Address.");
      }

    }
    catch (err) {
      alert("Please, insert a proper Ethereum Address.");
      console.log(err);
    }
  },

  handleDeleteFundedBalance: () => {
    document.getElementById("amountFundedText").classList.add("hidden");

    document.getElementById("inputAmountByAddress").value = "";
  },

  getAccountBalance: async () => {
    try{
      const response = await window.web3.eth.getBalance(App.account);

      return response;

    } catch (err) {
      console.log(err)
    }
  },

  getContractBalance: async () => {
    try{
      const response = await window.web3.eth.getBalance(App.contractAddress);

      let ethText = App.formatWeiToFloat(response, 5);
      return ethText;

    } catch (err) {
      console.log(err)
    }
  },

  render: async () => {
    App.renderLoading(true);
    
    document.getElementById("account").innerText = App.account;
    
    await App.renderUserBalance();

    App.renderLoading(false);
    
    await App.renderOwnerArea();

  },

  renderUserBalance: async () => {
    try{
      const response = await App.getAccountBalance();

      let ethText = App.formatWeiToFloat(response, 5);

      document.getElementById("ethBalance").innerText = ethText;
    } catch (err){
      console.log(err);
    }
  },

  renderOwnerArea: async () => {
    const owner = document.getElementById("owner");
    
    try{
      if(App.isOwner){
        let ethText = await App.getContractBalance();

        document.getElementById("ethContractBalance").innerText = ethText
        
        owner.classList.remove("hidden");
      } else {
        owner.classList.add("hidden");
      }
    } catch (err) {
      console.log(err)
    }
  },

  renderLoading: async (boolean) => {
    const content = document.getElementById("content");
    const loader = document.getElementById("loader");

    if(boolean){
      loader.classList.remove("hidden");
      content.classList.add("hidden");
    } else {
      loader.classList.add("hidden");
      content.classList.remove("hidden");
    }
  },

  renderFundEthLoading: (boolean) => {
    const fundEthPending = document.getElementById("fundEthPending");
    const fundEthContent = document.getElementById("fundEthContent");

    if(boolean){
      fundEthPending.classList.remove("hidden");
      fundEthContent.classList.add("hidden");
    } else {
      fundEthPending.classList.add("hidden");
      fundEthContent.classList.remove("hidden");
    }
  },

  renderWithdrawLoading: (boolean) => {
    const withdrawPending = document.getElementById("withdrawPending");
    const withdrawContent = document.getElementById("withdrawContent");

    if(boolean){
      withdrawPending.classList.remove("hidden");
      withdrawContent.classList.add("hidden");
    } else {
      withdrawPending.classList.add("hidden");
      withdrawContent.classList.remove("hidden");
    }
  },

  renderConsultLoading: (boolean) => {
    const consultPending = document.getElementById("consultPending");
    const consultAddressContent = document.getElementById("consultAddressContent");

    if(boolean){
      consultPending.classList.remove("hidden");
      consultAddressContent.classList.add("hidden");
    } else {
      consultPending.classList.add("hidden");
      consultAddressContent.classList.remove("hidden");
    }
  },

  renderLastFunded: (amount) => {
    const lastFunded = document.getElementById("lastFunded");
    const ethLastFunded = document.getElementById("ethLastFunded");

    lastFunded.classList.remove("hidden");
    ethLastFunded.innerText = App.formatWeiToFloat(amount, 5);
  },

  formatWeiToFloat: (val, precision) => {
    let res = (parseInt(val) / (10 ** 18)).toString();

    let i = res.indexOf(".");

    res = res.substring(0, i+precision+1);

    return res;
  },

  formatFloatToWei: (val) => {
    return (parseFloat(val)) * (10 ** 18);
  }

}


window.onload = async () => {
  App.load();
}