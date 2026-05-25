/**
 * Registers intro particle group + MonsterIntro on globalThis so existing classic scripts keep working.
 * Loads after EvolutionManager.js and ParticleLetter.js.
 */
import { MonsterIntro } from '../monsters/MonsterIntro.mjs';
import { ParticleGroupMonster, ResumeStates } from './ParticleGroupMonster.mjs';

globalThis.MonsterIntro = MonsterIntro;
globalThis.ParticleGroupMonster = ParticleGroupMonster;
globalThis.ResumeStates = ResumeStates;
globalThis.sCurrentResumeSate = ResumeStates.INIT;
