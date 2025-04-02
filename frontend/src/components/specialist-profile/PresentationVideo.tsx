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

  // Placeholder video URL
  const placeholderVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Replace with your actual placeholder

  return (
    <section className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Video de Presentación</h2>
      <div className="aspect-video">
        <iframe
          src={isValidUrl ? videoUrl : placeholderVideoUrl}
          className="w-full h-full rounded-lg"
          allowFullScreen
          title="Presentación del especialista"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  );
};

export default PresentationVideo;