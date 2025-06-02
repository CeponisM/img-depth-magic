export const initialConfig = {
  height: 1.0,
  static: 0,
  focus: 10,
  focusCenterX: 0,
  focusCenterY: 0,
  zoom: 0.5,
  isometric: 0,
  dolly: 0,
  invert: 0.39,
  depthHeight: 0.35,
  depthStatic: 0,
  depthFocus: 10,
  depthZoom: 1.0,
  depthIsometric: 0,
  depthDolly: 0,
  depthInvert: 0.39,
  depthCenterX: 0.5,
  depthCenterY: 0.5,
  depthOriginX: 0.5,
  depthOriginY: 0.5,
  quality: 100,
  dofEnable: 0,
  dofIntensity: 0.1,
  dofStart: 0,
  dofEnd: 1,
  dofExponent: 1,
  dofDirections: 8,
  dofQuality: 4,
  vignetteEnable: 0,
  vignetteIntensity: 1,
  vignetteDecay: 1.5,
  depthOffsetX: 0,
  depthOffsetY: 0,
  depthMirror: 0,
  aspectRatio: 1,
  viewDepthMap: 0,
  depthMapOpacity: 1,
};

export const configReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return { ...state, ...action.payload };
    case 'RESET_CONFIG':
      return initialConfig;
    default:
      return state;
  }
};