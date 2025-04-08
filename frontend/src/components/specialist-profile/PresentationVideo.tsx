import { FC, useState, useEffect, useRef } from 'react';
import axios from 'axios';

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
      setIsLoading(false);
      return;
    }

    // Process the URL to ensure it's a full URL
    let processedUrl = videoUrl;
    
    // If the URL is a relative path, prepend the backend URL
    if (videoUrl.startsWith('/media/')) {
      processedUrl = `http://localhost:8000${videoUrl}`;
    }
    
    // Fetch the video as a blob to avoid CORS issues
    const fetchVideo = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Fetching video from:', processedUrl);
        
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
        
        console.log('Created blob URL:', blobUrl);
        setVideoBlob(blobUrl);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching video:', err);
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
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Video de Presentación</h2>
      
      {!videoUrl ? (
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">No hay video de presentación disponible</p>
        </div>
      ) : (
        <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
          {videoBlob && (
            <video 
              ref={videoRef}
              src={videoBlob}
              className="w-full h-full"
              controls={isPlaying}
              controlsList="nodownload"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setError('Error al reproducir el video')}
              autoPlay={false}
              playsInline
            >
              Tu navegador no soporta la reproducción de videos.
            </video>
          )}
          
          {/* Blur overlay with play button */}
          {!isPlaying && !isLoading && !error && videoBlob && (
            <div 
              className="absolute inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center cursor-pointer"
              onClick={handlePlayClick}
            >
              <div className="w-20 h-20 rounded-full bg-primary-600 bg-opacity-80 flex items-center justify-center transition-transform hover:scale-110">
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
              </div>
              <span className="absolute bottom-4 text-white font-medium">
                Haz clic para reproducir
              </span>
            </div>
          )}
          
          {isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <p className="text-white text-center px-4">{error}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PresentationVideo;