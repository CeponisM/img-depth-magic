import { auth } from '../firebase';

const API_URL = 'http://209.122.95.149';

const apiRequest = async (url, options) => {
  try {
    const response = await fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

export const generateDepthMap = async (imageUrl) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const token = await user.getIdToken();

    const response = await apiRequest(`${API_URL}/api/depthmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    const depthMapData = await response.json();

    if (!Array.isArray(depthMapData) || depthMapData.length === 0) {
      throw new Error('Invalid depth map data received');
    }

    const height = depthMapData.length;
    const width = depthMapData[0].length;

    const normalizedDepthMap = new Array(height);
    let minDepth = Infinity;
    let maxDepth = -Infinity;

    // First pass: find min and max depth
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const depth = depthMapData[i][j];
        if (depth < minDepth) minDepth = depth;
        if (depth > maxDepth) maxDepth = depth;
      }
    }

    // Calculate depth range and prepare for histogram equalization
    const depthRange = maxDepth - minDepth;
    const histogramBins = 256;
    const histogram = new Uint32Array(histogramBins);
    const scale = (histogramBins - 1) / depthRange;

    // Second pass: build histogram
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        const index = Math.floor((depthMapData[i][j] - minDepth) * scale);
        histogram[index]++;
      }
    }

    // Calculate cumulative distribution function (CDF)
    const cdf = new Float32Array(histogramBins);
    cdf[0] = histogram[0];
    for (let i = 1; i < histogramBins; i++) {
      cdf[i] = cdf[i - 1] + histogram[i];
    }
    const cdfMin = cdf[0];
    const cdfMax = cdf[histogramBins - 1];
    const cdfRange = cdfMax - cdfMin;

    // Third pass: apply histogram equalization and normalize
    for (let i = 0; i < height; i++) {
      normalizedDepthMap[i] = new Float32Array(width);
      for (let j = 0; j < width; j++) {
        const index = Math.floor((depthMapData[i][j] - minDepth) * scale);
        const equalizedValue = (cdf[index] - cdfMin) / cdfRange;
        // Invert the normalization so closer objects are brighter
        normalizedDepthMap[i][j] = equalizedValue;
      }
    }

    return {
      depthArray: normalizedDepthMap,
      shape: [height, width],
    };
  } catch (error) {
    console.error('Error generating depth map:', error);
    throw error;
  }
};
