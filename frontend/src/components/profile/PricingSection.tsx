import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  getCurrentUserSuggestedPrice, 
  updateSuggestedPrice, 
  getCurrentUserApprovedPrice,
  getPriceConfiguration
} from '../../services/pricingService';

interface PricingSectionProps {
  onLoadingChange?: (loading: boolean) => void;
  isLoading: boolean;
}

const PricingSection = ({ onLoadingChange, isLoading }: PricingSectionProps) => {
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [approvedPrice, setApprovedPrice] = useState<number | null>(null);
  const [newSuggestedPrice, setNewSuggestedPrice] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [priceConfig, setPriceConfig] = useState<{
    min_price: number;
    max_price: number;
    platform_fee_percentage: number;
  } | null>({
    min_price: 30000,
    max_price: 200000,
    platform_fee_percentage: 10
  });

  // Cargar datos iniciales
  useEffect(() => {
    const loadPricingData = async () => {
      try {
        setLocalLoading(true);
        if (onLoadingChange) onLoadingChange(true);
        
        // Cargar configuración de precios
        try {
          const configData = await getPriceConfiguration();
          if (configData) {
            setPriceConfig(configData);
          }
        } catch (error) {
          console.log('Error al cargar configuración de precios, usando valores por defecto');
        }
        
        // Cargar precio sugerido
        try {
          const suggestedData = await getCurrentUserSuggestedPrice();
          console.log('Suggested price data:', suggestedData);
          setSuggestedPrice(suggestedData.price);
          setNewSuggestedPrice(suggestedData.price);
        } catch (error) {
          console.log('No hay precio sugerido aún');
        }
        
        // Cargar precio aprobado
        try {
          const approvedData = await getCurrentUserApprovedPrice();
          console.log('Approved price data:', approvedData);
          setApprovedPrice(approvedData.price);
        } catch (error) {
          console.log('No hay precio aprobado aún');
        }
      } catch (error) {
        console.error('Error cargando datos de precios:', error);
        toast.error('No se pudieron cargar los datos de precios. Intenta de nuevo más tarde.');
      } finally {
        setLocalLoading(false);
        if (onLoadingChange) onLoadingChange(false);
      }
    };
    
    loadPricingData();
  }, [onLoadingChange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSuggestedPrice) {
      toast.error('Por favor, ingresa un precio sugerido.');
      return;
    }
    
    if (priceConfig && (newSuggestedPrice < priceConfig.min_price || newSuggestedPrice > priceConfig.max_price)) {
      toast.error(`El precio debe estar entre ${formatCurrency(priceConfig.min_price)} y ${formatCurrency(priceConfig.max_price)}.`);
      return;
    }
    
    setLocalLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    try {
      const response = await updateSuggestedPrice(newSuggestedPrice);
      console.log('Update suggested price response:', response);
      setSuggestedPrice(response.price);
      toast.success('Precio sugerido actualizado correctamente');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error al actualizar el precio sugerido:', error);
      const errorMessage = error.response?.data?.detail || 
                          'Ocurrió un error al actualizar el precio sugerido. Por favor, inténtalo de nuevo.';
      toast.error(errorMessage);
    } finally {
      setLocalLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  };

  // Calcular el precio después de la comisión de la plataforma
  const calculateNetPrice = (price: number | null) => {
    if (!price || !priceConfig) return null;
    const feePercentage = priceConfig.platform_fee_percentage;
    const feeAmount = (price * feePercentage) / 100;
    return price - feeAmount;
  };

  // Formatear precio en pesos chilenos
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'No definido';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Formatear número con separadores de miles
  const formatNumber = (value: string | number | null) => {
    if (value === null || value === '') return '';
    const numericValue = typeof value === 'string' ? value.replace(/\D/g, '') : String(value);
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Manejar cambio en el campo de precio con formato
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    setNewSuggestedPrice(rawValue ? parseInt(rawValue, 10) : null);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h2 className="text-xl font-semibold text-gray-900">Tarifas</h2>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-md text-[#2A6877] hover:bg-gray-50"
            disabled={localLoading || isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Editar
          </button>
        )}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg border border-gray-200 p-6"
      >
        {/* Vista de información */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Precio sugerido */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Precio sugerido</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Este es el precio que has sugerido para tus sesiones. Está sujeto a aprobación por parte del administrador.
                </p>
                <div className="text-2xl font-bold text-[#2A6877]">
                  {suggestedPrice ? formatCurrency(suggestedPrice) : 'No has sugerido un precio aún'}
                </div>
                {suggestedPrice && priceConfig && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Comisión de la plataforma (50% en la primera sesión de cada cliente nuevo):</p>
                    <p className="font-medium text-gray-700">{formatCurrency(suggestedPrice * 0.5)}</p>
                  </div>
                )}
              </div>

              {/* Precio aprobado */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Precio aprobado</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Este es el precio actual de tus sesiones, aprobado por el administrador.
                </p>
                <div className="text-2xl font-bold text-green-700">
                  {approvedPrice ? formatCurrency(approvedPrice) : 'Pendiente de aprobación'}
                </div>
                {approvedPrice && priceConfig && (
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Comisión de la plataforma (50% en la primera sesión de cada cliente nuevo):</p>
                    <p className="font-medium text-gray-700">{formatCurrency(approvedPrice * 0.5)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            {priceConfig && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-md font-medium text-gray-700 mb-2">Información importante</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>El precio debe estar entre {formatCurrency(priceConfig.min_price)} y {formatCurrency(priceConfig.max_price)}</li>
                  <li>La plataforma cobra una comisión del 50% <strong>solo</strong> en la primera sesión de cada cliente nuevo</li>
                  <li>A partir de la segunda sesión, recibirás el 100% del valor de la consulta</li>
                  <li>Los cambios de precio están sujetos a aprobación por parte del administrador</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          /* Formulario de edición */
          <motion.form 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label htmlFor="suggestedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Precio sugerido (CLP)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="text"
                  name="suggestedPrice"
                  id="suggestedPrice"
                  className="focus:ring-[#2A6877] focus:border-[#2A6877] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md bg-white"
                  placeholder="0"
                  value={formatNumber(newSuggestedPrice)}
                  onChange={handlePriceChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">CLP</span>
                </div>
              </div>
              {priceConfig && (
                <p className="mt-2 text-sm text-gray-500">
                  El precio debe estar entre {formatCurrency(priceConfig.min_price)} y {formatCurrency(priceConfig.max_price)}
                </p>
              )}
              {newSuggestedPrice && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700">Comisión de la plataforma (50% en la primera sesión):</h4>
                  <p className="text-lg font-bold text-[#2A6877]">{formatCurrency(newSuggestedPrice * 0.5)}</p>
                  <p className="text-sm text-gray-600 mt-2">A partir de la segunda sesión con cada cliente, recibirás el 100% del valor.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewSuggestedPrice(suggestedPrice);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={localLoading || isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={localLoading || isLoading}
                className="px-4 py-2 bg-[#2A6877] text-white rounded-md hover:bg-[#235A67] disabled:opacity-50"
              >
                {(localLoading || isLoading) ? (
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
          </motion.form>
        )}
      </motion.div>
    </div>
  );
};

export default PricingSection;