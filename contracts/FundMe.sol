//SPDX-License-Identifier: MIT

//Pragma versão 0.8.0
pragma solidity ^0.8.0;

//Contrato FundMe
contract FundMe {
    //Endereço do proprietário do contrato
    address public owner;

    //Lista de doadores
    address[] public funders;

    //Mapeamento entre doadores e montante total doado
    mapping(address => uint256) public addressToAmountFunded;

    //Evento para disparar quando houver nova doação
    event NewFund(address _from, uint256 _value);

    //Construtor
    constructor() {
        //Proprietário do contrato é quem publica o contrato
        owner = msg.sender;
    }

    //Função de doação
    function fund() public payable {
        //Adiciona o doador à lista de funders
        funders.push(msg.sender);
        //Atualiza o montante doada por esse doador
        addressToAmountFunded[msg.sender] += msg.value;
        //Emite evento de nova doação
        emit NewFund(msg.sender, msg.value);
    }

    //Modificador de funções: apenas proprietário
    modifier onlyOwner() {
        //Somente o proprietário pode invocar a função modificada
        require(
            msg.sender == owner,
            "Only the publisher of the contract have this permission!"
        );
        _;
    }

    //Função de saque (modificador: apenas proprietário)
    function withdraw() public payable onlyOwner {
        //Transfere o saldo total para a conta do proprietário
        payable(msg.sender).transfer(address(this).balance);
        //Para cada um dos fundadores
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            //Recupera o endereço do doador a partir da lista de funders
            address funder = funders[funderIndex];
            //Zera o montante doado no mapeamento de montantes totais doados
            addressToAmountFunded[funder] = 0;
        }
        //Reseta a lista de funders
        funders = new address[](0);
    }
}
