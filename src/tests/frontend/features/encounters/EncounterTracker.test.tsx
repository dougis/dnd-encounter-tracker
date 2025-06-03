import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EncounterTracker } from '@/features/encounters/EncounterTracker';
import { useSocket } from '@/hooks/useSocket';
import { useQuery, useMutation } from '@tanstack/react-query';

// Mock dependencies
jest.mock('@/hooks/useSocket', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

const mockEncounter = {
  id: 'encounter123',
  name: 'Dragon Lair Showdown',
  description: 'Final confrontation with the dragon',
  status: 'active',
  participants: [
    {
      id: 'char1',
      type: 'character',
      name: 'Thorgrim',
      ac: 18,
      maxHP: 95,
      currentHP: 75,
      dexterity: 12,
      initiativeRoll: 15,
      initiativeOrder: 1,
      conditions: [],
      legendaryActionsRemaining: 0,
    },
    {
      id: 'monster1',
      type: 'creature',
      name: 'Ancient Red Dragon',
      ac: 22,
      maxHP: 546,
      currentHP: 320,
      dexterity: 10,
      initiativeRoll: 12,
      initiativeOrder: 2,
      conditions: [],
      legendaryActionsRemaining: 3,
    },
  ],
  currentTurn: 0,
  round: 2,
};

describe('EncounterTracker Component', () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };
  
  const mockUpdateHP = jest.fn();
  
  beforeEach(() => {
    (useSocket as jest.Mock).mockReturnValue({ socket: mockSocket });
    
    (useQuery as jest.Mock).mockReturnValue({
      data: mockEncounter,
      isLoading: false,
      error: null,
    });
    
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mockUpdateHP,
      isLoading: false,
    });
  });

  test('renders encounter details correctly', () => {
    render(<EncounterTracker encounterId="encounter123" />);
    
    expect(screen.getByText('Dragon Lair Showdown')).toBeInTheDocument();
    expect(screen.getByText('Round 2')).toBeInTheDocument();
    expect(screen.getByText('Thorgrim')).toBeInTheDocument();
    expect(screen.getByText('Ancient Red Dragon')).toBeInTheDocument();
  });

  test('highlights current turn participant', () => {
    render(<EncounterTracker encounterId="encounter123" />);
    
    const currentParticipant = screen.getByText('Thorgrim').closest('.participant');
    expect(currentParticipant).toHaveClass('current-turn');
  });

  test('advances turn when Next Turn button is clicked', async () => {
    render(<EncounterTracker encounterId="encounter123" />);
    
    fireEvent.click(screen.getByRole('button', { name: /next turn/i }));
    
    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('advance_turn', { encounterId: 'encounter123' });
    });
  });

  test('updates HP when damage is applied', async () => {
    render(<EncounterTracker encounterId="encounter123" />);
    
    // Find HP input for Thorgrim
    const hpInput = screen.getAllByLabelText(/damage/i)[0];
    fireEvent.change(hpInput, { target: { value: '10' } });
    fireEvent.click(screen.getAllByText(/apply damage/i)[0]);
    
    await waitFor(() => {
      expect(mockSocket.emit).toHaveBeenCalledWith('update_participant_hp', {
        encounterId: 'encounter123',
        participantId: 'char1',
        newHP: 65, // 75 - 10
        damage: 10,
      });
    });
  });

  test('displays loading state when encounter data is loading', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });
    
    render(<EncounterTracker encounterId="encounter123" />);
    
    expect(screen.getByText(/loading encounter/i)).toBeInTheDocument();
  });

  test('displays error state when encounter failed to load', () => {
    (useQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load encounter'),
    });
    
    render(<EncounterTracker encounterId="encounter123" />);
    
    expect(screen.getByText(/failed to load encounter/i)).toBeInTheDocument();
  });

  test('joins socket room on mount and leaves on unmount', () => {
    const { unmount } = render(<EncounterTracker encounterId="encounter123" />);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join_encounter', { encounterId: 'encounter123' });
    
    unmount();
    
    expect(mockSocket.emit).toHaveBeenCalledWith('leave_encounter', { encounterId: 'encounter123' });
  });
});
