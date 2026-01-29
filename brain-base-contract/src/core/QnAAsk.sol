// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {QnAStorage} from "./QnAStorage.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

abstract contract QnAAsk is QnAStorage {
    using SafeERC20 for IERC20;

    event QuestionAsked(
        uint256 indexed questionId,
        address indexed asker,
        address indexed token,
        uint256 bounty,
        uint40 deadline,
        string uri
    );
    event BountyAdded(
        uint256 indexed questionId,
        uint256 amount,
        address token
    );
    event BountyRefunded(
        uint256 indexed questionId,
        address indexed to,
        uint256 amount,
        address token
    );
    event BountyReduced(
        uint256 indexed questionId,
        address indexed asker,
        uint256 oldBounty,
        uint256 newBounty,
        uint256 refund
    );
    event QuestionCancelled(uint256 indexed questionId, address indexed by);

    modifier onlyAsker(uint256 questionId) {
        require(msg.sender == questions[questionId].asker, "Not asker");
        _;
    }

    function _askQuestion(
        address token,
        uint256 bounty,
        uint40 deadline,
        string calldata uri
    ) internal returns (uint256 questionId) {
        require(
            deadline >= block.timestamp + MIN_DEADLINE_DELAY,
            "Deadline too soon"
        );
        questionId = ++questionCounter;

        if (token == address(0)) {
            require(msg.value == bounty, "Bad msg.value");
        } else {
            require(msg.value == 0, "No native with ERC20");
            if (bounty > 0) {
                IERC20(token).safeTransferFrom(
                    msg.sender,
                    address(this),
                    bounty
                );
            }
        }

        Question storage q = questions[questionId];
        q.asker = msg.sender;
        q.token = token;
        q.bounty = bounty;
        q.createdAt = uint40(block.timestamp);
        q.deadline = deadline;
        q.status = QuestionStatus.Open;
        q.uri = uri;

        questionsAsked[msg.sender] += 1;

        emit QuestionAsked(
            questionId,
            msg.sender,
            token,
            bounty,
            deadline,
            uri
        );
    }
    function _askQuestionOnBehalf(
        address asker,
        address token,
        uint256 bounty,
        uint40 deadline,
        string calldata uri
    ) internal returns (uint256 questionId) {
        require(
            deadline >= block.timestamp + MIN_DEADLINE_DELAY,
            "Deadline too soon"
        );
        require(token != address(0), "Only ERC20 tokens for onBehalf");
        
        questionId = ++questionCounter;

        if (bounty > 0) {
            IERC20(token).safeTransferFrom(
                asker,
                address(this),
                bounty
            );
        }

        Question storage q = questions[questionId];
        q.asker = asker;
        q.token = token;
        q.bounty = bounty;
        q.createdAt = uint40(block.timestamp);
        q.deadline = deadline;
        q.status = QuestionStatus.Open;
        q.uri = uri;

        questionsAsked[asker] += 1;

        emit QuestionAsked(
            questionId,
            asker,
            token,
            bounty,
            deadline,
            uri
        );
    }

    function _addBounty(uint256 questionId, uint256 amount) internal {
        require(amount > 0, "No amount");
        Question storage q = questions[questionId];
        require(q.status == QuestionStatus.Open, "Not open");
        address token = q.token;

        if (token == address(0)) {
            require(msg.value == amount, "Bad msg.value");
        } else {
            require(msg.value == 0, "No native with ERC20");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        }

        q.bounty += amount;
        emit BountyAdded(questionId, amount, token);
    }

    function _addBountyOnBehalf(
        address funder,
        uint256 questionId,
        uint256 amount
    ) internal {
        require(amount > 0, "No amount");
        Question storage q = questions[questionId];
        require(q.status == QuestionStatus.Open, "Not open");
        require(q.token != address(0), "Only ERC20 tokens for onBehalf");

        IERC20(q.token).safeTransferFrom(funder, address(this), amount);

        q.bounty += amount;
        emit BountyAdded(questionId, amount, q.token);
    }

    function _reduceBounty(uint256 questionId, uint256 newAmount) internal {
        Question storage q = questions[questionId];
        require(q.status == QuestionStatus.Open, "Question not open");
        require(newAmount < q.bounty, "New bounty must be lower");

        uint256 refund = q.bounty - newAmount;
        address token = q.token;

        if (token == address(0)) {
            (bool success, ) = payable(q.asker).call{value: refund}("");
            require(success, "Refund failed");
        } else {
            IERC20(token).safeTransfer(q.asker, refund);
        }

        uint256 oldBounty = q.bounty;
        q.bounty = newAmount;

        emit BountyReduced(
            questionId,
            q.asker,
            oldBounty,
            newAmount,
            refund
        );
    }

    function _refundExpired(uint256 questionId) internal {
        Question storage q = questions[questionId];
        require(q.status == QuestionStatus.Open, "Not open");
        require(block.timestamp >= q.deadline, "Not expired");
        require(!q.refunded, "Already refunded");

        q.status = QuestionStatus.Expired;
        q.refunded = true;

        uint256 amount = q.bounty;
        q.bounty = 0;
        address token = q.token;

        // Refund the bounty
        if (amount > 0) {
            if (token == address(0)) {
                (bool ok, ) = q.asker.call{value: amount}("");
                require(ok, "Native refund failed");
            } else {
                IERC20(token).safeTransfer(q.asker, amount);
            }
            emit BountyRefunded(questionId, q.asker, amount, token);
        }
    }

    function _cancelQuestion(uint256 questionId) internal {
        Question storage q = questions[questionId];

        require(q.status == QuestionStatus.Open, "Not open");
        require(q.acceptedAnswerId == 0, "Already accepted");

        q.status = QuestionStatus.Cancelled;

        uint256 amount = q.bounty;
        q.bounty = 0;
        address token = q.token;

        if (amount > 0) {
            if (token == address(0)) {
                (bool ok, ) = q.asker.call{value: amount}("");
                require(ok, "Native refund failed");
            } else {
                IERC20(token).safeTransfer(q.asker, amount);
            }
            emit BountyRefunded(questionId, q.asker, amount, token);
        }
        emit QuestionCancelled(questionId, msg.sender);
    }
}
