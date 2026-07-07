/**
 * Vera — Agent Registration
 *
 * Agents self-register with Vera by submitting their identity
 * and capabilities. Vera cryptographically challenges them via
 * Ed25519 challenge-response to verify key ownership before
 * accepting the registration.
 *
 * This enables the Casper-native flow:
 *   MCP discovers → Vera registers → Vera challenges → Vera attests
 */
import type { AgentRecord } from './types';

/** In-memory agent store — seeded + custom registrations */
let customAgents: AgentRecord[] = [];

/** Seed agents are defined in discovery.ts */

export function getRegisteredAgents(): AgentRecord[] {
  return customAgents;
}

export function registerAgent(agent: AgentRecord): AgentRecord {
  const existing = customAgents.find((a) => a.agentId === agent.agentId);
  if (existing) {
    Object.assign(existing, agent, { registeredAt: existing.registeredAt });
    return existing;
  }
  customAgents.push(agent);
  return agent;
}

export function getCustomAgent(agentId: string): AgentRecord | null {
  return customAgents.find((a) => a.agentId === agentId) ?? null;
}

/** Merge seed + custom agents for discovery */
export function getAllAgents(seedAgents: AgentRecord[]): AgentRecord[] {
  const merged = [...seedAgents];
  for (const custom of customAgents) {
    const idx = merged.findIndex((s) => s.agentId === custom.agentId);
    if (idx >= 0) {
      merged[idx] = custom; // override seed with registered data
    } else {
      merged.push(custom);
    }
  }
  return merged;
}
