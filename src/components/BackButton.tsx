import { useNavigate } from 'react-router-dom';
import React from 'react';

interface BackButtonProps {
  label?: string;
  to?: string | null;
  adminMode?: boolean;
  onClick?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  label = 'Back',
  to = null,
  adminMode = false,
  onClick = undefined
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else if (adminMode) {
      navigate('/admin/dashboard');
    } else {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="back-button-container">
      <button
        className="back-button"
        onClick={handleClick}
        type="button"
      >
        <span className="back-arrow">←</span>
        <span className="back-label">{label}</span>
      </button>
    </div>
  );
};

export default BackButton;
