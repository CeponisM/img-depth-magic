import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree, extend } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';
extend({ OrbitControls });

// Define shaders inline
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShaderWithCamera = `
  uniform vec2 iFocusCenter;
  uniform float iTime;
  uniform vec2 iResolution;
  uniform sampler2D iImage;
  uniform sampler2D iDepth;
  uniform float iDepthHeight;
  uniform float iDepthStatic;
  uniform float iDepthFocus;
  uniform float iZoom;
  uniform float iDepthZoom;
  uniform float iDepthIsometric;
  uniform float iDepthDolly;
  uniform float iDepthInvert;
  uniform vec2 iDepthCenter;
  uniform vec2 iDepthOrigin;
  uniform float iQuality;
  uniform bool iDofEnable;
  uniform float iDofIntensity;
  uniform float iDofStart;
  uniform float iDofEnd;
  uniform float iDofExponent;
  uniform float iDofDirections;
  uniform float iDofQuality;
  uniform bool iVignetteEnable;
  uniform float iVignetteIntensity;
  uniform float iVignetteDecay;
  uniform vec2 iDepthOffset;
  uniform bool iDepthMirror;
  uniform vec3 iCameraPosition;
  uniform float iAspectRatio;
  uniform float iHeight;
  uniform float iZoomFactor;
  uniform bool iViewDepthMap;
  uniform float iDepthMapOpacity;

  varying vec2 vUv;

  #define TAU 6.28318530717958647692528676655900577

// Add any missing function definitions here
// For example:
vec4 gtexture(sampler2D tex, vec2 uv, bool mirror) {
    if (mirror) {
        uv = abs(mod(uv, 2.0) - 1.0);
    }
    return texture2D(tex, uv);
}

struct Camera {
    vec3 origin;
    vec3 direction;
    vec3 up;
    vec3 right;
    float fov;
    float zoom;
    bool isometric;
    float dolly;
    vec3 plane_point;
    vec2 gluv;
    bool out_of_bounds;
};

Camera iInitCamera(vec2 uv) {
    Camera cam;
    // Initialize camera properties
    cam.origin = vec3(0.0, 0.0, 1.0);
    cam.direction = vec3(0.0, 0.0, -1.0);
    cam.up = vec3(0.0, 1.0, 0.0);
    cam.right = vec3(1.0, 0.0, 0.0);
    cam.fov = radians(60.0);
    cam.zoom = 1.0;
    cam.isometric = false;
    cam.dolly = 0.0;
    cam.plane_point = vec3(0.0, 0.0, 0.0);
    cam.gluv = uv;
    cam.out_of_bounds = false;
    return cam;
}

Camera iProjectCamera(Camera cam) {
    // Apply zoom
    cam.zoom = (iZoom);

    // Calculate the aspect ratio of the viewport
    float viewportAspect = iResolution.x / iResolution.y;

    // Apply isometric projection if enabled
    if (cam.isometric || iDepthIsometric > 0.5) {
        cam.direction = normalize(vec3(-1.0, -1.0, -1.0));
        cam.up = vec3(0.0, 1.0, 0.0);
        cam.right = cross(cam.direction, cam.up);
    } else {
        // Perspective projection
        float fovFactor = tan(cam.fov * 0.5) / cam.zoom;
        vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;

        // Aspect ratio correction
        if (iAspectRatio <= 1.0) {
            uv.y /= viewportAspect / iAspectRatio;
        } else {
            uv.x *= viewportAspect / iAspectRatio;
        }

        cam.direction = normalize(vec3(uv * fovFactor, -1.0));
        cam.up = vec3(0.0, 1.0, 0.0);
        cam.right = cross(cam.direction, cam.up);
    }

    // Apply dolly zoom
    cam.origin.z += iDepthDolly;

    // Apply camera offset
    cam.origin.xy += iDepthOffset;

    // Calculate the point where the camera ray intersects the image plane
    float t = -cam.origin.z / cam.direction.z;
    cam.plane_point = cam.origin + t * cam.direction;

    // Check if the intersection point is within bounds
    cam.out_of_bounds = abs(cam.plane_point.x) > 1.0 || abs(cam.plane_point.y) > 1.0;

    // Calculate UV coordinates on the image plane
    cam.gluv = (cam.plane_point.xy + 1.0) * 0.5;

    return cam;
}

void main() {
    vec2 gluv = vUv;
    
    Camera iCamera = iInitCamera(gluv);

    // Update iCamera origin based on mouse input
    iCamera.origin = iCameraPosition;

    // Adjust UV coordinates based on aspect ratio, height, and zoom factor
    vec2 uv = (gluv - 0.5) * vec2(iAspectRatio, 1.0) + 0.5;
    
    // Adjust UV based on height and zoom factor to ensure full image is always visible
    float heightFactor = 1.0 + iHeight;
    uv = (uv - 0.5) * heightFactor * iZoomFactor + 0.5;

    // The distance the maximum depth projection plane is from the camera.
    float iDepthDistance = 1.0 + mix(0.0, iDepthHeight, iDepthFocus);

    // Add parallax options
    iCamera.origin.xy += iDepthOffset;
    iCamera.isometric = iCamera.isometric || (iDepthIsometric > 0.5);
    iCamera.dolly += iDepthDolly;
    iCamera.zoom += (iDepthZoom - 1.0) + (iDepthDistance - 1.0);
    iCamera.plane_point = vec3(0.0, 0.0, iDepthDistance);
    iCamera = iProjectCamera(iCamera);

    // Doesn't intersect with the XY plane
    if (iCamera.out_of_bounds) {
        gl_FragColor = vec4(vec3(0.2), 1.0);
        return;
    }

    // DepthFlow math

    // Calculate focus offset from the center
    vec2 focusOffset = (iFocusCenter) * 2.0;
    
    // Point where the ray intersects with the fixed image plane
    vec2 lambda = (iCamera.gluv - 0.5) * 2.0 + iDepthCenter;
    
    // Same as above but overshoot by depth focal point (fixed offsets point at depth=focus)
    vec2 sigma = lambda - iCamera.origin.xy * (1.0 + iDepthStatic * iDepthHeight / iDepthDistance);
    
    // Apply focus offset to sigma
    sigma += focusOffset * iDepthHeight;

    // The vector from Lambda to the camera's projection on the XY plane
    vec2 displacement = (iCamera.origin.xy - lambda) + iDepthOrigin + focusOffset * iDepthHeight;
    vec2 walk = normalize(displacement);

    // Angle between the Ray's origin and the XY plane
    float theta = atan(
        length(displacement),
        abs(iDepthDistance - iCamera.origin.z)
    );

    // Cache tan(theta), we'll use it a lot
    float tan_theta = tan(theta);

    // The distance Beta we care for the depth map
    float delta = tan_theta * (iDepthDistance - iCamera.origin.z - iDepthHeight);
    float alpha = tan_theta * (iDepthDistance - iCamera.origin.z);
    float beta = alpha - delta;

    // Start the parallax on the intersection point itself
    vec2 point_gluv = sigma;
    float point_height = 0.0;

    /* Main loop */ {
        // The quality of the parallax effect is how tiny the steps are
        // defined in pixels here. '* max_offset' without distortions
        float max_dimension = max(iResolution.x, iResolution.y);
        float max_quality = max_dimension * 0.50;
        float min_quality = max_dimension * 0.05;
        float quality = mix(min_quality, max_quality, iQuality);

        // Optimization: Two swipes, one lower quality (probe) to find
        // nearest intersection with depth map, then flip direction, at finer (quality)
        float probe = mix(50.0, 100.0, iQuality);
        bool swipe = true;
        float i = 1.0;

        for (int stage = 0; stage < 2; stage++) {
            bool FORWARD = (stage == 0);
            bool BACKWARD = (stage == 1);

            while (swipe) {
                // Touched z=1 plane, no intersection
                if (FORWARD) {
                    if (i < 0.0) {
                        swipe = false;
                        break;
                    }
                // Out of bounds walking up
                } else if (1.0 < i) {
                    break;
                }

                // Integrate 'i', the ray parametric distance
                i -= FORWARD ? (1.0 / probe) : (-1.0 / quality);

                // Walk the util distance vector
                vec2 samplePoint = sigma + (i * beta * walk);

                // Interpolate between (0=max) and (0=min) depending on focus
                float true_height = gtexture(iDepth, samplePoint, iDepthMirror).r;
                float depth_height = iDepthHeight * mix(true_height, 1.0 - true_height, iDepthInvert);
                float walk_height = (i * beta) / tan_theta;

                // Stop the first moment we're inside the surface
                if (depth_height >= walk_height) {
                    if (FORWARD) break;
                // Finish when we're outside at smaller steps
                } else if (BACKWARD) {
                    point_height = true_height;
                    point_gluv = samplePoint;
                    break;
                }
            }
        }
    }

    // Start the color with the center point
    gl_FragColor = gtexture(iImage, point_gluv, iDepthMirror);

    // Depth of Field
    if (iDofEnable) {
        float intensity = iDofIntensity * pow(smoothstep(iDofStart, iDofEnd, 1.0 - point_height), iDofExponent);
        vec4 color = gl_FragColor;

        for (float angle = 0.0; angle < TAU; angle += TAU / iDofDirections) {
            for (float walk = 1.0 / iDofQuality; walk <= 1.001; walk += 1.0 / iDofQuality) {
                vec2 displacement = vec2(cos(angle), sin(angle)) * walk * intensity;
                color += gtexture(iImage, point_gluv + displacement, iDepthMirror);
            }
        }
        gl_FragColor = color / (iDofDirections * iDofQuality);
    }

    // Vignette post processing
    if (iVignetteEnable) {
        vec2 away = gluv * (1.0 - gluv.yx);
        float linear = iVignetteIntensity * (away.x * away.y);
        gl_FragColor.rgb *= clamp(pow(linear, iVignetteDecay), 0.0, 1.0);
    }
    //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Placeholder: red color

    if (iViewDepthMap) {
        vec4 depthColor = texture2D(iDepth, vUv);
        gl_FragColor = mix(gl_FragColor, depthColor, iDepthMapOpacity);
    }
}
`;

const DepthFlowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2() },
        iImage: { value: null },
        iDepth: { value: null },
        iDepthHeight: { value: 0.35 },
        iDepthStatic: { value: 0 },
        iDepthFocus: { value: 10 },
        iZoom: { value: 0.5 },
        iFocusCenter: { value: new THREE.Vector2(0, 0) },
        iDepthZoom: { value: 1.0 },
        iDepthIsometric: { value: 0 },
        iDepthDolly: { value: 0 },
        iDepthInvert: { value: 0.39 },
        iDepthCenter: { value: new THREE.Vector2(0.5, 0.5) },
        iDepthOrigin: { value: new THREE.Vector2(0.5, 0.5) },
        iQuality: { value: 1.0 },
        iDofEnable: { value: false },
        iDofIntensity: { value: 0.1 },
        iDofStart: { value: 0.0 },
        iDofEnd: { value: 1.0 },
        iDofExponent: { value: 1.0 },
        iDofDirections: { value: 8 },
        iDofQuality: { value: 4 },
        iVignetteEnable: { value: false },
        iVignetteIntensity: { value: 1.0 },
        iVignetteDecay: { value: 1.5 },
        iDepthOffset: { value: new THREE.Vector2(0, 0) },
        iDepthMirror: { value: false },
        iCameraPosition: { value: new THREE.Vector3(0, 0, 1) },
        iAspectRatio: { value: 1.0 },
        iHeight: { value: 0.0 },
        iZoomFactor: { value: 1 },
        iViewDepthMap: { value: false },
        iDepthMapOpacity: { value: 1 },
    },
    vertexShader,
    fragmentShader: fragmentShaderWithCamera,
});

