import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const ControlPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: ${props => props.$minimized ? 'auto' : '340px'};
  background-color: rgba(255, 255, 255, 0.95);
  color: #333;
  padding: 20px;
  border-radius: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ControlPanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
`;

const Button = styled.button`
  background-color: ${props => props.$reset ? '#f44336' : '#4CAF50'};
  border: none;
  color: white;
  padding: 8px 12px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  margin: 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => props.$reset ? '#d32f2f' : '#45a049'};
  }
`;

const ControlsContainer = styled.div`
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

const ControlGroup = styled.div`
  margin-bottom: 20px;
`;

const ControlLabel = styled.label`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
`;

const ControlValue = styled.span`
  font-weight: normal;
  color: #666;
`;

const Slider = styled.input`
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  background: #ddd;
  outline: none;
  opacity: 0.7;
  transition: opacity 0.2s;
  border-radius: 4px;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 50%;
  }
`;

const LoopControls = styled.div`
  display: flex;
  flex-direction: column;
`;

const LoopCheckbox = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
`;

const SpeedInput = styled.input`
  width: 60px;
  margin-right: 10px;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const LoopRange = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`;

const LoopRangeInput = styled.input`
  width: 70px;
  padding: 4px;
  margin: 0 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const controlConfig = {
  height: { min: 0.01, max: 1, step: 0.01, defaultValue: 1.00 },
  static: { min: 0, max: 1, step: 0.01, defaultValue: 0 },
  focus: { min: 0.6, max: 100, step: 0.01, defaultValue: 10.0 },
  zoom: { min: -2, max: 2, step: 0.01, defaultValue: 0.5 },
  isometric: { min: 0, max: 1, step: 0.01, defaultValue: 0 },
  dolly: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  invert: { min: 0, max: 1, step: 0.01, defaultValue: 0.39 },
  focusCenterX: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  focusCenterY: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  depthCenterX: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
  depthCenterY: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
  depthOriginX: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
  depthOriginY: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
  quality: { min: 0, max: 100, step: 0.01, defaultValue: 100 },
  dofEnable: { min: 0, max: 1, step: 1, defaultValue: 0 },
  dofIntensity: { min: 0, max: 1, step: 0.01, defaultValue: 0.1 },
  dofStart: { min: 0, max: 1, step: 0.01, defaultValue: 0 },
  dofEnd: { min: 0, max: 1, step: 0.01, defaultValue: 1 },
  dofExponent: { min: 0.5, max: 2.5, step: 0.01, defaultValue: 1 },
  dofDirections: { min: 4, max: 16, step: 1, defaultValue: 8 },
  dofQuality: { min: 1, max: 8, step: 1, defaultValue: 4 },
  vignetteEnable: { min: 0, max: 1, step: 1, defaultValue: 0 },
  vignetteIntensity: { min: 0, max: 2, step: 0.01, defaultValue: 1 },
  vignetteDecay: { min: 0.5, max: 2.5, step: 0.01, defaultValue: 1.5 },
  depthOffsetX: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  depthOffsetY: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  depthMirror: { min: 0, max: 1, step: 1, defaultValue: 0 },
  aspectRatio: { min: 0.5, max: 2, step: 0.01, defaultValue: 1 },
  viewDepthMap: { min: 0, max: 1, step: 1, defaultValue: 0 },
  depthMapOpacity: { min: 0, max: 1, step: 0.01, defaultValue: 1 },
};

