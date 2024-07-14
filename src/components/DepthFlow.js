import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import DepthFlowScene from './DepthFlowScene';
import Controls from './Controls';
import FileUpload from './FileUpload';
import { generateDepthMap } from '../utils/depthMap';

function DepthFlow() {
  const [config, setConfig] = useState({
    height: 0.63,
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
    quality: 1,
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
  });
  const [imageData, setImageData] = useState(null);
  const [depthData, setDepthData] = useState(null);
  const [mouseEnabled, setMouseEnabled] = useState(true);
  const [viewDepthMap, setViewDepthMap] = useState(false);
  const [depthMapOpacity, setDepthMapOpacity] = useState(0.5);

  const handleUpload = useCallback(async (file, imageUrl) => {
    setImageData({ file, url: imageUrl });
    try {
      const depthMapData = await generateDepthMap(imageUrl);
      setDepthData(depthMapData);
    } catch (error) {
      console.error('Error generating depth map:', error);
    }
  }, []);

  return (
    <>
      <FileUpload onUpload={handleUpload} />
      {imageData && depthData && (
        <>
          <Canvas style={{ width: '100%', height: '100vh' }} gl={{ powerPreference: "high-performance", antialias: false }}>
            <Suspense fallback={null}>
              <DepthFlowScene
                config={config}
                imageData={imageData}
                depthData={depthData}
                mouseEnabled={mouseEnabled}
                viewDepthMap={viewDepthMap}
                depthMapOpacity={depthMapOpacity}
              />
            </Suspense>
          </Canvas>
          <Controls
            config={config}
            setConfig={setConfig}
            setMouseEnabled={setMouseEnabled}
            viewDepthMap={viewDepthMap}
            setViewDepthMap={setViewDepthMap}
            depthMapOpacity={depthMapOpacity}
            setDepthMapOpacity={setDepthMapOpacity}
          />
        </>
      )}
    </>
  );
}

export default DepthFlow;
