import React, { useEffect, useState } from 'react';

const DebugInfo = () => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const info = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      devicePixelRatio: window.devicePixelRatio,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availWidth: window.screen.availWidth,
      },
      userAgent: navigator.userAgent,
      computedFontSize: window.getComputedStyle(document.documentElement).fontSize,
      bodyFontSize: window.getComputedStyle(document.body).fontSize,
      zoom: window.outerWidth / window.innerWidth,
    };
    setDebugInfo(info);

    // Log everything to console
    console.log('=== RENDER DEBUG INFO ===');
    console.table(info);
    console.log('========================');
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      background: '#000',
      color: '#0f0',
      padding: '15px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '400px',
      maxHeight: '300px',
      overflow: 'auto',
      borderRadius: '5px',
      border: '2px solid #0f0',
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>🔧 Debug Info</h3>
      <pre style={{ margin: 0 }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

export default DebugInfo;
