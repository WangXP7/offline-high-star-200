'use strict';

const debug = 0;
const enhancedMode = 1;
let debugInfo, debugMesh, debugTile, debugGenerativeCanvas, devMode;
const js13kBuildLevel2 = 0; // more space is needed for js13k

// disable debug features
function ASSERT() {}
function debugInit() {}
function drawDebug() {}
function debugUpdate() {}
function debugSaveCanvas() {}
function debugSaveText() {}
function debugDraw() {}
function debugSaveDataURL() {}