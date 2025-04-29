import { motion } from 'framer-motion';
import { useState, useEffect, Children, isValidElement, ReactNode, ReactElement } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  variant?: 'fade' | 'slide' | 'scale' | 'slideUp' | 'stagger';
}

const PageTransition = ({ children, variant = 'fade' }: PageTransitionProps) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Variantes de animación
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    },
    slide: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 1.05 }
    },
    stagger: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  };

  // Configuraciones de transición para cada variante
  const transitions = {
    fade: { duration: 0.4, ease: "easeInOut" },
    slide: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    slideUp: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    scale: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    stagger: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], staggerChildren: 0.1 }
  };

  return (
    <motion.div
      initial={variants[variant].initial}
      animate={variants[variant].animate}
      exit={variants[variant].exit}
      transition={transitions[variant]}
      style={{
        width: '100%',
        height: '100%',
        willChange: 'opacity, transform'
      }}
    >
      {variant === 'stagger' ? (
        <StaggeredChildren>{children}</StaggeredChildren>
      ) : (
        children
      )}
    </motion.div>
  );
};

// Componente para animar elementos hijos de forma escalonada
const StaggeredChildren = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ staggerChildren: 0.1 }}
      style={{ width: '100%', height: '100%' }}
    >
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        
        return (
          <motion.div
            key={i}
            variants={{
              initial: { opacity: 0, y: 15 },
              animate: { 
                opacity: 1, 
                y: 0,
                transition: { delay: i * 0.1, duration: 0.4 }
              },
              exit: { 
                opacity: 0, 
                y: -10,
                transition: { duration: 0.2 }
              }
            }}
    >
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default PageTransition;