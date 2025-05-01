import React from 'react';

interface DocumentStatusBadgeProps {
  status: string;
}

const DocumentStatusBadge: React.FC<DocumentStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">Pendiente de revisión</span>;
    case 'approved':
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Aprobado</span>;
    case 'rejected':
      return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Rechazado</span>;
    default:
      return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">No subido</span>;
  }
};

export default DocumentStatusBadge;