function Controls({
  config,
  setConfig,
  setMouseEnabled,
  viewDepthMap,
  setViewDepthMap,
  depthMapOpacity,
  setDepthMapOpacity,
}) {
  const [minimized, setMinimized] = useState(false);
  const [loopingControls, setLoopingControls] = useState({});
  const [loopingSpeeds, setLoopingSpeeds] = useState({});
  const [loopRanges, setLoopRanges] = useState({});
  const [loopDirections, setLoopDirections] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
  }, [setConfig]);

  const toggleLooping = useCallback((name) => {
    setLoopingControls(prev => {
      const newState = { ...prev, [name]: !prev[name] };
      if (newState[name]) {
        setLoopRanges(prevRanges => ({
          ...prevRanges,
          [name]: { min: controlConfig[name].min, max: controlConfig[name].max }
        }));
        setLoopDirections(prevDirections => ({ ...prevDirections, [name]: 1 }));
      }
      return newState;
    });
  }, []);

  const setLoopingSpeed = useCallback((name, speed) => {
    setLoopingSpeeds(prev => ({ ...prev, [name]: speed }));
  }, []);

  const handleLoopRangeChange = useCallback((name, type, value) => {
    setLoopRanges(prev => ({
      ...prev,
      [name]: { ...prev[name], [type]: parseFloat(value) }
    }));
  }, []);

  const resetAllSettings = useCallback(() => {
    const defaultConfig = Object.fromEntries(
      Object.entries(controlConfig).map(([name, { defaultValue }]) => [name, defaultValue])
    );
    setConfig(defaultConfig);
    setLoopingControls({});
    setLoopingSpeeds({});
    setLoopRanges({});
    setLoopDirections({});
  }, [setConfig]);

  useEffect(() => {
    const intervalIds = {};

    Object.entries(loopingControls).forEach(([name, isLooping]) => {
      if (isLooping) {
        intervalIds[name] = setInterval(() => {
          setConfig(prev => {
            const { min, max } = loopRanges[name];
            const step = controlConfig[name].step * (loopingSpeeds[name] || 1);
            let newValue = prev[name] + step * loopDirections[name];

            if (newValue > max || newValue < min) {
              setLoopDirections(prevDir => ({ ...prevDir, [name]: -prevDir[name] }));
              newValue = newValue > max ? max : min;
            }

            return { ...prev, [name]: parseFloat(newValue.toFixed(2)) };
          });
        }, 16); // 60 FPS
      }
    });

    return () => Object.values(intervalIds).forEach(clearInterval);
  }, [loopingControls, loopingSpeeds, loopRanges, loopDirections, setConfig]);

  const controlItems = useMemo(() => (
    Object.entries(controlConfig).map(([name, { min, max, step }]) => (
      <ControlGroup key={name}>
        <ControlLabel>
          {name.charAt(0).toUpperCase() + name.slice(1)}
          <ControlValue>
            {config[name] !== undefined ? config[name].toFixed(2) : 'N/A'}
          </ControlValue>
        </ControlLabel>
        <Slider
          type="range"
          name={name}
          min={loopingControls[name] ? loopRanges[name]?.min ?? min : min}
          max={loopingControls[name] ? loopRanges[name]?.max ?? max : max}
          step={step}
          value={config[name] !== undefined ? config[name] : 0}
          onChange={handleChange}
        />
        <LoopControls>
          <LoopCheckbox>
            <input
              type="checkbox"
              checked={loopingControls[name] || false}
              onChange={() => toggleLooping(name)}
            />
            Loop
          </LoopCheckbox>
          {loopingControls[name] && (
            <>
              <SpeedInput
                type="number"
                value={loopingSpeeds[name] || 1}
                onChange={(e) => setLoopingSpeed(name, parseFloat(e.target.value))}
                min="0.1"
                max="10"
                step="0.1"
              />
              <LoopRange>
                <LoopRangeInput
                  type="number"
                  value={loopRanges[name].min}
                  onChange={(e) => handleLoopRangeChange(name, 'min', e.target.value)}
                  min={min}
                  max={loopRanges[name].max}
                  step={step}
                />
                <span>to</span>
                <LoopRangeInput
                  type="number"
                  value={loopRanges[name].max}
                  onChange={(e) => handleLoopRangeChange(name, 'max', e.target.value)}
                  min={loopRanges[name].min}
                  max={max}
                  step={step}
                />
              </LoopRange>
            </>
          )}
        </LoopControls>
      </ControlGroup>
    ))
  ), [config, loopingControls, loopRanges, loopingSpeeds, handleChange, toggleLooping, setLoopingSpeed, handleLoopRangeChange]);

  return (
    <ControlPanel $minimized={minimized}>
      <ControlPanelHeader>
        <Button onClick={() => setMinimized(!minimized)}>
          {minimized ? '+' : '-'}
        </Button>
        <Button $reset onClick={resetAllSettings}>Reset All</Button>
        <LoopCheckbox>
          <input
            type="checkbox"
            onChange={(e) => setMouseEnabled(e.target.checked)}
            defaultChecked={true}
          />
          Enable Mouse
        </LoopCheckbox>
      </ControlPanelHeader>
      {!minimized && (
        <ControlsContainer>
          <ControlGroup>
            <ControlLabel>
              View Depth Map
              <input
                type="checkbox"
                checked={viewDepthMap}
                onChange={(e) => setViewDepthMap(e.target.checked)}
              />
            </ControlLabel>
          </ControlGroup>
          {viewDepthMap && (
            <ControlGroup>
              <ControlLabel>
                Depth Map Opacity
                <ControlValue>{depthMapOpacity.toFixed(2)}</ControlValue>
              </ControlLabel>
              <Slider
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={depthMapOpacity}
                onChange={(e) => setDepthMapOpacity(parseFloat(e.target.value))}
              />
            </ControlGroup>
          )}
          {controlItems}
        </ControlsContainer>
      )}
    </ControlPanel>
  );
}

export default React.memo(Controls);
