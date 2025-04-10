import React, { useState, useEffect } from 'react';
import { getSuggestedPrice, updateSuggestedPrice } from '../../services/pricingService';
import toast from 'react-hot-toast';

interface SuggestedPriceFieldProps {
  initialPrice?: number | null;
  onPriceUpdate?: (price: number) => void;
}

const SuggestedPriceField: React.FC<SuggestedPriceFieldProps> = ({ 
  initialPrice = null, 
  onPriceUpdate 
}) => {
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(initialPrice);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialPrice !== undefined && initialPrice !== null) {
      setSuggestedPrice(initialPrice);
    } else {
      fetchSuggestedPrice();
    }
  }, [initialPrice]);

  const fetchSuggestedPrice = async () => {
    try {
      setIsLoading(true);
      const data = await getSuggestedPrice();
      setSuggestedPrice(data.suggested_price);
    } catch (error) {
      console.error('Error al obtener el precio sugerido:', error);
      toast.error('No se pudo cargar el precio sugerido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (suggestedPrice === null) {
      toast.error('Por favor, ingresa un precio sugerido');
      return;
    }
    
    if (suggestedPrice < 0 || suggestedPrice > 15000) {
      toast.error('El precio sugerido debe estar entre 0 y 15.000 CLP');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await updateSuggestedPrice(suggestedPrice);
      toast.success('Precio sugerido actualizado correctamente');
      setIsEditing(false);
      if (onPriceUpdate) {
        onPriceUpdate(suggestedPrice);
      }
    } catch (error: any) {
      console.error('Error al actualizar el precio sugerido:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Ocurrió un error al actualizar el precio sugerido. Por favor, inténtalo de nuevo.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl bg-[#f0f9ff] p-2 rounded-full">💰</span>
          <h2 className="text-xl font-semibold text-gray-900">Precio Sugerido</h2>
        </div>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-[#f0f9ff] transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
        ) : (
          <div className="text-sm text-gray-500 bg-[#f0f9ff] px-3 py-1 rounded-md">
            Sugiere un precio para tus consultas
          </div>
        )}
      </div>

      {!isEditing ? (
        <div className="bg-gradient-to-r from-[#f0f9ff] to-[#e6f7ff] rounded-lg p-5 border border-[#e1f0fb]">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">Precio sugerido:</span>
              <span className="font-semibold text-[#2A6877] text-lg bg-white px-4 py-2 rounded-md border border-[#d1e9f7] shadow-sm">
                {suggestedPrice !== null ? `$${suggestedPrice.toLocaleString('es-CL')} CLP` : 'No establecido'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 bg-white p-3 rounded-md border border-[#d1e9f7]">
              <span className="inline-block mr-2 text-[#2A6877]">💡</span>
              Este es el precio que sugieres para tus consultas. El equipo administrativo establecerá el precio final.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gradient-to-r from-[#f0f9ff] to-[#e6f7ff] rounded-lg p-5 border border-[#e1f0fb]">
          <div className="space-y-4">
            <div>
              <label htmlFor="suggestedPrice" className="block text-sm font-medium text-gray-700 mb-2">
                Precio sugerido (CLP)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-[#2A6877] font-medium sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="suggestedPrice"
                  id="suggestedPrice"
                  min="0"
                  max="15000"
                  value={suggestedPrice !== null ? suggestedPrice : ''}
                  onChange={(e) => setSuggestedPrice(parseInt(e.target.value) || 0)}
                  className="focus:ring-[#2A6877] focus:border-[#2A6877] block w-full pl-7 pr-20 py-3 sm:text-lg border-gray-300 rounded-md bg-white shadow-sm"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[#2A6877] font-medium sm:text-sm bg-[#f0f9ff] px-2 py-1 rounded-md">CLP</span>
                </div>
              </div>
              <div className="mt-3 flex items-center bg-white p-3 rounded-md border border-[#d1e9f7]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2A6877] mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-gray-600">
                  El precio máximo que puedes sugerir es de <span className="font-semibold">15.000 CLP</span>.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] disabled:opacity-50 transition-colors duration-200 shadow-sm"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default SuggestedPriceField;