import React, { useState, useEffect } from 'react';
import { 
  CurrencyDollarIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface PricingManagementProps {
  psychologistId: number;
  suggestedPrice: number | null;
  approvedPrice: number | null;
  onUpdateApprovedPrice: (price: number) => Promise<void>;
  onRefreshPrices: () => Promise<void>;
}

const PricingManagement: React.FC<PricingManagementProps> = ({
// Removed unused psychologistId parameter
  suggestedPrice,
  approvedPrice,
  onUpdateApprovedPrice,
  onRefreshPrices
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState<number | null>(approvedPrice);
  const [displayPrice, setDisplayPrice] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Update newPrice when approvedPrice changes
  useEffect(() => {
    if (!isEditing) {
      setNewPrice(approvedPrice);
    }
  }, [approvedPrice, isEditing]);

  // Update display price when newPrice changes
  useEffect(() => {
    if (newPrice !== null) {
      setDisplayPrice(formatNumber(newPrice));
    } else {
      setDisplayPrice('');
    }
  }, [newPrice]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'No establecido';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with thousand separators
  const formatNumber = (value: number | null): string => {
    if (value === null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setNewPrice(approvedPrice);
    if (approvedPrice !== null) {
      setDisplayPrice(formatNumber(approvedPrice));
    } else {
      setDisplayPrice('');
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = rawValue ? parseInt(rawValue, 10) : null;
    setNewPrice(numericValue);
    setDisplayPrice(rawValue ? formatNumber(parseInt(rawValue, 10)) : '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPrice === null) {
      toast.error('Por favor, ingrese un precio válido');
      return;
    }
    
    if (newPrice < 0) {
      toast.error('El precio no puede ser negativo');
      return;
    }
    
    setLoading(true);
    try {
      await onUpdateApprovedPrice(newPrice);
      setIsEditing(false);
      toast.success('Precio actualizado correctamente');
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Error al actualizar el precio');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshPrices();
      toast.success('Precios actualizados');
    } catch (error) {
      console.error('Error refreshing prices:', error);
      toast.error('Error al actualizar los precios');
    } finally {
      setRefreshing(false);
    }
  };

  // Use suggested price as new price
  const handleUseSuggestedPrice = () => {
    if (suggestedPrice !== null) {
      setNewPrice(suggestedPrice);
      setDisplayPrice(formatNumber(suggestedPrice));
      if (!isEditing) {
        setIsEditing(true);
      }
    } else {
      toast.error('No hay precio sugerido para usar');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-6 md:mt-8 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-xl"
    >
      <div className="bg-gradient-to-r from-[#2A6877] to-[#3a8a9e] text-white px-3 sm:px-6 py-3 sm:py-5 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3">
            <CurrencyDollarIcon className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <h2 className="text-base sm:text-xl font-semibold">Gestión de Precios</h2>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-white/10 hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
          title="Actualizar precios"
        >
          <ArrowPathIcon className={`h-3.5 w-3.5 sm:h-5 sm:w-5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Precio Sugerido */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md"
          >
            <h3 className="text-sm sm:text-base text-gray-700 font-medium mb-1.5 sm:mb-3 flex items-center">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full mr-1.5 sm:mr-2"></span>
              Precio Sugerido por el Psicólogo
            </h3>
            <p className="text-xl sm:text-3xl font-bold text-gray-800 mb-1.5 sm:mb-3">
              {suggestedPrice !== null ? formatCurrency(suggestedPrice) : 
                <span className="text-gray-400 text-lg sm:text-xl italic">No establecido</span>}
            </p>
            {suggestedPrice !== null && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleUseSuggestedPrice}
                className="mt-1 sm:mt-2 text-xs sm:text-sm bg-blue-500 hover:bg-blue-600 text-white py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow flex items-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Usar este precio
              </motion.button>
            )}
          </motion.div>
          
          {/* Precio Aprobado */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md"
          >
            <h3 className="text-sm sm:text-base text-gray-700 font-medium mb-1.5 sm:mb-3 flex items-center">
              <span className="inline-block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-1.5 sm:mr-2"></span>
              Precio Aprobado
            </h3>
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.form 
                  key="editing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit} 
                  className="flex items-center space-x-2"
                >
                  <div className="relative flex-1">
                    <span className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">$</span>
                    <input
                      type="text"
                      value={displayPrice}
                      onChange={handlePriceChange}
                      className="border border-gray-300 rounded-lg py-1.5 sm:py-2 pl-6 sm:pl-8 pr-2 sm:pr-3 w-full text-sm sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all duration-200"
                      placeholder="Precio"
                      autoFocus
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-green-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleEditToggle}
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </motion.button>
                </motion.form>
              ) : (
                <motion.div 
                  key="display"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between"
                >
                  <p className="text-xl sm:text-3xl font-bold text-gray-800">
                    {approvedPrice !== null ? formatCurrency(approvedPrice) : 
                      <span className="text-gray-400 text-lg sm:text-xl italic">No establecido</span>}
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditToggle}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 p-1.5 sm:p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    title="Editar precio"
                  >
                    <PencilIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
        
        {/* Información adicional */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mt-4 sm:mt-8 text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100"
        >
          <h4 className="font-medium text-blue-700 mb-1.5 sm:mb-2">Información importante</h4>
          <ul className="space-y-1">
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mr-1.5 sm:mr-2"></span>
              <span>El precio sugerido es establecido por el psicólogo.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-1 mr-1.5 sm:mr-2"></span>
              <span>El precio aprobado es el que se mostrará a los clientes.</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-1 mr-1.5 sm:mr-2"></span>
              <span>Los precios son en pesos chilenos (CLP).</span>
            </li>
            <li className="flex items-start">
              <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1 mr-1.5 sm:mr-2"></span>
              <span>La plataforma cobra una comisión del 50% solo en la primera sesión de cada cliente nuevo.</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PricingManagement;