// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BrainSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable brainToken;
    IERC20 public idrxToken;

    uint256 public ethToBrainRate = 10000 * 1e18;
    uint256 public idrxToBrainRate = 2e14;
    uint256 public brainToIdrxRate = 5000 * 1e18;

    uint256 public faucetAmount = 10 * 1e18;
    mapping(address => bool) public hasClaimed;
    
    uint256 public totalClaims;
    uint256 public totalSwaps;
    uint256 public totalEthSwapped;
    uint256 public totalIdrxSwapped;
    uint256 public totalBrainSwapped;

    event FaucetClaimed(address indexed user, uint256 amount);
    event SwapEthToBrain(address indexed user, uint256 ethAmount, uint256 brainAmount);
    event SwapIdrxToBrain(address indexed user, uint256 idrxAmount, uint256 brainAmount);
    event SwapBrainToIdrx(address indexed user, uint256 brainAmount, uint256 idrxAmount);
    event RatesUpdated(uint256 ethToBrain, uint256 idrxToBrain, uint256 brainToIdrx);
    event FaucetAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event LiquidityAdded(address indexed token, uint256 amount);
    event IdrxTokenUpdated(address oldToken, address newToken);

    constructor(address _brainToken, address _idrxToken) Ownable(msg.sender) {
        require(_brainToken != address(0), "Invalid BRAIN address");
        require(_idrxToken != address(0), "Invalid IDRX address");
        brainToken = IERC20(_brainToken);
        idrxToken = IERC20(_idrxToken);
    }

    function claimFaucet() external nonReentrant {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(brainToken.balanceOf(address(this)) >= faucetAmount, "Faucet empty");

        hasClaimed[msg.sender] = true;
        totalClaims++;
        brainToken.safeTransfer(msg.sender, faucetAmount);

        emit FaucetClaimed(msg.sender, faucetAmount);
    }

    function hasClaimedFaucet(address user) external view returns (bool) {
        return hasClaimed[user];
    }

    function swapEthToBrain() external payable nonReentrant {
        require(msg.value > 0, "Send ETH to swap");
        
        uint256 brainAmount = (msg.value * ethToBrainRate) / 1e18;
        require(brainAmount > 0, "Amount too small");
        require(brainToken.balanceOf(address(this)) >= brainAmount, "Insufficient liquidity");

        totalSwaps++;
        totalEthSwapped += msg.value;
        brainToken.safeTransfer(msg.sender, brainAmount);

        emit SwapEthToBrain(msg.sender, msg.value, brainAmount);
    }

    function getEthToBrainQuote(uint256 ethAmount) external view returns (uint256) {
        return (ethAmount * ethToBrainRate) / 1e18;
    }

    function swapIdrxToBrain(uint256 idrxAmount) external nonReentrant {
        require(idrxAmount > 0, "Amount must be > 0");
        
        uint256 brainAmount = (idrxAmount * idrxToBrainRate) / 1e18;
        require(brainAmount > 0, "Amount too small");
        require(brainToken.balanceOf(address(this)) >= brainAmount, "Insufficient liquidity");

        idrxToken.safeTransferFrom(msg.sender, address(this), idrxAmount);
        
        totalSwaps++;
        totalIdrxSwapped += idrxAmount;
        brainToken.safeTransfer(msg.sender, brainAmount);

        emit SwapIdrxToBrain(msg.sender, idrxAmount, brainAmount);
    }

    function getIdrxToBrainQuote(uint256 idrxAmount) external view returns (uint256) {
        return (idrxAmount * idrxToBrainRate) / 1e18;
    }

    function swapBrainToIdrx(uint256 brainAmount) external nonReentrant {
        require(brainAmount > 0, "Amount must be > 0");
        
        uint256 idrxAmount = (brainAmount * brainToIdrxRate) / 1e18;
        require(idrxAmount > 0, "Amount too small");
        require(idrxToken.balanceOf(address(this)) >= idrxAmount, "Insufficient liquidity");

        brainToken.safeTransferFrom(msg.sender, address(this), brainAmount);
        
        totalSwaps++;
        totalBrainSwapped += brainAmount;
        idrxToken.safeTransfer(msg.sender, idrxAmount);

        emit SwapBrainToIdrx(msg.sender, brainAmount, idrxAmount);
    }

    function getBrainToIdrxQuote(uint256 brainAmount) external view returns (uint256) {
        return (brainAmount * brainToIdrxRate) / 1e18;
    }

    function getBrainBalance() external view returns (uint256) {
        return brainToken.balanceOf(address(this));
    }

    function getIdrxBalance() external view returns (uint256) {
        return idrxToken.balanceOf(address(this));
    }

    function getEthBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getStats() external view returns (
        uint256 _totalClaims,
        uint256 _totalSwaps,
        uint256 _totalEthSwapped,
        uint256 _totalIdrxSwapped,
        uint256 _totalBrainSwapped,
        uint256 _brainLiquidity,
        uint256 _idrxLiquidity,
        uint256 _ethBalance
    ) {
        return (
            totalClaims,
            totalSwaps,
            totalEthSwapped,
            totalIdrxSwapped,
            totalBrainSwapped,
            brainToken.balanceOf(address(this)),
            idrxToken.balanceOf(address(this)),
            address(this).balance
        );
    }

    function getRates() external view returns (
        uint256 _ethToBrain,
        uint256 _idrxToBrain,
        uint256 _brainToIdrx,
        uint256 _faucetAmount
    ) {
        return (ethToBrainRate, idrxToBrainRate, brainToIdrxRate, faucetAmount);
    }

    function setRates(uint256 _ethToBrain, uint256 _idrxToBrain, uint256 _brainToIdrx) external onlyOwner {
        require(_ethToBrain > 0 && _idrxToBrain > 0 && _brainToIdrx > 0, "Rates must be > 0");
        ethToBrainRate = _ethToBrain;
        idrxToBrainRate = _idrxToBrain;
        brainToIdrxRate = _brainToIdrx;
        emit RatesUpdated(_ethToBrain, _idrxToBrain, _brainToIdrx);
    }

    function setIdrxToken(address _newIdrxToken) external onlyOwner {
        require(_newIdrxToken != address(0), "Invalid address");
        address oldToken = address(idrxToken);
        idrxToken = IERC20(_newIdrxToken);
        emit IdrxTokenUpdated(oldToken, _newIdrxToken);
    }

    function setFaucetAmount(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be > 0");
        emit FaucetAmountUpdated(faucetAmount, _amount);
        faucetAmount = _amount;
    }

    function withdrawEth(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient ETH");
        payable(owner()).transfer(amount);
    }

    function withdrawBrain(uint256 amount) external onlyOwner {
        brainToken.safeTransfer(owner(), amount);
    }

    function withdrawIdrx(uint256 amount) external onlyOwner {
        idrxToken.safeTransfer(owner(), amount);
    }

    function emergencyWithdrawAll() external onlyOwner {
        uint256 brainBal = brainToken.balanceOf(address(this));
        uint256 idrxBal = idrxToken.balanceOf(address(this));
        uint256 ethBal = address(this).balance;
        
        if (brainBal > 0) brainToken.safeTransfer(owner(), brainBal);
        if (idrxBal > 0) idrxToken.safeTransfer(owner(), idrxBal);
        if (ethBal > 0) payable(owner()).transfer(ethBal);
    }

    receive() external payable {
        emit LiquidityAdded(address(0), msg.value);
    }
}
