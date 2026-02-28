import { describe, expect, it } from 'vitest';
import { createResolvers } from '../../src/graphql/resolvers.js';
import { createDbMock } from '../utils/mock-db.js';

describe('wallet and pod mutation auth guards', () => {
  it('rejects addWallet without an authenticated agent', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.addWallet(
        {},
        { input: { chain: 'bitcoin', address: 'bc1qunauthorized' } },
        {} as any
      )
    ).rejects.toThrow('Unauthorized');
  });

  it('rejects createPod without an authenticated agent', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(
      resolvers.Mutation.createPod({}, { input: { name: 'NoAuth Pod' } }, {} as any)
    ).rejects.toThrow('Unauthorized');
  });

  it('rejects joinPod and leavePod without an authenticated agent', async () => {
    const mock = createDbMock();
    const resolvers = createResolvers(mock.db);

    await expect(resolvers.Mutation.joinPod({}, { podId: 'pod-1' }, {} as any)).rejects.toThrow(
      'Unauthorized'
    );
    await expect(resolvers.Mutation.leavePod({}, { podId: 'pod-1' }, {} as any)).rejects.toThrow(
      'Unauthorized'
    );
  });
});
