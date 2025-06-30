import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PosStatusControl from '../PosStatusControl';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import POS_API from '../../../services/posAPI';

// API 모킹
vi.mock('../../../services/posAPI');

const mockUpdatePosStatus = vi.fn().mockResolvedValue({});
POS_API.updatePosStatus = mockUpdatePosStatus;

describe('PosStatusControl', () => {
  const mockOnStatusChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders all status buttons', () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
      />
    );

    Object.values(POS_STATUS).forEach(status => {
      expect(screen.getByText(POS_STATUS_LABEL[status])).toBeInTheDocument();
    });
  });

  test.each(Object.values(POS_STATUS))('disables button for current status: %s', (status) => {
    render(
      <PosStatusControl
        currentStatus={status}
        onStatusChange={mockOnStatusChange}
      />
    );

    const button = screen.getByText(POS_STATUS_LABEL[status]);
    expect(button).toBeDisabled();
  });

  test('calls onStatusChange when clicking enabled button', async () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
      />
    );

    const breakButton = screen.getByText(POS_STATUS_LABEL[POS_STATUS.BREAK]);
    await act(async () => {
      fireEvent.click(breakButton);
    });

    expect(mockUpdatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
    expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.BREAK);
  });

  test('does not call onStatusChange when clicking disabled button', async () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    const breakButton = screen.getByText(POS_STATUS_LABEL[POS_STATUS.BREAK]);
    await act(async () => {
      fireEvent.click(breakButton);
    });

    expect(mockOnStatusChange).not.toHaveBeenCalled();
  });

  test('disables all buttons when disabled prop is true', () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    Object.values(POS_STATUS).forEach(status => {
      const button = screen.getByText(POS_STATUS_LABEL[status]);
      expect(button).toBeDisabled();
    });
  });
}); 
