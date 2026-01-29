// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {QnAAsk} from "./QnAAsk.sol";
import {QnAAnswer} from "./QnAAnswer.sol";
import {QnAAdmin} from "./QnAAdmin.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract QnAWithBounty is QnAAsk, QnAAnswer, QnAAdmin, ReentrancyGuard {
    event QuestionAsked(
        uint256 indexed questionId,
        address indexed asker,
        uint256 bounty,
        string uri
    );

    constructor(address _owner) QnAAdmin(_owner) {}

    function askQuestion(
        address token,
        uint256 bounty,
        uint40 deadline,
        string calldata uri
    ) external payable whenNotPaused nonReentrant returns (uint256) {
        uint256 questionId = _askQuestion(token, bounty, deadline, uri);

        emit QuestionAsked(questionId, msg.sender, bounty, uri);

        return questionId;
    }

    function askQuestionOnBehalf(
        address asker,
        address token,
        uint256 bounty,
        uint40 deadline,
        string calldata uri
    ) external onlyOwner whenNotPaused nonReentrant returns (uint256) {
        require(asker != address(0), "Invalid asker");
        uint256 questionId = _askQuestionOnBehalf(asker, token, bounty, deadline, uri);

        emit QuestionAsked(questionId, asker, bounty, uri);

        return questionId;
    }

    function answerQuestion(
        uint256 questionId,
        string calldata uri
    ) external whenNotPaused {
        _postAnswer(questionId, uri);
    }

    function answerQuestionOnBehalf(
        address answerer,
        uint256 questionId,
        string calldata uri
    ) external onlyOwner whenNotPaused returns (uint256) {
        require(answerer != address(0), "Invalid answerer");
        return _postAnswerOnBehalf(answerer, questionId, uri);
    }

    function acceptAnswer(
        uint256 questionId,
        uint256 answerId
    ) external onlyAsker(questionId) nonReentrant {
        _acceptAnswer(questionId, answerId);
    }


    function acceptAnswerAsAdmin(
        uint256 questionId,
        uint256 answerId
    ) external onlyOwner nonReentrant {
        _acceptAnswer(questionId, answerId);
    }

    function bountyOf(uint256 questionId) external view returns (uint256) {
        require(questionId < questionCounter, "Question does not exist");
        return questions[questionId].bounty;
    }

    function addBounty(
        uint256 questionId,
        uint256 amount
    ) external payable nonReentrant {
        _addBounty(questionId, amount);
    }

    function addBountyOnBehalf(
        address funder,
        uint256 questionId,
        uint256 amount
    ) external onlyOwner whenNotPaused nonReentrant {
        require(funder != address(0), "Invalid funder");
        _addBountyOnBehalf(funder, questionId, amount);
    }

    function reduceBounty(
        uint256 questionId,
        uint256 newAmount
    ) external nonReentrant onlyAsker(questionId) {
        _reduceBounty(questionId, newAmount);
    }

    function reduceBountyAsAdmin(
        uint256 questionId,
        uint256 newAmount
    ) external onlyOwner nonReentrant {
        _reduceBounty(questionId, newAmount);
    }

    function refundExpired(
        uint256 questionId
    ) external onlyAsker(questionId) nonReentrant {
        _refundExpired(questionId);
    }

    function cancelQuestion(
        uint256 questionId
    ) external onlyAsker(questionId) nonReentrant {
        _cancelQuestion(questionId);
    }

    function cancelQuestionAsAdmin(
        uint256 questionId
    ) external onlyOwner nonReentrant {
        _cancelQuestion(questionId);
    }

    function getQuestion(uint256 id) external view returns (Question memory) {
        return questions[id];
    }

    function getAnswer(
        uint256 qid,
        uint256 aid
    ) external view returns (Answer memory) {
        return answers[qid][aid];
    }
}
