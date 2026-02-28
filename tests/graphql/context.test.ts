import { beforeEach, describe, expect, it, vi } from 'vitest';

const fakeDb = { name: 'mock-db' } as const;

vi.mock('../../src/database/connection.js', () => ({
  db: fakeDb,
}));

import { createContext } from '../../src/graphql/context.js';

describe('createContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns context with db and no agent when auth header is missing', async () => {
    const context = await createContext({
      request: { headers: {} } as any,
      reply: {} as any,
    });

    expect(context.db).toBe(fakeDb);
    expect(context.agentId).toBeUndefined();
  });

  it('extracts agentId from Bearer token header', async () => {
    const context = await createContext({
      request: { headers: { authorization: 'Bearer agent-123' } } as any,
      reply: {} as any,
    });

    expect(context.agentId).toBe('agent-123');
    expect(context.db).toBe(fakeDb);
  });

  it('ignores non-Bearer authorization headers', async () => {
    const context = await createContext({
      request: { headers: { authorization: 'Basic abc123' } } as any,
      reply: {} as any,
    });

    expect(context.agentId).toBeUndefined();
  });
});
