import React, { useReducer, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';
import DepthFlowScene from './DepthFlowScene';
import Controls from './Controls';
import FileUpload from './FileUpload';
import ServerStatus from './ServerStatus';
import { generateDepthMap } from '../utils/depthMap';
import { configReducer, initialConfig } from '../utils/configReducer';

// Animation for fade-in effect
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled components
const DepthFlowContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f0f0f0;
  animation: ${fadeIn} 0.5s ease-out;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  flex: 1;
  position: relative;
  width: 100%;
  max-width: 100vw;

  @media (max-width: 768px) {
    height: 50vh; /* Adjust for smaller screens */
  }
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
  transition: opacity 0.3s ease;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #d32f2f;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  z-index: 11;
  font-size: 1rem;
  max-width: 90%;
  text-align: center;
`;

const ControlsContainer = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

function DepthFlow() {
  const [config, dispatchConfig] = useReducer(configReducer, initialConfig);
  const [imageData, setImageData] = React.useState(null);
  const [depthData, setDepthData] = React.useState(null);
  const [mouseEnabled, setMouseEnabled] = React.useState(true);
  const [viewDepthMap, setViewDepthMap] = React.useState(false);
  const [depthMapOpacity, setDepthMapOpacity] = React.useState(0.5);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isServerDown, setIsServerDown] = React.useState(false); // New state for server status

  // Example: Check server status on mount or during upload
  React.useEffect(() => {
    // Simulate server status check (replace with actual API call)
    const checkServerStatus = async () => {
      try {
        // Replace with actual server status check
        // e.g., const response = await fetch('your-server-status-endpoint');
        // if (!response.ok) setIsServerDown(true);
        setIsServerDown(true); // Simulating server down for demo
      } catch {
        setIsServerDown(true);
      }
    };
    checkServerStatus();
  }, []);

  const handleUpload = useCallback(async (file, imageUrl) => {
    if (isServerDown) {
      setError('Cannot process upload: Server is currently unavailable.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      setImageData({ file, url: imageUrl });
      const depthMapData = await generateDepthMap(imageUrl);
      if (!depthMapData?.depthArray || !depthMapData?.shape) {
        throw new Error('Invalid depth map data');
      }
      setDepthData(depthMapData);
    } catch (err) {
      console.error('Error during upload or depth map generation:', err);
      setError('Failed to process the image. Please try again.');
      setImageData(null);
      setDepthData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isServerDown]);

  return (
    <DepthFlowContainer role="main" aria-label="Depth Flow Application">
      <FileUpload onUpload={handleUpload} aria-label="Upload image for depth map generation" />
      {isServerDown && <ServerStatus />}
      {error && !isServerDown && <ErrorMessage role="alert">{error}</ErrorMessage>}
      {imageData && depthData && !isServerDown && (
        <CanvasContainer>
          <StyledCanvas
            gl={{ powerPreference: 'high-performance', antialias: true }}
            aria-label="3D depth map visualization"
          >
            <Suspense fallback={null}>
              <DepthFlowScene
                config={config}
                imageData={imageData}
                depthData={depthData}
                mouseEnabled={mouseEnabled}
                viewDepthMap={viewDepthMap}
                depthMapOpacity={depthMapOpacity}
                onError={setError}
              />
            </Suspense>
          </StyledCanvas>
          <ControlsContainer>
            <Controls
              config={config}
              dispatchConfig={dispatchConfig}
              setMouseEnabled={setMouseEnabled}
              viewDepthMap={viewDepthMap}
              setViewDepthMap={setViewDepthMap}
              depthMapOpacity={depthMapOpacity}
              setDepthMapOpacity={setDepthMapOpacity}
            />
          </ControlsContainer>
        </CanvasContainer>
      )}
      {isLoading && !isServerDown && (
        <LoadingOverlay aria-live="polite">
          Generating depth map...
        </LoadingOverlay>
      )}
    </DepthFlowContainer>
  );
}

DepthFlow.propTypes = {
  // No props are passed to DepthFlow, but PropTypes can be added for future extensibility
};

export default DepthFlow;
