// src/components/LoadingSpinner.jsx
import './LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', fullPage = false }) => {
  const spinnerClass = `spinner ${size}`;
  
  if (fullPage) {
    return (
      <div className="loading-full-page">
        <div className={spinnerClass}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return <div className={spinnerClass}></div>;
};

export const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  return (
    <div className="skeleton-loader">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className={`skeleton skeleton-${type}`}></div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
