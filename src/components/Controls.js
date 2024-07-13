import React, { useState, useEffect } from 'react';
import './Controls.css';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const toggleLooping = (name) => {
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
  };

  const setLoopingSpeed = (name, speed) => {
    setLoopingSpeeds(prev => ({ ...prev, [name]: speed }));
  };

  const handleLoopRangeChange = (name, type, value) => {
    setLoopRanges(prev => ({
      ...prev,
      [name]: { ...prev[name], [type]: parseFloat(value) }
    }));
  };

  const resetAllSettings = () => {
    const defaultConfig = {};
    Object.entries(controlConfig).forEach(([name, { defaultValue }]) => {
      defaultConfig[name] = defaultValue;
    });
    setConfig(defaultConfig);
    setLoopingControls({});
    setLoopingSpeeds({});
    setLoopRanges({});
    setLoopDirections({});
  };

  const controlConfig = {
    height: { min: 0, max: 1, step: 0.01, defaultValue: 0.35 },
    static: { min: 0, max: 1, step: 0.01, defaultValue: 0 },
    focus: { min: 0.5, max: 100, step: 0.01, defaultValue: 10.0 },
    zoom: { min: 0.5, max: 2, step: 0.01, defaultValue: 1.0 },
    isometric: { min: 0, max: 1, step: 0.01, defaultValue: 0 },
    dolly: { min: -1, max: 1, step: 0.01, defaultValue: 0 },
    invert: { min: 0, max: 1, step: 0.01, defaultValue: 0.5 },
    depthCenterX: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
    depthCenterY: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
    depthOriginX: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
    depthOriginY: { min: -1, max: 1, step: 0.01, defaultValue: 0.5 },
    quality: { min: 0, max: 1, step: 0.01, defaultValue: 1 },
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

  useEffect(() => {
    const intervalIds = {};

    Object.keys(loopingControls).forEach(name => {
      if (loopingControls[name]) {
        intervalIds[name] = setInterval(() => {
          setConfig(prev => {
            const { min, max } = loopRanges[name];
            const step = controlConfig[name].step * (loopingSpeeds[name] || 1);
            let newValue = prev[name] + step * loopDirections[name];

            if (newValue > max || newValue < min) {
              loopDirections[name] *= -1;
              newValue = newValue > max ? max : min;
            }

            return { ...prev, [name]: parseFloat(newValue.toFixed(2)) };
          });
        }, 1);
      }
    });

    return () => {
      Object.values(intervalIds).forEach(clearInterval);
    };
  }, [loopingControls, loopingSpeeds, loopRanges, loopDirections, setConfig]);

  return (
    <div className={`control-panel ${minimized ? 'minimized' : ''}`}>
      <div className="control-panel-header">
        <button className="minimize-button" onClick={() => setMinimized(!minimized)}>
          {minimized ? '+' : '-'}
        </button>
        <button className="reset-button" onClick={resetAllSettings}>Reset All</button>
        <div className="mouse-toggle">
          <label>
            <input
              type="checkbox"
              onChange={(e) => setMouseEnabled(e.target.checked)}
              defaultChecked={true}
            />
            Enable Mouse
          </label>
        </div>
      </div>
      <div className="control-group">
        <label className="control-label">
          View Depth Map
          <input
            type="checkbox"
            checked={viewDepthMap}
            onChange={(e) => setViewDepthMap(e.target.checked)}
          />
        </label>
      </div>
      {viewDepthMap && (
        <div className="control-group">
          <label className="control-label">
            Depth Map Opacity
            <span className="control-value">{depthMapOpacity.toFixed(2)}</span>
          </label>
          <div className="slider-container">
            <input
              type="range"
              className="slider"
              min={0}
              max={1}
              step={0.01}
              value={depthMapOpacity}
              onChange={(e) => setDepthMapOpacity(parseFloat(e.target.value))}
            />
          </div>
        </div>
      )}
      {Object.entries(controlConfig).map(([name, { min, max, step }]) => (
        <div className="control-group" key={name}>
          <label className="control-label">
            {name.charAt(0).toUpperCase() + name.slice(1)}
            <span className="control-value">
              {config[name] !== undefined ? config[name].toFixed(2) : 'N/A'}
            </span>
          </label>
          <div className="slider-container">
            <input
              type="range"
              className="slider"
              name={name}
              min={loopingControls[name] ? loopRanges[name]?.min ?? min : min}
              max={loopingControls[name] ? loopRanges[name]?.max ?? max : max}
              step={step}
              value={config[name] !== undefined ? config[name] : 0}
              onChange={handleChange}
            />
          </div>
          <div className="loop-controls">
            <label className="loop-checkbox">
              <input
                type="checkbox"
                checked={loopingControls[name] || false}
                onChange={() => toggleLooping(name)}
              />
              Loop
            </label>
            {loopingControls[name] && (
              <>
                <input
                  type="number"
                  className="speed-input"
                  value={loopingSpeeds[name] || 1}
                  onChange={(e) => setLoopingSpeed(name, parseFloat(e.target.value))}
                  min="0.1"
                  max="10"
                  step="0.1"
                />
                <div className="loop-range">
                  <input
                    type="number"
                    className="loop-min"
                    value={loopRanges[name].min}
                    onChange={(e) => handleLoopRangeChange(name, 'min', e.target.value)}
                    min={min}
                    max={loopRanges[name].max}
                    step={step}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    className="loop-max"
                    value={loopRanges[name].max}
                    onChange={(e) => handleLoopRangeChange(name, 'max', e.target.value)}
                    min={loopRanges[name].min}
                    max={max}
                    step={step}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Controls;
