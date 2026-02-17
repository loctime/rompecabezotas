// src/components/Header.jsx
import { motion } from 'framer-motion';

export const Header = ({ levelNumber, onSettings, showBackButton, onBack }) => {
  return (
    <motion.header 
      className="game-header"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        color: 'white',
      }}
    >
      {showBackButton ? (
        <button 
          onClick={onBack}
          className="icon-button"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '12px',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '24px',
            transition: 'all 0.3s ease',
          }}
        >
          ←
        </button>
      ) : (
        <div style={{ width: '48px' }} />
      )}
      
      <h1 
        style={{
          fontSize: '32px',
          fontWeight: 'bold',
          margin: 0,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        {levelNumber ? `NIVEL ${levelNumber}` : 'JIGSOLITAIRE'}
      </h1>
      
      <button 
        onClick={onSettings}
        className="icon-button"
        style={{
          background: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '12px',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '24px',
          transition: 'all 0.3s ease',
        }}
      >
        ⚙️
      </button>
    </motion.header>
  );
};
