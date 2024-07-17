// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import './interfaces/IERC20.sol';
import './interfaces/IVotingEscrow.sol';

contract VeBXT_Airdrop {
    address public admin;
    IVotingEscrow public votingEscrow;
    uint256 public constant TWO_YEARS = 2 * 365 days;

    mapping(address => uint256) public airdropAmounts;
    mapping(address => bool) public claimed;

    event Claimed(address indexed user, uint256 amount);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    constructor(address _votingEscrow) {
        admin = msg.sender;
        votingEscrow = IVotingEscrow(_votingEscrow);
    }

    function claim() external {
        require(!claimed[msg.sender], "Already claimed");
        uint256 amount = airdropAmounts[msg.sender];
        require(amount > 0, "No airdrop amount available");

        claimed[msg.sender] = true;
        votingEscrow.create_lock_for(amount, TWO_YEARS, msg.sender);

        emit Claimed(msg.sender, amount);
    }

    function getAirdropAmount(address user) external view returns (uint256) {
        return airdropAmounts[user];
    }

    function updateVotingEscrow(address _votingEscrow) external onlyAdmin {
        votingEscrow = IVotingEscrow(_votingEscrow);
    }

    function setAirdropAmounts(address[] calldata recipients, uint256[] calldata amounts) external onlyAdmin {
        require(recipients.length == amounts.length, "Recipients and amounts length mismatch");
        for (uint256 i = 0; i < recipients.length; i++) {
            airdropAmounts[recipients[i]] = amounts[i];
        }
    }

    function withdrawRemainingTokens() external onlyAdmin {
        address base = votingEscrow.token();
        uint256 balance = IERC20(base).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(IERC20(base).transfer(admin, balance), "Token transfer failed");
    }
}