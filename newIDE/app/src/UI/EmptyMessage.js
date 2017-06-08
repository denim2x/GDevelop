import React from 'react';

export default props => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: 10,
    }}
  >
    <span
      style={{
        opacity: 0.4,
        textAlign: 'center',
        fontSize: '13px',
        textShadow: '1px 1px 0px white',
      }}
    >
      {props.children}
    </span>
  </div>
);