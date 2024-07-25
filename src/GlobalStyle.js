import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --background-color: #f4f4f4;
    --text-color: #333;
    --error-color: #e74c3c;
  }

  body {
    font-family: 'Roboto', sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

export default GlobalStyle;
