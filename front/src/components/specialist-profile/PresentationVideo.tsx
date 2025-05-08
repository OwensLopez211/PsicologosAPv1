import { FC, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

// Usar la misma lógica que en api.ts para la URL base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://186.64.113.186/api';
// Eliminar '/api' para tener la base correcta para archivos de media
const BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

interface PresentationVideoProps {
  videoUrl: string;
}

const PresentationVideo: FC<PresentationVideoProps> = ({ videoUrl }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoUrl) {
      console.log('PresentationVideo: No videoUrl provided');
      setIsLoading(false);
      return;
    }

    // Process the URL to ensure it's a full URL
    let processedUrl = videoUrl;
    
    // Si la URL es una ruta relativa, anteponer la URL base
    if (videoUrl.startsWith('/media/')) {
      processedUrl = `${BASE_URL}${videoUrl}`;
    }
    
    console.log('PresentationVideo: Processing video URL:', videoUrl);
    console.log('PresentationVideo: Full processed URL:', processedUrl);
    
    // Fetch the video as a blob to avoid CORS issues
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('PresentationVideo: Fetching video from:', processedUrl);
        
        const response = await axios.get(processedUrl, {
          responseType: 'blob',
          headers: {
            'Accept': 'video/*'
          }
        });
        
        // Create a blob URL from the response
        const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'video/mp4' 
        });
        const blobUrl = URL.createObjectURL(blob);
        
        console.log('PresentationVideo: Created blob URL:', blobUrl);
        console.log('PresentationVideo: Content type:', response.headers['content-type']);
        console.log('PresentationVideo: Blob size:', response.data.size);
        
        setVideoBlob(blobUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('PresentationVideo: Error fetching video:', err);
        setError('No se pudo cargar el video');
        setIsLoading(false);
      }
    };
    
    fetchVideo();
    
    // Cleanup function to revoke blob URL when component unmounts
    return () => {
      if (videoBlob) {
        URL.revokeObjectURL(videoBlob);
      }
    };
  }, [videoUrl]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
        setError('Error al reproducir el video');
      });
    }
  };

  return (
    <motion.section 
      className="bg-white rounded-lg shadow-md p-6 overflow-hidden border border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center mb-5">
        <motion.svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-[#2A6877] mr-2" 
          viewBox="0 0 20 20" 
          fill="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </motion.svg>
        <h2 className="text-xl font-bold text-gray-800">Video de Presentación</h2>
      </div>
      
      {!videoUrl ? (
        <motion.div 
          className="aspect-video bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center p-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300 mx-auto mb-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z" clipRule="evenodd" />
              <path d="M8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" />
            </svg>
            <p className="text-gray-500 font-medium">No hay video de presentación disponible</p>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          className="aspect-video bg-black rounded-lg relative overflow-hidden shadow-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {videoBlob && (
            <video 
              ref={videoRef}
              src={videoBlob}
              className="w-full h-full object-cover"
              controls={isPlaying}
              controlsList="nodownload"
              onLoadedData={() => {
                console.log('PresentationVideo: Video loaded successfully');
                setIsLoading(false);
              }}
              onError={(e) => {
                console.error('PresentationVideo: Video error event:', e);
                setError('Error al reproducir el video');
              }}
              autoPlay={false}
              playsInline
            >
              Tu navegador no soporta la reproducción de videos.
            </video>
          )}
          
          {/* Blur overlay with play button */}
          {!isPlaying && !isLoading && !error && videoBlob && (
            <motion.div 
              className="absolute inset-0 backdrop-blur-sm bg-gradient-to-b from-black/40 to-black/60 flex flex-col items-center justify-center cursor-pointer"
              onClick={handlePlayClick}
              whileHover={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            >
              <motion.div 
                className="w-20 h-20 rounded-full bg-[#2A6877] flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-white" 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </motion.div>
              <motion.span 
                className="mt-4 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-white font-medium text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Haz clic para reproducir
              </motion.span>
            </motion.div>
          )}
          
          {/* Loading spinner */}
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="relative">
                {/* Outer spinner */}
                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-t-[#2A6877] border-b-[#2A6877] border-l-transparent border-r-transparent"></div>
                {/* Inner spinner */}
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-white border-b-white border-l-transparent border-r-transparent"></div>
              </div>
            </div>
          )}
          
          {/* Error state */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-white text-center font-medium px-4">{error}</p>
              <button 
                className="mt-4 bg-white text-gray-800 rounded-full px-4 py-2 text-sm font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
            </div>
          )}
        </motion.div>
      )}
    </motion.section>
  );
};

export default PresentationVideo;