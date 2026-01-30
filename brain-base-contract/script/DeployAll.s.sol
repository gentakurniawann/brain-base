// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/core/BrainToken.sol";
import "../src/core/MockIDRX.sol";
import "../src/core/BrainSwap.sol";
import "../src/core/QnAWithBounty.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying to Base Sepolia...");
        console.log("Deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        BrainToken brain = new BrainToken(deployer);
        console.log("BRAIN:", address(brain));

        MockIDRX idrx = new MockIDRX();
        console.log("MockIDRX:", address(idrx));

        BrainSwap swap = new BrainSwap(address(brain), address(idrx));
        console.log("BrainSwap:", address(swap));

        QnAWithBounty qna = new QnAWithBounty(deployer);
        console.log("QnAWithBounty:", address(qna));

        uint256 brainLiquidity = 100_000_000 * 1e18;
        uint256 idrxLiquidity = 100_000_000 * 1e18;
        
        brain.transfer(address(swap), brainLiquidity);
        idrx.transfer(address(swap), idrxLiquidity);

        vm.stopBroadcast();

        console.log("");
        console.log("NEXT_PUBLIC_BRAIN_TOKEN_ADDRESS=", address(brain));
        console.log("NEXT_PUBLIC_MOCK_IDRX_ADDRESS=", address(idrx));
        console.log("NEXT_PUBLIC_BRAIN_SWAP_ADDRESS=", address(swap));
        console.log("NEXT_PUBLIC_QNA_CONTRACT_ADDRESS=", address(qna));
    }
}

