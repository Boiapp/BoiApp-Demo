// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./POT.sol";

contract Factory is ReentrancyGuard {
    POT[] public deployedContracts;
    address public lastContractAddress;
    event ContractCreated(address newAddress);

    function createNew(
        address _passenger,
        uint256 _amountPayable,
        uint256 _arbitrationFee,
        address _tokenAddress
    ) public returns (address) {
        require(
            _amountPayable > 0 && _arbitrationFee > 0,
            "Amount payable and arbitration fee should be greater than 0"
        );
        POT t = new POT(
            msg.sender,
            _passenger,
            _amountPayable,
            _arbitrationFee,
            _tokenAddress
        );
        deployedContracts.push(t);
        lastContractAddress = address(t);
        emit ContractCreated(address(t));
        return address(t);
    }
}
