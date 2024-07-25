// SignUp.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { auth, createUserWithEmailAndPassword } from '../firebase';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const SignUpContainer = styled.div`
  max-width: 400px;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: all ${props => props.theme.transitions.default};
  animation: ${slideUp} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: ${props => props.delay || '0s'};

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  }
`;

const Button = styled.button`
  padding: 0.75rem;
  background-color: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.default};
  animation: ${slideUp} 0.5s ease-out;
  animation-fill-mode: both;
  animation-delay: 0.2s;

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

const ErrorMessage = styled.p`
  color: var(--error-color);
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SignInLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;
`;

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <SignUpContainer>
      <Title>Sign Up</Title>
      <Form onSubmit={handleSignUp}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          delay="0.1s"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          delay="0.2s"
        />
        <Button type="submit">Sign Up</Button>
      </Form>
      {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      <SignInLink>
        Already have an account? <Button onClick={() => navigate('/signin')}>Sign In</Button>
      </SignInLink>
    </SignUpContainer>
  );
};

export default SignUp;
