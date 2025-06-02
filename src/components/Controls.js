import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import PropTypes from 'prop-types';

// Animation for fade-in effect
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled components
const ControlPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  width: ${props => (props.$minimized ? 'auto' : '340px')};
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
  z-index: 10;

  @media (max-width: 768px) {
    width: ${props => (props.$minimized ? 'auto' : '90%')};
    max-width: 300px;
    padding: 15px;
  }
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
  background-color: ${props => (props.$reset ? '#f44336' : '#4CAF50')};
  border: none;
  color: white;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  margin: 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${props => (props.$reset ? '#d32f2f' : '#45a049')};
  }

  &:focus {
    outline: 2px solid #0056b3;
    outline-offset: 2px;
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
  padding: 10px;
  border-radius: 4px;
  background-color: #fafafa;
`;

const ControlLabel = styled.label`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.9rem;
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

  &:focus {
    outline: 2px solid #0056b3;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
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
  margin-top: 8px;
`;

const LoopCheckbox = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  cursor: pointer;
  font-size: 0.85rem;
`;

const LoopSettingsToggle = styled.button`
  background: none;
  border: none;
  color: #4CAF50;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: underline;
  margin-bottom: 8px;
  padding: 0;

  &:hover {
    color: #45a049;
  }

  &:focus {
    outline: 2px solid #0056b3;
  }
`;

const LoopSettings = styled.div`
  display: ${props => (props.$visible ? 'block' : 'none')};
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
`;

const InputLabel = styled.label`
  font-size: 0.85rem;
  margin-right: 8px;
  color: #333;
`;

const SpeedInput = styled.input`
  width: 60px;
  margin-right: 10px;
  padding: 4px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.85rem;

  &:focus {
    outline: 2px solid #0056b3;
  }
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
  font-size: 0.85rem;

  &:focus {
    outline: 2px solid #0056b3;
  }
`;

// Define control configuration
const controlConfig = {
  height: { min: 0.01, max: 1, step: 0.01, defaultValue: 1.0 },
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
  vignetteIntensity: { min: 0, max: 100, step: 0.01, defaultValue: 50 },
  vignetteDecay: { min: 0.01, max: 2.5, step: 0.01, defaultValue: 0.5 },
  depthOffsetX: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  depthOffsetY: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
  depthMirror: { min: 0, max: 1, step: 1, defaultValue: 0 },
  aspectRatio: { min: 0.5, max: 2, step: 0.01, defaultValue: 1 },
  viewDepthMap: { min: 0, max: 1, step: 1, defaultValue: 0 },
  depthMapOpacity: { min: 0, max: 1, step: 0.01, defaultValue: 1 },
};

function Controls({
  config,
  dispatchConfig,
  setMouseEnabled,
  mouseEnabled,
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
  const [loopSettingsVisible, setLoopSettingsVisible] = useState({});

  const handleChange = useCallback(
    (name, value) => {
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        dispatchConfig({ type: 'UPDATE_CONFIG', payload: { [name]: parsedValue } });
      }
    },
    [dispatchConfig]
  );

  const toggleLooping = useCallback(
    (name) => {
      setLoopingControls((prev) => {
        const newState = { ...prev, [name]: !prev[name] };
        if (newState[name] && !loopRanges[name]) {
          setLoopRanges((prevRanges) => ({
            ...prevRanges,
            [name]: { min: controlConfig[name].min, max: controlConfig[name].max },
          }));
          setLoopDirections((prevDirections) => ({ ...prevDirections, [name]: 1 }));
          setLoopingSpeeds((prevSpeeds) => ({ ...prevSpeeds, [name]: 1 }));
        }
        return newState;
      });
    },
    []
  );

  const setLoopingSpeed = useCallback((name, speed) => {
    const parsedSpeed = parseFloat(speed);
    if (!isNaN(parsedSpeed) && parsedSpeed > 0) {
      setLoopingSpeeds((prev) => ({ ...prev, [name]: parsedSpeed }));
    }
  }, []);

  const handleLoopRangeChange = useCallback((name, type, value) => {
    const parsedValue = parseFloat(value);
    if (!isNaN(parsedValue)) {
      setLoopRanges((prev) => {
        const currentRange = prev[name] || {
          min: controlConfig[name].min,
          max: controlConfig[name].max,
        };
        const newRange = { ...currentRange, [type]: parsedValue };
        // Ensure min <= max and within controlConfig bounds
        newRange.min = Math.max(controlConfig[name].min, Math.min(newRange.min, newRange.max));
        newRange.max = Math.min(controlConfig[name].max, Math.max(newRange.min, newRange.max));
        return { ...prev, [name]: newRange };
      });
    }
  }, []);

  const toggleLoopSettings = useCallback((name) => {
    setLoopSettingsVisible((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  const resetAllSettings = useCallback(() => {
    dispatchConfig({ type: 'RESET_CONFIG' });
    setLoopingControls({});
    setLoopingSpeeds({});
    setLoopRanges({});
    setLoopDirections({});
    setLoopSettingsVisible({});
    setViewDepthMap(false);
    setDepthMapOpacity(1);
  }, [dispatchConfig, setViewDepthMap, setDepthMapOpacity]);

  useEffect(() => {
    const intervalIds = {};

    Object.entries(loopingControls).forEach(([name, isLooping]) => {
      if (isLooping) {
        intervalIds[name] = setInterval(() => {
          setLoopingControls((prevLooping) => {
            if (!prevLooping[name]) return prevLooping;
            const currentValue = config[name] ?? controlConfig[name].defaultValue;
            const { min, max } = loopRanges[name] || controlConfig[name];
            const speed = loopingSpeeds[name] || 1;
            const step = controlConfig[name].step * speed;
            const direction = loopDirections[name] || 1;
            let newValue = currentValue + step * direction;

            // Reverse direction at bounds
            if (newValue >= max) {
              newValue = max;
              setLoopDirections((prevDir) => ({ ...prevDir, [name]: -1 }));
            } else if (newValue <= min) {
              newValue = min;
              setLoopDirections((prevDir) => ({ ...prevDir, [name]: 1 }));
            }

            dispatchConfig({
              type: 'UPDATE_CONFIG',
              payload: { [name]: parseFloat(newValue.toFixed(2)) },
            });

            return prevLooping;
          });
        }, 16); // ~60 FPS
      }
    });

    return () => Object.values(intervalIds).forEach(clearInterval);
  }, [loopingControls, loopingSpeeds, loopRanges, loopDirections, config]);

  const controlItems = useMemo(() => {
    return Object.entries(controlConfig)
      .filter(([name]) => name !== 'viewDepthMap' && name !== 'depthMapOpacity')
      .map(([name, { min, max, step }]) => (
        <ControlGroup key={name} aria-labelledby={`${name}-label`}>
          <ControlLabel id={`${name}-label`}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
            <ControlValue aria-live="polite">
              {config[name] !== undefined ? config[name].toFixed(2) : 'N/A'}
            </ControlValue>
          </ControlLabel>
          <Slider
            type="range"
            name={name}
            min={min} // Always use controlConfig min
            max={max} // Always use controlConfig max
            step={step}
            value={config[name] ?? min}
            onChange={(e) => handleChange(name, e.target.value)}
            aria-label={`Adjust ${name}`}
          />
          <LoopControls>
            <LoopSettingsToggle
              onClick={() => toggleLoopSettings(name)}
              aria-label={`Toggle loop settings for ${name}`}
            >
              {loopSettingsVisible[name] ? 'Hide Loop Settings' : 'Show Loop Settings'}
            </LoopSettingsToggle>
            <LoopSettings $visible={loopSettingsVisible[name]}>
              <div>
                <InputLabel htmlFor={`${name}-speed`}>Speed:</InputLabel>
                <SpeedInput
                  id={`${name}-speed`}
                  type="number"
                  value={loopingSpeeds[name] || 1}
                  onChange={(e) => setLoopingSpeed(name, e.target.value)}
                  min="0.1"
                  max="10"
                  step="0.1"
                  aria-label={`Looping speed for ${name}`}
                />
              </div>
              <LoopRange>
                <InputLabel htmlFor={`${name}-min`}>Min:</InputLabel>
                <LoopRangeInput
                  id={`${name}-min`}
                  type="number"
                  value={loopRanges[name]?.min ?? min}
                  onChange={(e) => handleLoopRangeChange(name, 'min', e.target.value)}
                  min={min}
                  max={max}
                  step={step}
                  aria-label={`Minimum range for ${name} looping`}
                />
                <InputLabel htmlFor={`${name}-max`}>Max:</InputLabel>
                <LoopRangeInput
                  id={`${name}-max`}
                  type="number"
                  value={loopRanges[name]?.max ?? max}
                  onChange={(e) => handleLoopRangeChange(name, 'max', e.target.value)}
                  min={min}
                  max={max}
                  step={step}
                  aria-label={`Maximum range for ${name} looping`}
                />
              </LoopRange>
            </LoopSettings>
            <LoopCheckbox>
              <input
                type="checkbox"
                checked={loopingControls[name] || false}
                onChange={() => toggleLooping(name)}
                aria-label={`Enable looping for ${name}`}
                id={`${name}-loop`}
              />
              <label htmlFor={`${name}-loop`}>Loop</label>
            </LoopCheckbox>
          </LoopControls>
        </ControlGroup>
      ));
  }, [
    config,
    loopingControls,
    loopRanges,
    loopingSpeeds,
    loopSettingsVisible,
    handleChange,
    toggleLooping,
    setLoopingSpeed,
    handleLoopRangeChange,
  ]);

  return (
    <ControlPanel $minimized={minimized} role="region" aria-label="Depth Flow Controls">
      <ControlPanelHeader>
        <Button
          onClick={() => setMinimized(!minimized)}
          aria-label={minimized ? 'Expand controls' : 'Minimize controls'}
        >
          {minimized ? '+' : '-'}
        </Button>
        <Button $reset onClick={resetAllSettings} aria-label="Reset all settings">
          Reset All
        </Button>
        <LoopCheckbox>
          <input
            type="checkbox"
            checked={mouseEnabled}
            onChange={(e) => setMouseEnabled(e.target.checked)}
            aria-label="Enable mouse interaction"
            id="enable-mouse"
          />
          <label htmlFor="enable-mouse">Enable Mouse</label>
        </LoopCheckbox>
      </ControlPanelHeader>
      {!minimized && (
        <ControlsContainer>
          <ControlGroup aria-labelledby="view-depth-map-label">
            <ControlLabel id="view-depth-map-label">
              View Depth Map
              <input
                type="checkbox"
                checked={viewDepthMap}
                onChange={(e) => setViewDepthMap(e.target.checked)}
                aria-label="Toggle depth map visibility"
                id="view-depth-map"
              />
            </ControlLabel>
          </ControlGroup>
          {viewDepthMap && (
            <ControlGroup aria-labelledby="depth-map-opacity-label">
              <ControlLabel id="depth-map-opacity-label">
                Depth Map Opacity
                <ControlValue aria-live="polite">{depthMapOpacity.toFixed(2)}</ControlValue>
              </ControlLabel>
              <Slider
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={depthMapOpacity}
                onChange={(e) => setDepthMapOpacity(parseFloat(e.target.value))}
                aria-label="Adjust depth map opacity"
              />
            </ControlGroup>
          )}
          {controlItems}
        </ControlsContainer>
      )}
    </ControlPanel>
  );
}

Controls.propTypes = {
  config: PropTypes.object.isRequired,
  dispatchConfig: PropTypes.func.isRequired,
  setMouseEnabled: PropTypes.func.isRequired,
  mouseEnabled: PropTypes.bool.isRequired,
  viewDepthMap: PropTypes.bool.isRequired,
  setViewDepthMap: PropTypes.func.isRequired,
  depthMapOpacity: PropTypes.number.isRequired,
  setDepthMapOpacity: PropTypes.func.isRequired,
};

export default React.memo(Controls);
