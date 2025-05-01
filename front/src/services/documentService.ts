import api from './api';

// Cache mechanism
let documentsCache: any[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 30000; // 30 seconds cache

// Track failed requests to prevent infinite loops
let failedRequests = 0;
const MAX_RETRIES = 3;
let isFetching = false; // Flag to prevent concurrent requests

export const uploadDocument = async (formData: FormData) => {
  try {
    // Invalidate cache when uploading new document
    documentsCache = [];
    lastFetchTime = 0;
    
    const response = await api.post('/profiles/psychologist-profiles/me/upload-verification-document/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

export const getDocuments = async (forceRefresh = false) => {
  // Return cached data if available and not expired
  const now = Date.now();
  if (!forceRefresh && documentsCache.length > 0 && (now - lastFetchTime) < CACHE_DURATION) {
    console.log('Using cached documents data');
    return documentsCache;
  }
  
  // If already fetching, return the cached data or empty array
  if (isFetching) {
    console.log('Request already in progress, using cached data');
    return documentsCache.length > 0 ? documentsCache : [];
  }
  
  try {
    // Prevent infinite loops by checking failed requests
    if (failedRequests >= MAX_RETRIES) {
      console.error('Maximum retries reached for document fetching');
      failedRequests = 0; // Reset for next attempt
      return documentsCache.length > 0 ? documentsCache : []; // Return cached data or empty array
    }
    
    isFetching = true;
    failedRequests++;
    
    const response = await api.get('/profiles/psychologist-profiles/me/documents/');
    
    // Reset counters on success
    failedRequests = 0;
    isFetching = false;
    
    // Check if response is empty or malformed
    if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
      console.log('No documents found or empty response');
      documentsCache = []; // Update cache with empty array
      lastFetchTime = now; // Update last fetch time
      return [];
    }
    
    // Update cache
    documentsCache = response.data;
    lastFetchTime = now;
    
    return response.data;
  } catch (error) {
    console.error('Error fetching documents:', error);
    isFetching = false;
    
    // Return cached data on error after max retries
    if (failedRequests >= MAX_RETRIES) {
      failedRequests = 0; // Reset for next attempt
      return documentsCache.length > 0 ? documentsCache : []; // Return cached data or empty array
    }
    throw error;
  }
};

export const deleteDocument = async (documentType: string) => {
  try {
    // Invalidate cache when deleting document
    documentsCache = [];
    lastFetchTime = 0;
    failedRequests = 0; // Reset counter on new request
    
    const response = await api.delete(`/profiles/psychologist-profiles/me/documents/?document_type=${documentType}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};