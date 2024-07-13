import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div>
      <h2>Welcome, {user?.email || 'Guest'}</h2>
      <button onClick={handleLogout}>Logout</button>
      <button onClick={() => navigate('/depthflow')}>Go to DepthFlow</button>
    </div>
  );
};

export default Home;
