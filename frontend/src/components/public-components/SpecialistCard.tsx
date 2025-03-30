import { Link } from 'react-router-dom';

interface SpecialistCardProps {
  id: number;
  name: string;
  title: string;
  specialties: string;
  experience: string;
  imageUrl: string;
}

const SpecialistCard = ({ id, name, title, specialties, experience, imageUrl }: SpecialistCardProps) => {
  return (
    <div className="bg-white p-6 flex items-start justify-between gap-6 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <Link 
        to={`/especialistas/${id}`} 
        className="flex gap-6 flex-1"
      >
        <div className="w-16 h-16 rounded-full overflow-hidden bg-[#2A6877] flex-shrink-0">
          <img 
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 hover:text-[#2A6877] transition-colors">{name}</h3>
          <p className="text-[#2A6877] text-sm font-medium mt-1">{title}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {specialties.split(', ').map((specialty) => (
              <span key={specialty} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {specialty}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {experience} de experiencia
          </p>
        </div>
      </Link>
      <button 
        className="bg-[#2A6877] text-white px-4 py-1.5 rounded-md hover:bg-[#235A67] transition-colors text-sm font-medium self-start"
        onClick={(e) => e.preventDefault()}
      >
        Agendar
      </button>
    </div>
  );
};

export default SpecialistCard;