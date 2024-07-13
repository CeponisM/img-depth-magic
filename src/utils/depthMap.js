import { auth } from '../firebase';

export const generateDepthMap = async (imageUrl) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  const response = await fetch('http://209.122.95.149:5000/api/depthmap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ image_url: imageUrl })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch depth map from server');
  }

  const depthMapData = await response.json();
  
  // Find min and max without flattening the entire array
  let minDepth = Infinity;
  let maxDepth = -Infinity;
  
  for (let i = 0; i < depthMapData.length; i++) {
    for (let j = 0; j < depthMapData[i].length; j++) {
      const value = depthMapData[i][j];
      if (value < minDepth) minDepth = value;
      if (value > maxDepth) maxDepth = value;
    }
  }

  // Normalize the depth array in-place
  const depthRange = maxDepth - minDepth;
  for (let i = 0; i < depthMapData.length; i++) {
    for (let j = 0; j < depthMapData[i].length; j++) {
      depthMapData[i][j] = (depthMapData[i][j] - minDepth) / depthRange;
    }
  }

  return {
    depthArray: depthMapData,
    shape: [depthMapData.length, depthMapData[0].length],
  };
};
