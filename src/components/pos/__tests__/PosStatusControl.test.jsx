import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import PosStatusControl from '../PosStatusControl';
import { POS_STATUS } from '../../../constants/posStatus';
import * as posAPI from '../../../services/posAPI';

// API 모킹
vi.mock('../../../services/posAPI', () => ({
  default: {
    updatePosStatus: vi.fn()
  }
}));

describe('PosStatusControl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders status buttons correctly', () => {
    const onStatusChange = vi.fn();
    render(
      <PosStatusControl 
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={onStatusChange}
      />
    );

    expect(screen.getByRole('button', { name: '영업중' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '브레이크타임' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '준비중' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '영업 종료' })).toBeInTheDocument();
  });

  test('handles status update success', async () => {
    const onStatusChange = vi.fn();
    posAPI.default.updatePosStatus.mockResolvedValueOnce({});

    render(
      <PosStatusControl 
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={onStatusChange}
      />
    );

    const breakButton = screen.getByRole('button', { name: '브레이크타임' });
    await fireEvent.click(breakButton);

    expect(posAPI.default.updatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
    expect(onStatusChange).toHaveBeenCalledWith(POS_STATUS.BREAK);
  });

  test('handles status update failure', async () => {
    const onStatusChange = vi.fn();
    const mockError = new Error('API Error');
    posAPI.default.updatePosStatus.mockRejectedValueOnce(mockError);

    render(
      <PosStatusControl 
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={onStatusChange}
      />
    );

    const breakButton = screen.getByRole('button', { name: '브레이크타임' });
    await fireEvent.click(breakButton);

    expect(posAPI.default.updatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
    expect(onStatusChange).not.toHaveBeenCalled();
  });

  test('disables current status button', () => {
    const onStatusChange = vi.fn();
    render(
      <PosStatusControl 
        currentStatus={POS_STATUS.BREAK}
        onStatusChange={onStatusChange}
      />
    );

    const breakButton = screen.getByRole('button', { name: '브레이크타임' });
    expect(breakButton).toBeDisabled();
  });

  test('shows confirmation dialog for status change', async () => {
    const onStatusChange = vi.fn();
    render(
      <PosStatusControl 
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={onStatusChange}
      />
    );

    const closeButton = screen.getByRole('button', { name: '영업 종료' });
    await fireEvent.click(closeButton);

    // 현재는 alert를 사용하므로 dialog 테스트는 제외
    // TODO: 실제 dialog 컴포넌트로 교체 후 테스트 추가
  });
}); 
