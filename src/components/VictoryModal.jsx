// src/components/VictoryModal.jsx
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export const VictoryModal = ({ isOpen, moves, time, onNextLevel, onRetry }) => {
  useEffect(() => {
    if (isOpen) {
      // Confetti effect podría agregarse aquí
      console.log('🎉 ¡Nivel completado!');
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.5, y: 100 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{
          background: 'linear-gradient(135deg, #4A9B8E 0%, #2D5F56 100%)',
          borderRadius: '24px',
          padding: '40px',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          color: 'white',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{ fontSize: '80px', marginBottom: '20px' }}
        >
          🎉
        </motion.div>
        
        <h2 style={{ fontSize: '36px', margin: '0 0 20px 0', fontWeight: 'bold' }}>
          ¡Completado!
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '20px', 
          marginBottom: '30px',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '20px',
          borderRadius: '12px',
        }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Movimientos</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{moves}</div>
          </div>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>Tiempo</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{formatTime(time)}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={onNextLevel}
            style={{
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: 'bold',
              backgroundColor: '#FFD700',
              color: '#2D5F56',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 215, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.3)';
            }}
          >
            Siguiente Nivel
          </button>
          
          <button
            onClick={onRetry}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Reintentar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
