import { b as bootstrapLazy } from './index-C0pqcqYG.js';
export { s as setNonce } from './index-C0pqcqYG.js';
import { g as globalScripts } from './app-globals-DQuL1Twl.js';

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await globalScripts();
  return bootstrapLazy([["prx-bg-aurora",[[257,"prx-bg-aurora",{"colorStops":[16],"amplitude":[2],"blend":[2],"speed":[2],"time":[2]}]]]], options);
};

export { defineCustomElements };
//# sourceMappingURL=loader.js.map
