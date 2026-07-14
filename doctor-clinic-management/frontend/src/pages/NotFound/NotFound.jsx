import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Buttons';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <div className="not-found-icon">🏥</div>
        <h1>Page Not Found</h1>
        <p className="text-muted">Oops! The page you're looking for doesn't exist or has been moved.</p>
        <Button size="lg" onClick={() => navigate('/')}>
          ← Go back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
