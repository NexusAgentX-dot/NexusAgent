// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentEscrow (ERC-8183 compatible)
 * @notice Agentic commerce escrow for NexusAgent workflows.
 *         Implements a minimal Job lifecycle: create → fund → submit → complete/reject.
 *         Inspired by ERC-8183 AgenticCommerce standard.
 */
contract AgentEscrow is Ownable {
    using SafeERC20 for IERC20;

    enum JobStatus { Created, Funded, Submitted, Completed, Rejected, Refunded }

    struct Job {
        bytes32 jobId;
        address client;       // who funded the job
        address agent;        // who performs the work
        address token;        // ERC-20 payment token
        uint256 amount;       // escrowed amount
        JobStatus status;
        string intentHash;    // hash of workflow intent
        uint256 createdAt;
        uint256 completedAt;
    }

    mapping(bytes32 => Job) public jobs;
    bytes32[] public jobIds;

    event JobCreated(bytes32 indexed jobId, address client, address agent, address token, uint256 amount);
    event JobFunded(bytes32 indexed jobId, uint256 amount);
    event JobSubmitted(bytes32 indexed jobId);
    event JobCompleted(bytes32 indexed jobId, uint256 paidAmount);
    event JobRejected(bytes32 indexed jobId);
    event JobRefunded(bytes32 indexed jobId, uint256 refundAmount);

    constructor() Ownable(msg.sender) {}

    function createJob(
        bytes32 jobId,
        address agent,
        address token,
        uint256 amount,
        string calldata intentHash
    ) external {
        require(jobs[jobId].createdAt == 0, "Job already exists");
        require(agent != address(0), "Invalid agent");
        require(token != address(0), "Invalid token");
        require(amount > 0, "Amount must be > 0");

        jobs[jobId] = Job({
            jobId: jobId,
            client: msg.sender,
            agent: agent,
            token: token,
            amount: amount,
            status: JobStatus.Created,
            intentHash: intentHash,
            createdAt: block.timestamp,
            completedAt: 0
        });

        jobIds.push(jobId);
        emit JobCreated(jobId, msg.sender, agent, token, amount);
    }

    function fundJob(bytes32 jobId) external {
        Job storage job = jobs[jobId];
        require(job.createdAt != 0, "Job not found");
        require(job.status == JobStatus.Created, "Job not in Created status");
        require(msg.sender == job.client, "Only client can fund");

        IERC20(job.token).safeTransferFrom(msg.sender, address(this), job.amount);
        job.status = JobStatus.Funded;

        emit JobFunded(jobId, job.amount);
    }

    function submitJob(bytes32 jobId) external {
        Job storage job = jobs[jobId];
        require(job.createdAt != 0, "Job not found");
        require(job.status == JobStatus.Funded, "Job not funded");
        require(msg.sender == job.agent, "Only agent can submit");

        job.status = JobStatus.Submitted;
        emit JobSubmitted(jobId);
    }

    function completeJob(bytes32 jobId) external onlyOwner {
        Job storage job = jobs[jobId];
        require(job.createdAt != 0, "Job not found");
        require(job.status == JobStatus.Submitted, "Job not submitted");

        job.status = JobStatus.Completed;
        job.completedAt = block.timestamp;

        // Release escrowed funds to agent
        IERC20(job.token).safeTransfer(job.agent, job.amount);

        emit JobCompleted(jobId, job.amount);
    }

    function rejectJob(bytes32 jobId) external onlyOwner {
        Job storage job = jobs[jobId];
        require(job.createdAt != 0, "Job not found");
        require(
            job.status == JobStatus.Submitted || job.status == JobStatus.Funded,
            "Job cannot be rejected"
        );

        job.status = JobStatus.Rejected;

        // Refund to client if funded
        if (job.amount > 0) {
            IERC20(job.token).safeTransfer(job.client, job.amount);
            emit JobRefunded(jobId, job.amount);
        }

        emit JobRejected(jobId);
    }

    function getJob(bytes32 jobId) external view returns (Job memory) {
        require(jobs[jobId].createdAt != 0, "Job not found");
        return jobs[jobId];
    }

    function totalJobs() external view returns (uint256) {
        return jobIds.length;
    }
}