function DepthFlowScene({ config, imageData, depthData, mouseEnabled, viewDepthMap, depthMapOpacity }) {
    const mesh = useRef();
    const { size, camera } = useThree();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [imageAspect, setImageAspect] = useState(1);

    const material = useMemo(() => {
        const mat = DepthFlowMaterial.clone();

        // Load image texture
        if (imageData && imageData.file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const texture = new THREE.Texture(img);
                    texture.needsUpdate = true;
                    mat.uniforms.iImage.value = texture;
                    mat.needsUpdate = true;

                    // Set image aspect ratio
                    const aspect = img.width / img.height;
                    setImageAspect(aspect);
                    mat.uniforms.iAspectRatio.value = aspect;
                    console.log(aspect);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageData.file);
        }

        // Create depth texture
        if (depthData && depthData.depthArray && depthData.shape) {
            const width = depthData.shape[1];
            const height = depthData.shape[0];

            // Flatten the depth array and normalize values to [0, 1]
            const flatDepthArray = new Float32Array(width * height);
            let minDepth = Infinity;
            let maxDepth = -Infinity;

            for (let i = 0; i < depthData.depthArray.length; i++) {
                for (let j = 0; j < depthData.depthArray[i].length; j++) {
                    const flippedI = depthData.depthArray.length - 1 - i;
                    const value = depthData.depthArray[flippedI][j];
                    minDepth = Math.min(minDepth, value);
                    maxDepth = Math.max(maxDepth, value);
                    flatDepthArray[i * width + j] = value;
                }
            }

            // Normalize the depth values
            for (let i = 0; i < flatDepthArray.length; i++) {
                flatDepthArray[i] = (flatDepthArray[i] - minDepth) / (maxDepth - minDepth);
            }

            const depthTexture = new THREE.DataTexture(
                flatDepthArray,
                width,
                height,
                THREE.RedFormat,
                THREE.FloatType
            );
            depthTexture.needsUpdate = true;
            mat.uniforms.iDepth.value = depthTexture;
        }
        mat.uniforms.iZoomFactor = { value: 1 };

        return mat;
    }, [imageData, depthData, imageAspect]);

    useEffect(() => {
        const handleMouseMove = (event) => {
            setMousePosition({
                x: (event.clientX / window.innerWidth) * 2 - 1,
                y: -(event.clientY / window.innerHeight) * 2 + 1,
            });
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useFrame((state) => {
        if (mesh.current) {
            material.uniforms.iTime.value = state.clock.elapsedTime;
            material.uniforms.iResolution.value.set(size.width, size.height);

            // Update all shader uniforms based on config
            material.uniforms.iDepthHeight.value = config.height;
            material.uniforms.iDepthStatic.value = config.static;
            material.uniforms.iDepthFocus.value = config.focus;
            material.uniforms.iFocusCenter.value.set(config.focusCenterX, config.focusCenterY);
            material.uniforms.iZoom.value = config.zoom;
            material.uniforms.iDepthZoom.value = config.depthZoom;
            material.uniforms.iDepthIsometric.value = config.isometric;
            material.uniforms.iDepthDolly.value = config.dolly;
            material.uniforms.iDepthInvert.value = config.invert;
            material.uniforms.iDepthCenter.value.set(config.depthCenterX, config.depthCenterY);
            material.uniforms.iDepthOrigin.value.set(config.depthOriginX, config.depthOriginY);
            material.uniforms.iQuality.value = config.quality;
            material.uniforms.iDofEnable.value = config.dofEnable > 0.5;
            material.uniforms.iDofIntensity.value = config.dofIntensity;
            material.uniforms.iDofStart.value = config.dofStart;
            material.uniforms.iDofEnd.value = config.dofEnd;
            material.uniforms.iDofExponent.value = config.dofExponent;
            material.uniforms.iDofDirections.value = config.dofDirections;
            material.uniforms.iDofQuality.value = config.dofQuality;
            material.uniforms.iVignetteEnable.value = config.vignetteEnable > 0.5;
            material.uniforms.iVignetteIntensity.value = config.vignetteIntensity;
            material.uniforms.iVignetteDecay.value = config.vignetteDecay;
            material.uniforms.iDepthOffset.value.set(config.depthOffsetX, config.depthOffsetY);
            material.uniforms.iDepthMirror.value = config.depthMirror > 0.5;
            material.uniforms.iViewDepthMap.value = viewDepthMap;
            material.uniforms.iDepthMapOpacity.value = depthMapOpacity;
            material.uniforms.iCameraPosition.value.set(0, 0, 1);

            if (mouseEnabled) {
                // Update iDepthCenter based on mouse movement
                const maxOffset = 0.6;
                const x = mousePosition.x * maxOffset + 0.5;
                const y = mousePosition.y * maxOffset + 0.5;
                material.uniforms.iDepthOrigin.value.set(x, y);
            } else {
                // Reset iDepthCenter position when mouse is disabled
                material.uniforms.iDepthOrigin.value.set(0, 0);
            }
        }
    });

    // Calculate the size of the plane to fit the Three.js canvas
    const { width, height } = size;
    const canvasAspect = width / height;
    let planeWidth, planeHeight;

    if (canvasAspect > imageAspect) {
        // Canvas is wider than the image
        planeWidth = 6;  // Increase this value to zoom in
        planeHeight = planeWidth / imageAspect;
    } else {
        // Canvas is taller than the image
        planeHeight = 6;  // Increase this value to zoom in
        planeWidth = planeHeight * imageAspect;
    }

    return (
        <mesh ref={mesh}>
            <planeGeometry args={[planeWidth, planeHeight]} />
            <primitive object={material} attach="material" />
        </mesh>
    );
}

export default DepthFlowScene;
