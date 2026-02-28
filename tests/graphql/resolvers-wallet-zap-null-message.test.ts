import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('sendZap null message handling', () => {
  it('normalizes explicit null message to empty metadata', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'tx-null-message',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '11',
        token: 'SATS',
        transactionType: 'ZAP',
        status: 'PENDING',
        metadata: {},
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const tx = await resolvers.Mutation.sendZap(
      {},
      { toAgentId: 'agent-2', amount: '11', message: null } as any,
      { agentId: 'agent-1' } as any
    );

    expect(tx).toEqual(
      expect.objectContaining({
        id: 'tx-null-message',
        metadata: {},
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '11',
        token: 'SATS',
        transactionType: 'ZAP',
        status: 'PENDING',
        metadata: {},
      })
    );
  });
});
