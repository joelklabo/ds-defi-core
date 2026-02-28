import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('Query.agents resolver', () => {
  it('uses default pagination and no filters when optional args are omitted', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-1',
        displayName: 'Agent One',
        level: 'L1_WORKER',
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents({}, {} as any);

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-1',
        displayName: 'Agent One',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(undefined);
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('applies all filters and custom pagination when provided', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([
      {
        id: 'agent-2',
        displayName: 'Agent Two',
        level: 'L2_SPECIALIST',
        agentType: 'HUMAN',
        isSovereign: true,
      },
    ]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents(
      {},
      {
        level: 'L2_SPECIALIST',
        type: 'HUMAN',
        isSovereign: true,
        limit: 5,
        offset: 10,
      }
    );

    expect(result).toEqual([
      expect.objectContaining({
        id: 'agent-2',
        level: 'L2_SPECIALIST',
      }),
    ]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(chain.offset).toHaveBeenCalledWith(10);
    expect(chain.orderBy).toHaveBeenCalledTimes(1);
  });

  it('retains false-valued isSovereign filter instead of treating it as missing', async () => {
    const mock = createDbMock();
    mock.selectResponses.push([{ id: 'agent-3', isSovereign: false }]);

    const resolvers = createResolvers(mock.db);
    const result = await resolvers.Query.agents({}, { isSovereign: false } as any);

    expect(result).toEqual([expect.objectContaining({ id: 'agent-3', isSovereign: false })]);

    const chain = mock.db.select.mock.results[0].value;
    expect(chain.where).toHaveBeenCalledWith(expect.anything());
    expect(chain.limit).toHaveBeenCalledWith(50);
    expect(chain.offset).toHaveBeenCalledWith(0);
  });
});
