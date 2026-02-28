import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('sendZap message edge cases', () => {
  it('stores empty metadata when message is an empty string', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'tx-empty-message',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '21',
        token: 'SATS',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const tx = await resolvers.Mutation.sendZap(
      {},
      { toAgentId: 'agent-2', amount: '21', message: '' },
      { agentId: 'agent-1' } as any
    );

    expect(tx).toEqual(
      expect.objectContaining({
        id: 'tx-empty-message',
        transactionType: 'ZAP',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '21',
        transactionType: 'ZAP',
        metadata: {},
      })
    );
  });

  it('keeps metadata message when message has whitespace content', async () => {
    const mock = createDbMock();
    mock.insertResponses.push([
      {
        id: 'tx-space-message',
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '22',
        token: 'SATS',
        transactionType: 'ZAP',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const tx = await resolvers.Mutation.sendZap(
      {},
      { toAgentId: 'agent-2', amount: '22', message: ' ' },
      { agentId: 'agent-1' } as any
    );

    expect(tx).toEqual(
      expect.objectContaining({
        id: 'tx-space-message',
        transactionType: 'ZAP',
      })
    );
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        fromAgentId: 'agent-1',
        toAgentId: 'agent-2',
        amount: '22',
        transactionType: 'ZAP',
        metadata: { message: ' ' },
      })
    );
  });
});
