import React, { useEffect, useState } from 'react';
import './Eyewatcher.css'; // Make sure to create this CSS file

const EyeWatcher = () => {
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsWatching((prev) => !prev);
    }, 2000); // Eye switches direction every 2 seconds for effect

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="eye-container">
      <div className={`eye ${isWatching ? 'watching' : ''}`}>
        <div className="pupil"></div>
      </div>
    </div>
  );
};

export default EyeWatcher;
