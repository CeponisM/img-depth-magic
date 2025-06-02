# Image Depth Magic

**Image Depth Magic** is an educational, non-profit web application that transforms 2D images into immersive 2.5D/3D parallax effects, inspired by the [DepthFlow project](https://github.com/DepthFlow/DepthFlow). Built as a learning tool, it allows users to upload images, generate depth maps, and apply dynamic parallax effects using customizable controls. This project leverages React, Three.js (via `@react-three/fiber`), and Firebase for storage, offering an interactive experience to explore 3D visualization techniques.

## ✨ Features

- **2D to 2.5D/3D Parallax Effect**: Convert static images into dynamic scenes with depth-based motion
- **Depth Map Generation**: Automatically generate depth maps for uploaded images using an external custom API using [Depth-Anything-v2](https://huggingface.co/onnx-community/depth-anything-v2-large) model
- **Interactive Controls**: Adjust parameters like focus, zoom, depth offset, and depth of field (DoF) with real-time feedback
  - Enable/disable mouse interaction
  - Toggle depth map visibility and adjust opacity
  - Loop control values (e.g., `focusCenterX`) within custom ranges for animated effects
- **Firebase Storage**: Securely upload and store images using Firebase Storage
- **Responsive Design**: Optimized for desktop and mobile devices
- **Educational Purpose**: Designed as a non-profit project to teach 3D visualization, WebGL, and React concepts

## 🚀 Demo

### Visual Example
Below is a static image used and animated demonstrating the applications parallax effect:

<img src="assets/imgMagic.jpeg" alt="Static Image" width="400" />
<img src="assets/imgMagic.gif" alt="Parallax Effect GIF" width="400" />

### Video Showcase
Watch the parallax effect in action:

<iframe width="668" height="417" src="https://www.youtube-nocookie.com/embed/AXZtKgwsfBc?si=eEa4NPBrIweHRO5I" title="Image Depth Magic Demo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

## 📋 Prerequisites

- **Node.js** (v14 or higher) and **npm** (v6 or higher)
- **Firebase Account**: For image storage
- **Depth Map API**: An API endpoint for generating depth maps (e.g., MiDaS-based service)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/ceponism/img-depth-magic.git
cd img-depth-magic
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env` file in the project root:
```bash
touch .env
```

Add the following, replacing placeholders with your Firebase and API credentials:
```env
REACT_APP_API_URL=https://your-depth-map-api-endpoint.com/api/depth
```

> **Note**: Get Firebase credentials from your Firebase Console under Project Settings. Ensure `.env` is listed in `.gitignore` to prevent committing sensitive data.

### 4. Configure Firebase
Firebase is already configured in `src/firebase.js`:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut, storage };
```

Set up Storage rules in the Firebase Console to allow authenticated uploads (adjust as needed).

### 5. Run the Application
```bash
npm start
```

The app will run at `http://localhost:3000/` (or the port specified in your configuration).

### 6. Build for Production
```bash
npm run build
```

Deploy the `build/` folder to a static hosting service (e.g., Firebase Hosting, Netlify, Vercel).

## 🎮 Usage

### Upload an Image
Use the file upload component to select a 2D image. The image is uploaded to Firebase Storage, and a depth map is generated via the configured API.

### Adjust Controls
1. Open the control panel (top-right corner)
2. Modify parameters like focus, zoom, `focusCenterX`, etc., using sliders

### Loop Settings
1. Click "Show Loop Settings" for a control
2. Set custom Min, Max, and Speed for looping (e.g., `focusCenterX` from -0.5 to 0.5)
3. Enable "Loop" to animate the control value

### Interactive Features
- Toggle "Enable Mouse" to interact with the scene via mouse movements
- Toggle "View Depth Map" to see the generated depth map, and adjust "Depth Map Opacity"
- Move the mouse (if enabled) or adjust controls to see the 2.5D/3D effect
- Use looping to create dynamic animations

## 💡 Project Inspiration

**Image Depth Magic** draws inspiration from the [DepthFlow project](https://github.com/DepthFlow/DepthFlow), which explores depth-based 3D effects using WebGL. As an educational project, it aims to teach:

- 3D visualization with Three.js and `@react-three/fiber`
- Depth map generation and integration
- Real-time shader manipulation via customizable controls
- Cloud storage integration with Firebase

This project is non-profit, created to provide a hands-on learning experience for students and developers interested in computer graphics and web development.

## 📦 Dependencies

Key dependencies used in this project:

- **React**: ^18.3.1 - Frontend framework
- **@react-three/fiber**: ^8.16.8 - Three.js integration
- **Firebase**: ^11.8.1 - Image storage
- **Styled Components**: ^6.1.11 - CSS-in-JS styling
- **Material-UI**: ^5.16.1 - UI components
- **React Router**: ^6.24.1 - Client-side routing
- **Lodash**: ^4.17.21 - Utility functions

## 🤝 Contributing

As an educational project, contributions are welcome to enhance learning outcomes. To contribute:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. **Open** a Pull Request with a clear description

Please follow the code style (ESLint configured via `react-app`) and include tests if applicable.

## 📄 License

This project is licensed under the MIT License for educational and non-profit use. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>🎓 Educational • 🆓 Non-Profit • 🌟 Open Source</strong>
</div>