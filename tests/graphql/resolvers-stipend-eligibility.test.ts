import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('distributeStipends eligibility filtering', () => {
  it('skips non-numeric and non-positive stipend values', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      { id: 'agent-negative', currentStipend: '-10' },
      { id: 'agent-zero', currentStipend: '0' },
      { id: 'agent-text', currentStipend: 'not-a-number' },
      { id: 'agent-empty', currentStipend: '' },
      { id: 'agent-valid', currentStipend: '12.5' },
    ]);

    const resolvers = createResolvers(mock.db);
    const count = await resolvers.Mutation.distributeStipends();

    expect(count).toBe(1);
    expect(mock.insertValues).toHaveLength(1);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        toAgentId: 'agent-valid',
        amount: '12.5',
        token: 'SATS',
        transactionType: 'STIPEND',
        status: 'PENDING',
      })
    );
  });

  it('handles numeric stipend strings with surrounding whitespace', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'agent-spaced', currentStipend: ' 7.25 ' }]);

    const resolvers = createResolvers(mock.db);
    const count = await resolvers.Mutation.distributeStipends();

    expect(count).toBe(1);
    expect(mock.insertValues).toHaveLength(1);
    expect(mock.insertValues[0]).toEqual(
      expect.objectContaining({
        toAgentId: 'agent-spaced',
        amount: ' 7.25 ',
        transactionType: 'STIPEND',
      })
    );
  });
});
