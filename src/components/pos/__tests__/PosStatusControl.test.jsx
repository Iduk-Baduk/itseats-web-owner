import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PosStatusControl from '../PosStatusControl';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import * as posAPI from '../../../services/posAPI';

// API 모킹
vi.mock('../../../services/posAPI', () => ({
  updatePosStatus: vi.fn(),
}));

describe('PosStatusControl', () => {
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // 각 테스트마다 성공 응답으로 초기화
    posAPI.updatePosStatus.mockResolvedValue({});
  });

  test('renders all status buttons', () => {
    render(
      <PosStatusControl
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={mockOnStatusChange}
      />
    );

    Object.values(POS_STATUS).forEach((status) => {
      expect(screen.getByText(POS_STATUS_LABEL[status])).toBeInTheDocument();
    });
  });

  test.each(Object.values(POS_STATUS))(
    'disables button for current status: %s',
    (status) => {
      render(
        <PosStatusControl
          currentStatus={status}
          onStatusChange={mockOnStatusChange}
        />
      );

      const button = screen.getByText(POS_STATUS_LABEL[status]);
      expect(button).toBeDisabled();
    }
  );

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

    expect(posAPI.updatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
    expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.BREAK);
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    posAPI.updatePosStatus.mockRejectedValueOnce(new Error('API Error'));

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

    expect(posAPI.updatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
    expect(mockOnStatusChange).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
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

    Object.values(POS_STATUS).forEach((status) => {
      const button = screen.getByText(POS_STATUS_LABEL[status]);
      expect(button).toBeDisabled();
    });
  });
}); 
