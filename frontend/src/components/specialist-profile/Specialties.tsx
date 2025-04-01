import { FC } from 'react';

interface SpecialtiesProps {
  therapeuticApproaches: string[];
  specialtyDisorders: string[];
}

const Specialties: FC<SpecialtiesProps> = ({
  therapeuticApproaches = [],
  specialtyDisorders = []
}) => (
  <section className="bg-white rounded-lg shadow-sm p-6">
    <h2 className="text-xl font-semibold mb-4">Especialidades</h2>
    <div className="space-y-6">
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Enfoques Terapéuticos</h3>
        {therapeuticApproaches && therapeuticApproaches.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {therapeuticApproaches.map((approach, index) => (
              <span key={index} className="px-3 py-1 bg-[#2A6877] bg-opacity-10 text-[#2A6877] rounded-full text-sm">
                {approach}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No se han especificado enfoques terapéuticos.</p>
        )}
      </div>
      <div>
        <h3 className="font-medium text-gray-900 mb-2">Trastornos de Especialidad</h3>
        {specialtyDisorders && specialtyDisorders.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specialtyDisorders.map((disorder, index) => (
              <span key={index} className="px-3 py-1 bg-[#2A6877] bg-opacity-10 text-[#2A6877] rounded-full text-sm">
                {disorder}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No se han especificado trastornos de especialidad.</p>
        )}
      </div>
    </div>
  </section>
);

export default Specialties;