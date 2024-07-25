// Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const HomeContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    margin: 1rem;
    padding: 1rem;
  }
`;

const Title = styled.h2`
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 1.5rem;
  animation: ${slideUp} 0.5s ease-out;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.default};
  animation: ${slideUp} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0s'};

  &:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }
`;

const LogoutButton = styled(Button)`
  background-color: var(--error-color);

  &:hover {
    background-color: #c0392b;
  }
`;

const UserInfo = styled.p`
  text-align: center;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: 0.2s;
  animation-fill-mode: both;
`;

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <HomeContainer>
      <Title>Welcome to Your Dashboard</Title>
      <UserInfo>
        Logged in as: <strong>{user?.email || 'Guest'}</strong>
      </UserInfo>
      <ButtonContainer>
        <Button onClick={() => navigate('/depthflow')} delay="0.3s">
          Go to DepthFlow
        </Button>
        <LogoutButton onClick={handleLogout} delay="0.4s">
          Logout
        </LogoutButton>
      </ButtonContainer>
    </HomeContainer>
  );
};

export default Home;
