/**
 * Registers Template API on globalThis so existing classic scripts keep working.
 * Loads after parser-blocking scripts above it; runs before deferred scripts below.
 */
import * as Template from './Template.mjs';

Object.assign(globalThis, Template);
