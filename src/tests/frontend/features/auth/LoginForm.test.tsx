import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/features/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('LoginForm Component', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: false,
    });
  });

  test('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('displays validation errors for empty fields', async () => {
    render(<LoginForm />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('displays validation error for invalid email', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
    
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('calls login function with valid credentials', async () => {
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('disables form submission when loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
    });
    
    render(<LoginForm />);
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  test('shows loading indicator when submitting', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isLoading: true,
    });
    
    render(<LoginForm />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
