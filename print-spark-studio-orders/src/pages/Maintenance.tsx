import React from 'react';
import { useNavigate } from 'react-router-dom';

const Maintenance: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <h1>Maintenance in Progress</h1>
        <p>We're currently performing maintenance on our system. Please check back later.</p>
        <div className="maintenance-info">
          <p>Expected completion time: 30 minutes</p>
          <p>If you're an admin, you can disable maintenance mode from the developer page.</p>
        </div>
      </div>
    </div>
  );
};

export default Maintenance; 