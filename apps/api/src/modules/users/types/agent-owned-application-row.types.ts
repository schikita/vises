/** Raw join row: application owned by an agent via `Client.agentId`. */
export type AgentOwnedApplicationRow = {
  id: string;
  agentId: string;
  updatedAt: Date | string;
  createdAt: Date | string;
};
