import React from 'react';

export const withCardsDecorator = storyFn => (
  <div
    style={{
      width: '100%',
      height: '100vh',
      backgroundColor: '#F5F5F5',
      padding: '50px',
    }}
  >
    <div style={{ width: '300px', margin: 'auto' }}>{storyFn()}</div>
  </div>
);
