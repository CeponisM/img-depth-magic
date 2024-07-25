import React, { useState, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import styled, { keyframes } from 'styled-components';
import DepthFlowScene from './DepthFlowScene';
import Controls from './Controls';
import FileUpload from './FileUpload';
import { generateDepthMap } from '../utils/depthMap';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const DepthFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
`;

const StyledCanvas = styled(Canvas)`
  width: 100%;
  height: 100%;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 1.5rem;
  z-index: 10;
`;

const ControlsContainer = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

function DepthFlow() {
  const [config, setConfig] = useState({
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
  });
  const [imageData, setImageData] = useState(null);
  const [depthData, setDepthData] = useState(null);
  const [mouseEnabled, setMouseEnabled] = useState(true);
  const [viewDepthMap, setViewDepthMap] = useState(false);
  const [depthMapOpacity, setDepthMapOpacity] = useState(0.5);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = useCallback(async (file, imageUrl) => {
    setIsLoading(true);
    setImageData({ file, url: imageUrl });
    try {
      const depthMapData = await generateDepthMap(imageUrl);
      setDepthData(depthMapData);
    } catch (error) {
      console.error('Error generating depth map:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <DepthFlowContainer>
      <FileUpload onUpload={handleUpload} />
      {imageData && depthData && (
        <CanvasContainer>
          <StyledCanvas gl={{ powerPreference: "high-performance", antialias: true }}>
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
          </StyledCanvas>
          <ControlsContainer>
            <Controls
              config={config}
              setConfig={setConfig}
              setMouseEnabled={setMouseEnabled}
              viewDepthMap={viewDepthMap}
              setViewDepthMap={setViewDepthMap}
              depthMapOpacity={depthMapOpacity}
              setDepthMapOpacity={setDepthMapOpacity}
            />
          </ControlsContainer>
        </CanvasContainer>
      )}
      {isLoading && (
        <LoadingOverlay>
          Generating depth map...
        </LoadingOverlay>
      )}
    </DepthFlowContainer>
  );
}

export default DepthFlow;
