import api from './api';

export const getSuggestedPrice = async () => {
  try {
    const response = await api.get('/profiles/psychologist-profiles/me/');
    return {
      suggested_price: response.data.suggested_price
    };
  } catch (error) {
    console.error('Error fetching suggested price:', error);
    throw error;
  }
};

export const updateSuggestedPrice = async (suggestedPrice: number) => {
  try {
    const response = await api.patch('/profiles/psychologist-profiles/me/', {
      suggested_price: suggestedPrice
    });
    return response.data;
  } catch (error) {
    console.error('Error updating suggested price:', error);
    throw error;
  }
};

export const getPriceChangeRequests = async () => {
  try {
    const response = await api.get('/pricing/change-requests/');
    return response.data;
  } catch (error) {
    console.error('Error fetching price change requests:', error);
    throw error;
  }
};

export const createPriceChangeRequest = async (requestedPrice: number, justification: string) => {
  try {
    const response = await api.post('/pricing/change-requests/', {
      requested_price: requestedPrice,
      justification: justification
    });
    return response.data;
  } catch (error) {
    console.error('Error creating price change request:', error);
    throw error;
  }
};