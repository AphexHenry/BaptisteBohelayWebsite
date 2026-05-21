/**
 * Registers ParticleSound API on globalThis so existing classic scripts keep working.
 * Loads after parser-blocking scripts above it; runs before deferred scripts below.
 */
import { ParticleSound, getParticleSoundState } from './ParticleSound.mjs';

globalThis.ParticleSound = ParticleSound;
Object.assign(globalThis, getParticleSoundState());
