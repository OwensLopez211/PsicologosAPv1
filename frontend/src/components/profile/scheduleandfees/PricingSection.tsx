import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  getCurrentUserSuggestedPrice, 
  updateSuggestedPrice, 
  getCurrentUserApprovedPrice,
  getPriceConfiguration
} from '../../../services/pricingService';
import { CheckIcon, PencilIcon, CurrencyDollarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

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
  const [saveSuccess, setSaveSuccess] = useState(false);
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
          setSuggestedPrice(suggestedData.price);
          setNewSuggestedPrice(suggestedData.price);
        } catch (error) {
          console.log('No hay precio sugerido aún');
        }
        
        // Cargar precio aprobado
        try {
          const approvedData = await getCurrentUserApprovedPrice();
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

  // Reset success message after delay
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess]);

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
      setSuggestedPrice(response.price);
      setSaveSuccess(true);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1 
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.3 } 
    }
  };

  return (
    <motion.div 
      className="space-y-4 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-[#2A6877] text-white">
            <motion.span 
              className="text-2xl"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              💰
            </motion.span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Tarifas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Configura el precio de tus sesiones de terapia</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-sm"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Guardado</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {!isEditing ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-[#2A6877] text-sm font-medium rounded-full text-[#2A6877] hover:bg-[#2A6877] hover:text-white transition-all shadow-sm"
                disabled={localLoading || isLoading}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Editar
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Vista de información */}
      <AnimatePresence>
        {!isEditing ? (
          <motion.div 
            variants={itemVariants}
            className="mt-4 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Precio sugerido */}
              <motion.div 
                className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-5 rounded-xl border border-blue-100 shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-blue-100/80 rounded-lg text-blue-600">
                    <CurrencyDollarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Precio sugerido</h3>
                    <p className="text-sm text-gray-600">
                      Este es el precio que has sugerido para tus sesiones
                    </p>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-[#2A6877] mb-3">
                  {suggestedPrice ? formatCurrency(suggestedPrice) : 'No definido'}
                </div>
                
                {suggestedPrice ? (
                  <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg text-sm text-gray-600 border border-blue-100/50">
                    <div className="flex items-center gap-1 text-blue-600 font-medium mb-1">
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>Primera sesión (cada cliente)</span>
                    </div>
                    <p>Comisión plataforma (50%): {formatCurrency(suggestedPrice * 0.5)}</p>
                    <p>Tu ganancia: {formatCurrency(suggestedPrice * 0.5)}</p>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-600">
                    Haz clic en "Editar" para sugerir un precio para tus sesiones
                  </div>
                )}
              </motion.div>

              {/* Precio aprobado */}
              <motion.div 
                className="bg-gradient-to-br from-green-50 to-green-100/50 p-5 rounded-xl border border-green-100 shadow-sm"
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-green-100/80 rounded-lg text-green-600">
                    <CheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Precio aprobado</h3>
                    <p className="text-sm text-gray-600">
                      Precio actual aprobado por el administrador
                    </p>
                  </div>
                </div>
                
                <div className="text-3xl font-bold text-green-700 mb-3">
                  {approvedPrice ? formatCurrency(approvedPrice) : 'Pendiente de aprobación'}
                </div>
                
                {approvedPrice ? (
                  <div className="bg-white/70 backdrop-blur-sm p-3 rounded-lg text-sm text-gray-600 border border-green-100/50">
                    <div className="flex items-center gap-1 text-green-600 font-medium mb-1">
                      <InformationCircleIcon className="w-4 h-4" />
                      <span>Primera sesión (cada cliente)</span>
                    </div>
                    <p>Comisión plataforma (50%): {formatCurrency(approvedPrice * 0.5)}</p>
                    <p>Tu ganancia: {formatCurrency(approvedPrice * 0.5)}</p>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100 text-sm text-green-600">
                    {suggestedPrice ? 'Tu precio sugerido está pendiente de aprobación' : 'Sugiere un precio para comenzar el proceso de aprobación'}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Información adicional */}
            {priceConfig && (
              <motion.div 
                className="mt-4 p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm"
                variants={itemVariants}
              >
                <div className="flex items-center gap-2 text-[#2A6877] mb-3">
                  <InformationCircleIcon className="w-5 h-5" />
                  <h3 className="font-semibold">Información importante</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Rango de precios</h4>
                    <p className="text-gray-600 text-sm">El precio debe estar entre:</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="bg-[#2A6877]/10 text-[#2A6877] px-2 py-1 rounded text-sm font-medium">
                        Mínimo: {formatCurrency(priceConfig.min_price)}
                      </span>
                      <span className="bg-[#2A6877]/10 text-[#2A6877] px-2 py-1 rounded text-sm font-medium">
                        Máximo: {formatCurrency(priceConfig.max_price)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-700 mb-1 text-sm">Comisiones</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li className="flex items-center gap-1">
                        <CheckIcon className="w-4 h-4 text-green-500" />
                        <span>50% <strong>solo</strong> en la primera sesión de cada cliente</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <CheckIcon className="w-4 h-4 text-green-500" />
                        <span>100% del valor a partir de la segunda sesión</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-3 italic">
                  Los cambios de precio están sujetos a aprobación por parte del administrador
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* Formulario de edición */
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-6 mt-6"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-5 shadow-sm">
              <div className="mb-4">
                <label htmlFor="suggestedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio sugerido (CLP)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="text"
                    name="suggestedPrice"
                    id="suggestedPrice"
                    className="focus:ring-[#2A6877] focus:border-[#2A6877] block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg bg-white/90"
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
                  <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                    <InformationCircleIcon className="w-4 h-4" />
                    El precio debe estar entre {formatCurrency(priceConfig.min_price)} y {formatCurrency(priceConfig.max_price)}
                  </p>
                )}
              </div>

              {newSuggestedPrice ? (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-100">
                  <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                    <span>Simulación de ganancias</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-blue-100">
                      <h5 className="text-sm font-medium text-blue-700 mb-1">Primera sesión (cada cliente nuevo)</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Precio total:</span>
                          <span className="font-medium">{formatCurrency(newSuggestedPrice)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Comisión (50%):</span>
                          <span className="font-medium">{formatCurrency(newSuggestedPrice * 0.5)}</span>
                        </div>
                        <div className="flex justify-between text-[#2A6877] font-semibold border-t border-blue-100 pt-1 mt-1">
                          <span>Tu ganancia:</span>
                          <span>{formatCurrency(newSuggestedPrice * 0.5)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-green-100">
                      <h5 className="text-sm font-medium text-green-700 mb-1">Segunda sesión en adelante</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Precio total:</span>
                          <span className="font-medium">{formatCurrency(newSuggestedPrice)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Comisión (0%):</span>
                          <span className="font-medium">{formatCurrency(0)}</span>
                        </div>
                        <div className="flex justify-between text-green-700 font-semibold border-t border-green-100 pt-1 mt-1">
                          <span>Tu ganancia:</span>
                          <span>{formatCurrency(newSuggestedPrice)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-sm text-yellow-700">
                  Ingresa un precio para ver la simulación de ganancias
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setNewSuggestedPrice(suggestedPrice);
                }}
                className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] transition-all"
                disabled={localLoading || isLoading}
              >
                Cancelar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={localLoading || isLoading}
                className="inline-flex justify-center py-2 px-5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#2A6877] to-[#235A67] hover:from-[#235A67] hover:to-[#1A4652] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2A6877] disabled:opacity-50 transition-all"
              >
                {(localLoading || isLoading) ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Guardar cambios
                    <CheckIcon className="ml-2 h-4 w-4" />
                  </span>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PricingSection;