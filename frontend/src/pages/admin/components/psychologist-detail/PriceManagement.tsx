import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import { CurrencyDollarIcon } from '@heroicons/react/24/solid';

interface PriceManagementProps {
  psychologistId: number;
  suggestedPrice: number | null;
  onPriceUpdated: () => void;
}

interface PsychologistPrice {
  id?: number;
  price: number;
  is_approved: boolean;
  admin_notes: string;
}

// Default configuration values
const DEFAULT_PRICE_CONFIG = {
  min_price: 5000,
  max_price: 50000,
  platform_fee_percentage: 10
};

const PriceManagement: React.FC<PriceManagementProps> = ({ 
  psychologistId, 
  suggestedPrice,
  onPriceUpdated 
}) => {
  const [price, setPrice] = useState<PsychologistPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [priceConfig, setPriceConfig] = useState(DEFAULT_PRICE_CONFIG);
  const [psychologistProfileId, setPsychologistProfileId] = useState<number | null>(null);

  // Fetch price configuration and psychologist profile
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // Fetch price configuration
        const configResponse = await api.get('/pricing/configurations/current/');
        setPriceConfig(configResponse.data);
        
        // Find the psychologist profile ID by user ID
        const profilesResponse = await api.get('/profiles/psychologist-profiles/', {
          params: { user: psychologistId }
        });
        
        if (profilesResponse.data.length > 0) {
          const profileId = profilesResponse.data[0].id;
          console.log(`Found psychologist profile ID: ${profileId} for user ID: ${psychologistId}`);
          setPsychologistProfileId(profileId);
          
          // Now fetch the price using the profile ID
          const priceResponse = await api.get(`/pricing/psychologist-prices/`, {
            params: { psychologist: profileId }
          });
          
          if (priceResponse.data.length > 0) {
            setPrice(priceResponse.data[0]);
            setNewPrice(priceResponse.data[0].price);
            setAdminNotes(priceResponse.data[0].admin_notes || '');
          } else {
            setPrice(null);
            setNewPrice(suggestedPrice || configResponse.data.min_price);
            setAdminNotes('');
          }
        } else {
          toast.error(`No se encontró el perfil del psicólogo para el usuario con ID ${psychologistId}`);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast.error('Error al cargar los datos iniciales');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [psychologistId, suggestedPrice]);

  const handleSavePrice = async () => {
    try {
      if (!psychologistProfileId) {
        toast.error('No se pudo determinar el ID del perfil del psicólogo');
        return;
      }
      
      setLoading(true);
      
      if (newPrice < priceConfig.min_price || newPrice > priceConfig.max_price) {
        toast.error(`El precio debe estar entre ${priceConfig.min_price} y ${priceConfig.max_price} CLP`);
        setLoading(false);
        return;
      }
      
      let response;
      
      if (price?.id) {
        // Update existing price
        response = await api.patch(`/pricing/psychologist-prices/${price.id}/`, {
          price: newPrice,
          is_approved: true,
          admin_notes: adminNotes
        });
      } else {
        // Create new price using the profile ID
        console.log(`Creating new price for psychologist profile ID: ${psychologistProfileId}`);
        response = await api.post('/pricing/psychologist-prices/', {
          psychologist: psychologistProfileId,
          price: newPrice,
          is_approved: true,
          admin_notes: adminNotes
        });
      }
      
      setPrice(response.data);
      setIsEditing(false);
      toast.success('Precio actualizado correctamente');
      
      if (onPriceUpdated) {
        onPriceUpdated();
      }
    } catch (error) {
      console.error('Error saving price:', error);
      toast.error('Error al guardar el precio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center">
        <CurrencyDollarIcon className="w-6 h-6 mr-2 text-[#2A6877]" />
        Gestión de Precio
      </h2>
      
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#2A6877]"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {!isEditing ? (
            <>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Precio sugerido por el psicólogo:</p>
                    <p className="text-lg font-medium">
                      {suggestedPrice !== null 
                        ? `$${suggestedPrice.toLocaleString('es-CL')} CLP` 
                        : 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Precio actual asignado:</p>
                    <p className="text-lg font-medium">
                      {price 
                        ? <span className="text-[#2A6877] font-semibold">${price.price.toLocaleString('es-CL')} CLP</span> 
                        : 'No asignado'}
                    </p>
                  </div>
                </div>
                
                {price && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">Notas administrativas:</p>
                    <p className="text-sm mt-1 bg-white p-2 rounded border border-gray-200">
                      {price.admin_notes || 'Sin notas'}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50"
                >
                  {price ? 'Editar precio' : 'Asignar precio'}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio (CLP)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      min={priceConfig.min_price}
                      max={priceConfig.max_price}
                      value={newPrice}
                      onChange={(e) => setNewPrice(parseInt(e.target.value) || 0)}
                      className="focus:ring-[#2A6877] focus:border-[#2A6877] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">CLP</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    El precio debe estar entre {priceConfig.min_price.toLocaleString('es-CL')} y {priceConfig.max_price.toLocaleString('es-CL')} CLP
                  </p>
                </div>
                
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notas administrativas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="shadow-sm focus:ring-[#2A6877] focus:border-[#2A6877] block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Notas sobre la decisión de precio"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePrice}
                    disabled={loading}
                    className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    ) : 'Guardar precio'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-2 bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Información sobre precios</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    El precio asignado será el que se cobrará a los clientes por las consultas con este psicólogo.
                    La plataforma aplicará una comisión del {priceConfig.platform_fee_percentage}% sobre este valor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceManagement;