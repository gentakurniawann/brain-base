// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/core/BrainToken.sol";

/**
 * @title DeployBrainToken
 * @dev Deployment script for BRAIN token on QIE Testnet
 *
 * Usage:
 *   forge script script/DeployBrainToken.s.sol:DeployBrainToken --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY
 */
contract DeployBrainToken is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying BRAIN token...");
        console.log("Deployer address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy BRAIN token - all 1 billion tokens go to deployer
        BrainToken brain = new BrainToken(deployer);

        vm.stopBroadcast();

        // Log results
        console.log("==========================================");
        console.log("BRAIN Token deployed successfully!");
        console.log("==========================================");
        console.log("Contract Address:", address(brain));
        console.log("Token Name:", brain.name());
        console.log("Token Symbol:", brain.symbol());
        console.log("Total Supply:", brain.totalSupply() / 10 ** 18, "BRAIN");
        console.log(
            "Owner Balance:",
            brain.balanceOf(deployer) / 10 ** 18,
            "BRAIN"
        );
        console.log("==========================================");
    }
}
