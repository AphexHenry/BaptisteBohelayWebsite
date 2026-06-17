/**
 * Registers intro particle group + MonsterIntro on globalThis so existing classic scripts keep working.
 * Loads after EvolutionManager.js.
 */
import { MonsterIntro } from '../monsters/MonsterIntro.mjs';
import { ParticleGroupIntro, ResumeStates } from './ParticleGroupIntro.mjs';

globalThis.MonsterIntro = MonsterIntro;
globalThis.ParticleGroupIntro = ParticleGroupIntro;
globalThis.ResumeStates = ResumeStates;
globalThis.sCurrentResumeSate = ResumeStates.INIT;
