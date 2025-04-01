import { FC } from 'react';

interface PresentationVideoProps {
  videoUrl: string;
}

const PresentationVideo: FC<PresentationVideoProps> = ({ videoUrl }) => {
  // Check if videoUrl is a valid URL or contains HTML content
  const isValidUrl = videoUrl && (
    videoUrl.startsWith('http') || 
    videoUrl.includes('iframe') || 
    videoUrl.includes('youtube') ||
    videoUrl.includes('vimeo')
  );

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Presentación</h2>
      {isValidUrl ? (
        <div className="aspect-video">
          <iframe
            src={videoUrl}
            className="w-full h-full rounded-lg"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="prose max-w-none">
          {/* If it's not a video URL, display as text */}
          <p>{videoUrl || 'No hay información de presentación disponible.'}</p>
        </div>
      )}
    </section>
  );
};

export default PresentationVideo;