'use strict';

var index = require('./index-C87KoXER.js');
var appGlobals = require('./app-globals-V2Kpy_OQ.js');

const defineCustomElements = async (win, options) => {
  if (typeof window === 'undefined') return undefined;
  await appGlobals.globalScripts();
  return index.bootstrapLazy([["prx-bg-aurora.cjs",[[257,"prx-bg-aurora",{"colorStops":[16],"amplitude":[2],"blend":[2],"speed":[2],"time":[2]}]]]], options);
};

exports.setNonce = index.setNonce;
exports.defineCustomElements = defineCustomElements;
//# sourceMappingURL=loader.cjs.js.map
