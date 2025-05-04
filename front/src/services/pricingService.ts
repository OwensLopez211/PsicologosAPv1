import api from './api';

// Obtener el precio sugerido del psicólogo actual
export const getCurrentUserSuggestedPrice = async () => {
  try {
    // Use the my-suggestion endpoint instead of profile ID
    const response = await api.get(`/pricing/suggested-prices/my-suggestion/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested price:', error);
    return { price: null };
  }
};

// Actualizar o crear el precio sugerido
export const updateSuggestedPrice = async (price: number, userId?: number) => {
  try {
    // Si no se proporciona userId, intentar obtenerlo del localStorage
    if (!userId) {
      const userData = localStorage.getItem('user');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          userId = user.id;
          console.log('User ID obtenido del localStorage:', userId);
        } catch (error) {
          console.error('Error al parsear los datos del usuario:', error);
        }
      }
    } else {
      console.log('User ID recibido como parámetro:', userId);
    }
    
    // Incluir el user_id en la solicitud
    const payload = { 
      price,
      user_id: userId 
    };
    
    console.log('Enviando solicitud con payload:', payload);
    
    const response = await api.post(`/pricing/suggested-prices/my__ssuggestion/`, payload);
    console.log('Respuesta recibida:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error updating suggested price:', error);
    throw error;
  }
};

// Obtener el precio aprobado del psicólogo actual
export const getCurrentUserApprovedPrice = async () => {
  try {
    // Use the my_price endpoint
    const response = await api.get(`/pricing/psychologist-prices/my-price/`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching approved price:', error);
    
    if (error.response && error.response.status === 404) {
      console.log('No price has been set for this psychologist yet');
      return { price: null };
    }
    
    return { price: null };
  }
};

// Obtener la configuración de precios actual (min, max, etc.)
export const getPriceConfiguration = async () => {
  try {
    // Using the configurations endpoint from your router
    const response = await api.get('/pricing/configurations/current/');
    return response.data;
  } catch (error) {
    console.error('Error fetching price configuration:', error);
    return {
      min_price: 2000,
      max_price: 15000,
      platform_fee_percentage: 10
    };
  }
};