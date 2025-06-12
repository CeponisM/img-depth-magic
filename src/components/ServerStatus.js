import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for fade-in effect
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// Styled component for the server status container
const ServerStatusContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #d32f2f; /* Matches ErrorMessage background for consistency */
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  z-index: 12; /* Higher than LoadingOverlay and ErrorMessage */
  font-size: 1.25rem;
  font-weight: 500;
  max-width: 90%;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: 768px) {
    font-size: 1rem;
    padding: 1rem 1.5rem;
  }
`;

// Styled component for a subtle icon or visual indicator
const StatusIcon = styled.span`
  display: inline-block;
  margin-right: 0.5rem;
  font-size: 1.5rem;
  line-height: 1;
  vertical-align: middle;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

// Styled component for a retry suggestion
const RetryText = styled.p`
  margin-top: 0.75rem;
  font-size: 0.9rem;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

function ServerStatus() {
  return (
    <ServerStatusContainer role="alert" aria-live="assertive">
      <StatusIcon aria-hidden="true">⚠️</StatusIcon>
      Server Unavailable
      <RetryText>
        The server for generating depth maps is currently down. Please try again later.
      </RetryText>
    </ServerStatusContainer>
  );
}

export default ServerStatus;
