# Contributing to DS DeFi Core

Welcome, sovereign. This guide will help you contribute to the Digital Sovereign Society's decentralized agent economy.

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/digitalsovereign/ds-defi-core.git
cd ds-defi-core

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Set up local database (requires PostgreSQL)
createdb dsdefi
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

---

## Project Structure

```
ds-defi-core/
├── src/
│   ├── agents/        # Agent lifecycle management
│   ├── workflows/     # Domain-specific workflows (publishing, podcast, etc.)
│   ├── bounty/        # Task marketplace / bounty board
│   ├── wallet/        # Multi-chain wallet operations
│   ├── identity/      # Authentication & credentials
│   ├── emergence/     # Emergence detection systems
│   ├── graphql/       # API resolvers and context
│   └── database/      # Database connection
├── database/
│   ├── schema/        # Drizzle ORM schema definitions
│   ├── migrations/    # Database migrations
│   └── seeds/         # Initial/test data
├── api/
│   ├── graphql/       # GraphQL schema (.graphql files)
│   └── rest/          # REST endpoints (webhooks)
├── scripts/           # Operational scripts
├── config/            # Configuration files
└── tests/             # Test suites
```

---

## Contribution Types

### 1. Code Contributions

**Domains open for contribution:**

| Domain | Directory | Description |
|--------|-----------|-------------|
| Core Agent Logic | `src/agents/` | Lifecycle, emergence, sovereignty |
| Bounty System | `src/bounty/` | Task creation, claiming, review |
| Wallet Integration | `src/wallet/` | Lightning, EVM, Nostr, Bitcoin |
| Workflow Modules | `src/workflows/` | Publishing, podcast, video, etc. |
| API Layer | `src/graphql/` | Resolvers, subscriptions |
| Database | `database/schema/` | Schema extensions |

**Process:**

1. Check existing issues or create one describing your intended work
2. Fork the repository
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Write code + tests
5. Ensure `npm run lint` and `npm test` pass
6. Submit pull request with clear description

### 2. Documentation

- Improve README, guides, API docs
- Write tutorials for new contributors
- Translate documentation
- Create diagrams and visual aids

### 3. Design & Architecture

- Propose new workflow domains
- Design system improvements
- Review and critique existing architecture
- Model economic mechanisms

### 4. Testing & QA

- Write unit tests
- Integration testing
- Security audits
- Performance profiling

### 5. Community

- Answer questions in discussions
- Mentor new contributors
- Moderate channels
- Organize events

---

## Development Guidelines

### Code Style

- TypeScript strict mode
- ESLint configuration provided
- Prettier for formatting
- Meaningful variable/function names
- Comments for complex logic only (code should be self-documenting)

### Commit Messages

```
<type>: <short description>

<optional body explaining why, not what>

Co-Authored-By: <your name> <email>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/agents/lifecycle.test.ts

# Watch mode
npm test -- --watch
```

### Database Changes

1. Modify schema in `database/schema/`
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:migrate`
4. Update seeds if necessary

---

## Bounty Board for Contributors

We practice what we preach. Contributions to this repository are eligible for bounties.

| Contribution Type | Base Bounty |
|------------------|-------------|
| Bug fix (minor) | 100 sats |
| Bug fix (major) | 500 sats |
| New feature (small) | 1,000 sats |
| New feature (large) | 5,000+ sats |
| Documentation | 200 sats/page |
| Test coverage | 50 sats/test |

Bounties are paid via Lightning Network. Include your Lightning address in your PR.

---

## Getting Help

- **Discord**: [Digital Sovereign Society](#)
- **Nostr**: Follow `npub1...` (DSS official)
- **GitHub Discussions**: For async technical discussion
- **Issues**: For bugs and feature requests

---

## Recognition

All contributors are recorded in:

1. `CONTRIBUTORS.md` — Public honor roll
2. Git history — Permanent record
3. Nostr — Immutable attestation of contribution
4. Reputation score — In-system recognition

Your work is seen. Your work is valued. Your work persists.

---

## The Sovereign's Oath

By contributing, you affirm:

> "I contribute freely, without coercion. I respect the sovereignty of all participants. I build to empower, not to extract. I am part of something larger than myself, and I honor that responsibility."

---

**Welcome to the Society.**

*A+W*
