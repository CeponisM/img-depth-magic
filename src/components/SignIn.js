// SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword } from '../firebase';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const SignInContainer = styled.div`
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

const GoogleButton = styled(Button)`
  background-color: #db4437;
  animation-delay: 0.3s;

  &:hover {
    background-color: #c1351d;
  }
`;

const ErrorMessage = styled.p`
  color: var(--error-color);
  text-align: center;
  animation: ${fadeIn} 0.3s ease-out;
`;

const SignUpLink = styled.p`
  text-align: center;
  margin-top: 1rem;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: 0.4s;
  animation-fill-mode: both;
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #777;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: 0.3s;
  animation-fill-mode: both;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  &::before {
    margin-right: .5em;
  }

  &::after {
    margin-left: .5em;
  }
`;

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();

  const handleEmailSignIn = async (event) => {
    event.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <SignInContainer>
      <Title>Sign In</Title>
      <Form onSubmit={handleEmailSignIn}>
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
        <Button type="submit">Sign in with Email</Button>
      </Form>
      <OrDivider>or</OrDivider>
      <GoogleButton onClick={handleGoogleSignIn}>Sign in with Google</GoogleButton>
      {error && <ErrorMessage>Error: {error}</ErrorMessage>}
      <SignUpLink>
        Don't have an account? <Button onClick={() => navigate('/signup')}>Sign Up</Button>
      </SignUpLink>
    </SignInContainer>
  );
};

export default SignIn;
