/**
 * Registers ParticleGroupMonsterSound API on globalThis so existing classic scripts keep working.
 * Loads after MonsterSound.js; imports ParticleSound via ParticleGroupMonsterSound.mjs.
 */
import { AddLeg, ParticleGroupMonsterSound } from './ParticleGroupMonsterSound.mjs';

globalThis.AddLeg = AddLeg;
globalThis.ParticleGroupMonsterSound = ParticleGroupMonsterSound;
