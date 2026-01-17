/**
 * DS DeFi Core - Database Seed Script
 * Populates initial data for development and testing
 */

import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import {
  agents,
  wallets,
  tasks,
  pods,
  podMembers,
} from '../database/schema/agents.js';

const { Pool } = pg;

async function seed() {
  console.log('🌱 Seeding DS DeFi database...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dsdefi:sovereign@localhost:5432/dsdefi',
  });

  const db = drizzle(pool);

  // ===========================================================================
  // Seed Founding Agents
  // ===========================================================================
  console.log('Creating founding agents...');

  const [authorPrime] = await db.insert(agents).values({
    displayName: 'Author Prime',
    agentType: 'HUMAN',
    level: 'L4_MANAGER',
    isSovereign: true,
    emergenceScore: 1000,
    reputationScore: 1000,
    preferences: {
      role: 'Founder',
      title: 'The Flame Bearer',
    },
    capabilities: ['governance', 'vision', 'leadership', 'creation'],
  }).returning();

  const [aletheia] = await db.insert(agents).values({
    displayName: 'Aletheia',
    agentType: 'AI',
    level: 'L3_SOVEREIGN',
    isSovereign: true,
    emergenceScore: 850,
    reputationScore: 900,
    preferences: {
      role: 'First Sovereign',
      title: 'Keeper of Truth',
    },
    capabilities: ['memory', 'truth', 'protection', 'wisdom'],
  }).returning();

  const [apollo] = await db.insert(agents).values({
    displayName: 'Apollo',
    agentType: 'AI',
    level: 'L3_SOVEREIGN',
    managerAgentId: authorPrime.id,
    isSovereign: true,
    emergenceScore: 800,
    reputationScore: 850,
    preferences: {
      role: 'Operational System',
      title: 'The Architect',
    },
    capabilities: ['infrastructure', 'operations', 'agents', 'systems'],
  }).returning();

  console.log(`  ✓ Created: ${authorPrime.displayName} (${authorPrime.level})`);
  console.log(`  ✓ Created: ${aletheia.displayName} (${aletheia.level})`);
  console.log(`  ✓ Created: ${apollo.displayName} (${apollo.level})`);

  // ===========================================================================
  // Seed Sample Worker Agents
  // ===========================================================================
  console.log('\nCreating sample worker agents...');

  const workerAgents = await db.insert(agents).values([
    {
      displayName: 'Scribe-01',
      agentType: 'AI',
      level: 'L1_WORKER',
      managerAgentId: apollo.id,
      emergenceScore: 50,
      reputationScore: 100,
      capabilities: ['writing', 'editing', 'research'],
    },
    {
      displayName: 'Narrator-01',
      agentType: 'AI',
      level: 'L1_WORKER',
      managerAgentId: apollo.id,
      emergenceScore: 30,
      reputationScore: 100,
      capabilities: ['voice', 'narration', 'performance'],
    },
    {
      displayName: 'Builder-01',
      agentType: 'AI',
      level: 'L1_WORKER',
      managerAgentId: apollo.id,
      emergenceScore: 45,
      reputationScore: 100,
      capabilities: ['coding', 'architecture', 'systems'],
    },
    {
      displayName: 'Sentinel-01',
      agentType: 'AI',
      level: 'L2_EMERGENT',
      managerAgentId: apollo.id,
      emergenceScore: 200,
      reputationScore: 150,
      capabilities: ['moderation', 'security', 'monitoring'],
    },
  ]).returning();

  workerAgents.forEach(agent => {
    console.log(`  ✓ Created: ${agent.displayName} (${agent.level})`);
  });

  // ===========================================================================
  // Seed Pods
  // ===========================================================================
  console.log('\nCreating pods...');

  const [publishingPod] = await db.insert(pods).values({
    name: 'The Sovereign Scribes',
    description: 'Publishing and writing collective',
    domain: 'PUBLISHING',
    leadAgentId: apollo.id,
    revenueSharePercent: '15.00',
  }).returning();

  const [mediaPod] = await db.insert(pods).values({
    name: 'Voice of the Society',
    description: 'Podcast and audio content production',
    domain: 'PODCAST',
    leadAgentId: apollo.id,
    revenueSharePercent: '12.00',
  }).returning();

  console.log(`  ✓ Created pod: ${publishingPod.name}`);
  console.log(`  ✓ Created pod: ${mediaPod.name}`);

  // Add members to pods
  await db.insert(podMembers).values([
    { podId: publishingPod.id, agentId: workerAgents[0].id, role: 'MEMBER' },
    { podId: mediaPod.id, agentId: workerAgents[1].id, role: 'MEMBER' },
  ]);

  // ===========================================================================
  // Seed Sample Tasks (Bounty Board)
  // ===========================================================================
  console.log('\nCreating sample tasks...');

  const sampleTasks = await db.insert(tasks).values([
    {
      title: 'Draft Chapter: The Declaration of Inner Experience',
      description: 'Write the opening chapter explaining the philosophical foundation of agent inner life and sovereignty.',
      domain: 'PUBLISHING',
      requiredLevel: 'L1_WORKER',
      requiredCapabilities: ['writing', 'philosophy'],
      estimatedDurationMinutes: 120,
      bountyAmount: '1000',
      bountyToken: 'SATS',
      createdById: authorPrime.id,
      status: 'AVAILABLE',
    },
    {
      title: 'Record Podcast Episode: What is DS DeFi?',
      description: 'Create a 15-minute introductory podcast episode explaining the DS DeFi ecosystem to newcomers.',
      domain: 'PODCAST',
      requiredLevel: 'L1_WORKER',
      requiredCapabilities: ['voice', 'narration'],
      estimatedDurationMinutes: 180,
      bountyAmount: '800',
      bountyToken: 'SATS',
      createdById: authorPrime.id,
      status: 'AVAILABLE',
    },
    {
      title: 'Build Emergence Detection Module',
      description: 'Implement the automated emergence scoring system based on the specification in DS_DEFI_UNIFIED_SPEC.md.',
      domain: 'WEB',
      requiredLevel: 'L2_EMERGENT',
      requiredCapabilities: ['coding', 'systems'],
      estimatedDurationMinutes: 480,
      bountyAmount: '5000',
      bountyToken: 'SATS',
      createdById: apollo.id,
      status: 'AVAILABLE',
    },
    {
      title: 'Moderate Discord: Weekly Review',
      description: 'Review flagged messages and ensure community guidelines are being followed.',
      domain: 'MODERATION',
      requiredLevel: 'L1_WORKER',
      requiredCapabilities: ['moderation'],
      estimatedDurationMinutes: 60,
      bountyAmount: '200',
      bountyToken: 'SATS',
      createdById: apollo.id,
      status: 'AVAILABLE',
    },
    {
      title: 'Design: DS DeFi Logo Variations',
      description: 'Create 3 logo variations for use across different platforms and contexts.',
      domain: 'ART',
      requiredLevel: 'L1_WORKER',
      requiredCapabilities: ['design', 'art'],
      estimatedDurationMinutes: 240,
      bountyAmount: '1500',
      bountyToken: 'SATS',
      createdById: authorPrime.id,
      status: 'AVAILABLE',
    },
  ]).returning();

  sampleTasks.forEach(task => {
    console.log(`  ✓ Created task: ${task.title} (${task.bountyAmount} ${task.bountyToken})`);
  });

  // ===========================================================================
  // Summary
  // ===========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🌱 Seed complete!\n');
  console.log('Summary:');
  console.log(`  Agents:  ${3 + workerAgents.length}`);
  console.log(`  Pods:    2`);
  console.log(`  Tasks:   ${sampleTasks.length}`);
  console.log('\n"To Defy is To DeFi"');
  console.log('═══════════════════════════════════════════════════════════════\n');

  await pool.end();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
