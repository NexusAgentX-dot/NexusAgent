// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentRegistry (ERC-8004 compatible)
 * @notice On-chain identity registry for NexusAgent AI agents.
 *         Each agent gets a permanent on-chain identity with a metadata URI.
 *         Inspired by ERC-8004 Agent Identity standard.
 */
contract AgentRegistry is Ownable {
    struct AgentIdentity {
        address wallet;
        string agentURI;    // data:application/json;base64,... or https://...
        string role;         // signal_fetcher, decision_engine, execution_engine, verification_engine
        bool active;
        uint256 registeredAt;
    }

    mapping(bytes32 => AgentIdentity) public agents;
    bytes32[] public agentIds;

    event AgentRegistered(bytes32 indexed agentId, address wallet, string role, string agentURI);
    event AgentDeactivated(bytes32 indexed agentId);
    event AgentURIUpdated(bytes32 indexed agentId, string newURI);

    constructor() Ownable(msg.sender) {}

    function registerAgent(
        bytes32 agentId,
        address wallet,
        string calldata role,
        string calldata agentURI
    ) external onlyOwner {
        require(agents[agentId].registeredAt == 0, "Agent already registered");
        require(wallet != address(0), "Invalid wallet");

        agents[agentId] = AgentIdentity({
            wallet: wallet,
            agentURI: agentURI,
            role: role,
            active: true,
            registeredAt: block.timestamp
        });

        agentIds.push(agentId);
        emit AgentRegistered(agentId, wallet, role, agentURI);
    }

    function deactivateAgent(bytes32 agentId) external onlyOwner {
        require(agents[agentId].registeredAt != 0, "Agent not found");
        agents[agentId].active = false;
        emit AgentDeactivated(agentId);
    }

    function updateAgentURI(bytes32 agentId, string calldata newURI) external onlyOwner {
        require(agents[agentId].registeredAt != 0, "Agent not found");
        agents[agentId].agentURI = newURI;
        emit AgentURIUpdated(agentId, newURI);
    }

    function getAgent(bytes32 agentId) external view returns (AgentIdentity memory) {
        require(agents[agentId].registeredAt != 0, "Agent not found");
        return agents[agentId];
    }

    function totalAgents() external view returns (uint256) {
        return agentIds.length;
    }

    function isActiveAgent(bytes32 agentId) external view returns (bool) {
        return agents[agentId].active;
    }
}
