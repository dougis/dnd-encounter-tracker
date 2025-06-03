import { apiService } from '@/services/api';
import { mockFetch } from '../mocks/fetch';

// Mock fetch
global.fetch = mockFetch;

describe('API Service', () => {
  const BASE_URL = 'http://localhost:3001/api/v1';
  
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('should make GET request with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { test: 'data' } }),
    });
    
    const response = await apiService.get('/parties');
    
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/parties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    expect(response).toEqual({ test: 'data' });
  });

  test('should make POST request with correct URL and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { id: 'new-id' } }),
    });
    
    const body = { name: 'Test Party', description: 'Test description' };
    const response = await apiService.post('/parties', body);
    
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/parties`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    expect(response).toEqual({ id: 'new-id' });
  });

  test('should make PUT request with correct URL and body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { updated: true } }),
    });
    
    const body = { name: 'Updated Party' };
    const response = await apiService.put('/parties/123', body);
    
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/parties/123`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    expect(response).toEqual({ updated: true });
  });

  test('should make DELETE request with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { deleted: true } }),
    });
    
    const response = await apiService.delete('/parties/123');
    
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/parties/123`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    expect(response).toEqual({ deleted: true });
  });

  test('should include authorization header when token is available', async () => {
    apiService.setToken('test-token');
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { test: 'data' } }),
    });
    
    await apiService.get('/parties');
    
    expect(mockFetch).toHaveBeenCalledWith(`${BASE_URL}/parties`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
    });
  });

  test('should throw error with error message when request fails', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ 
        success: false, 
        error: { 
          code: 'VALIDATION_ERROR', 
          message: 'Validation failed' 
        } 
      }),
    });
    
    await expect(apiService.get('/parties')).rejects.toThrow('Validation failed');
  });

  test('should throw error with status code when no error message is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ success: false }),
    });
    
    await expect(apiService.get('/parties')).rejects.toThrow('Request failed with status 500');
  });

  test('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    
    await expect(apiService.get('/parties')).rejects.toThrow('Network error');
  });
});
