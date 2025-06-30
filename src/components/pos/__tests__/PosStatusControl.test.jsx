import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PosStatusControl from '../PosStatusControl';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';

describe('PosStatusControl', () => {
  const mockOnStatusChange = vi.fn();
  
  beforeEach(() => {
    mockOnStatusChange.mockClear();
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

  test('calls onStatusChange when clicking enabled button', () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
      />
    );

    const breakButton = screen.getByText(POS_STATUS_LABEL[POS_STATUS.BREAK]);
    fireEvent.click(breakButton);
    expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.BREAK);
  });

  test('does not call onStatusChange when clicking disabled button', () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
        disabled={true}
      />
    );

    const breakButton = screen.getByText(POS_STATUS_LABEL[POS_STATUS.BREAK]);
    fireEvent.click(breakButton);
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
