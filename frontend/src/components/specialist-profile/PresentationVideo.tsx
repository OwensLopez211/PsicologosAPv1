import { FC } from 'react';

interface PresentationVideoProps {
  videoUrl: string;
}

const PresentationVideo: FC<PresentationVideoProps> = ({ videoUrl }) => (
  <section className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-4">Video de Presentación</h2>
    <div className="aspect-video">
      <iframe
        src={videoUrl}
        className="w-full h-full rounded-lg"
        allowFullScreen
      />
    </div>
  </section>
);

export default PresentationVideo;