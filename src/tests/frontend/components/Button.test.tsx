import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button Component', () => {
  test('renders button with correct text', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeDisabled();
  });

  test('shows loading state when loading prop is true', () => {
    render(<Button loading>Click Me</Button>);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  test('applies correct variant classes', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText('Primary')).toHaveClass('bg-blue-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText('Secondary')).toHaveClass('bg-gray-500');

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-600');
  });

  test('applies correct size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('text-sm');

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByText('Medium')).toHaveClass('text-base');

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('text-lg');
  });
});
