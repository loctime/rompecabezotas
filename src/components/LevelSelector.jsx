// src/components/LevelSelector.jsx
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { getLevelProgress } from '../data/levels';

export const LevelSelector = ({ onSelectLevel }) => {
  const [levels, setLevels] = useState([]);
  
  useEffect(() => {
    setLevels(getLevelProgress());
  }, []);
  
  const currentLevel = levels.find(l => l.unlocked && !l.completed) || levels[0];
  
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #4A9B8E 0%, #2D5F56 100%)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'center',
          marginBottom: '40px',
          marginTop: '20px',
        }}
      >
        <h1 style={{
          fontSize: '64px',
          fontWeight: 'bold',
          margin: 0,
          color: 'white',
          textShadow: '4px 4px 8px rgba(0, 0, 0, 0.3)',
          letterSpacing: '2px',
        }}>
          Jigsolitaire
        </h1>
        <p style={{
          fontSize: '18px',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '10px 0 0 0',
        }}>
          Completa el rompecabezas
        </p>
      </motion.div>
      
      {/* Botón Jugar Nivel Actual */}
      {currentLevel && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          onClick={() => onSelectLevel(currentLevel)}
          style={{
            padding: '20px 60px',
            fontSize: '24px',
            fontWeight: 'bold',
            backgroundColor: '#00BCD4',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            cursor: 'pointer',
            marginBottom: '40px',
            boxShadow: '0 8px 24px rgba(0, 188, 212, 0.4)',
            transition: 'all 0.3s ease',
          }}
          whileHover={{ scale: 1.05, boxShadow: '0 12px 32px rgba(0, 188, 212, 0.5)' }}
          whileTap={{ scale: 0.95 }}
        >
          JUGAR NIVEL {currentLevel.id}
        </motion.button>
      )}
      
      {/* Grid de Niveles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '16px',
        maxWidth: '800px',
        width: '100%',
      }}>
        {levels.map((level, index) => (
          <motion.div
            key={level.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => level.unlocked && onSelectLevel(level)}
            style={{
              aspectRatio: '1',
              borderRadius: '12px',
              overflow: 'hidden',
              cursor: level.unlocked ? 'pointer' : 'not-allowed',
              position: 'relative',
              boxShadow: level.unlocked ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
              transition: 'all 0.3s ease',
            }}
            whileHover={level.unlocked ? { scale: 1.05 } : {}}
          >
            {level.unlocked ? (
              <>
                <div style={{
                  width: '100%',
                  height: '100%',
                  backgroundImage: `url(${level.imageUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: level.completed ? 'brightness(0.7)' : 'none',
                }} />
                {level.completed && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '48px',
                  }}>
                    ✓
                  </div>
                )}
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}>
                  {level.id}
                </div>
              </>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#2D5F56',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}>
                {level.id}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};
