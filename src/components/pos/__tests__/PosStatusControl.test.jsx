import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PosStatusControl from '../PosStatusControl';
import { POS_STATUS } from '../../../constants/posStatus';
import * as posAPI from '../../../services/posAPI';
import { AuthProvider } from '../../../contexts/AuthContext';

// API 모킹
vi.mock('../../../services/posAPI', () => ({
  updatePosStatus: vi.fn()
}));

// react-hot-toast 모킹
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('PosStatusControl', () => {
  const mockPosId = 'pos1';
  const mockCurrentStatus = POS_STATUS.OPEN;
  const mockOnStatusChange = vi.fn();

  const renderComponent = () => {
    return render(
      <AuthProvider>
        <PosStatusControl
          posId={mockPosId}
          currentStatus={mockCurrentStatus}
          onStatusChange={mockOnStatusChange}
        />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders status buttons correctly', () => {
    renderComponent();
    expect(screen.getByText('영업 시작')).toBeInTheDocument();
    expect(screen.getByText('영업 종료')).toBeInTheDocument();
    expect(screen.getByText('휴식 시작')).toBeInTheDocument();
  });

  it('disables current status button', () => {
    renderComponent();
    const currentStatusButton = screen.getByText('영업 중');
    expect(currentStatusButton).toBeDisabled();
  });

  it('opens dialog on status button click', () => {
    renderComponent();
    fireEvent.click(screen.getByText('영업 종료'));
    expect(screen.getByText('상태 변경 확인')).toBeInTheDocument();
  });

  it('handles status change successfully', async () => {
    posAPI.updatePosStatus.mockResolvedValueOnce({ status: POS_STATUS.CLOSED });
    
    renderComponent();
    fireEvent.click(screen.getByText('영업 종료'));
    
    const reasonInput = screen.getByLabelText('변경 사유');
    fireEvent.change(reasonInput, { target: { value: '영업 종료' } });
    
    fireEvent.click(screen.getByText('확인'));
    
    await waitFor(() => {
      expect(posAPI.updatePosStatus).toHaveBeenCalledWith(mockPosId, expect.objectContaining({
        status: POS_STATUS.CLOSED,
        reason: '영업 종료'
      }));
      expect(mockOnStatusChange).toHaveBeenCalledWith({ status: POS_STATUS.CLOSED });
    });
  });

  it('handles error during status change', async () => {
    posAPI.updatePosStatus.mockRejectedValueOnce(new Error('API Error'));
    
    renderComponent();
    fireEvent.click(screen.getByText('영업 종료'));
    
    const reasonInput = screen.getByLabelText('변경 사유');
    fireEvent.change(reasonInput, { target: { value: '영업 종료' } });
    
    fireEvent.click(screen.getByText('확인'));
    
    await waitFor(() => {
      expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });
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

    // 브레이크타임 버튼 클릭
    const breakButton = screen.getByRole('button', { name: '브레이크타임' });
    await fireEvent.click(breakButton);

    // 다이얼로그가 열리는지 확인
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 필수 필드 입력
    const reasonSelect = screen.getByRole('combobox');
    await fireEvent.change(reasonSelect, { target: { value: '점심시간 휴게' } });

    const revenueLossInput = screen.getByPlaceholderText('예: 50000');
    await fireEvent.change(revenueLossInput, { target: { value: '50000' } });

    const orderCountInput = screen.getByPlaceholderText('예: 10');
    await fireEvent.change(orderCountInput, { target: { value: '5' } });

    // 확인 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: '승인 요청' });
    await act(async () => {
      await fireEvent.click(confirmButton);
    });

    // API 호출 및 콜백 확인
    expect(posAPI.default.updatePosStatus).toHaveBeenCalledWith(
      POS_STATUS.BREAK,
      expect.objectContaining({
        reason: '점심시간 휴게',
        estimatedRevenueLoss: 50000,
        affectedOrderCount: 5,
        userId: expect.any(String),
        userName: expect.any(String)
      })
    );
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

    // 브레이크타임 버튼 클릭
    const breakButton = screen.getByRole('button', { name: '브레이크타임' });
    await fireEvent.click(breakButton);

    // 다이얼로그가 열리는지 확인
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 필수 필드 입력
    const reasonSelect = screen.getByRole('combobox');
    await fireEvent.change(reasonSelect, { target: { value: '점심시간 휴게' } });

    const revenueLossInput = screen.getByPlaceholderText('예: 50000');
    await fireEvent.change(revenueLossInput, { target: { value: '50000' } });

    const orderCountInput = screen.getByPlaceholderText('예: 10');
    await fireEvent.change(orderCountInput, { target: { value: '5' } });

    // 확인 버튼 클릭
    const confirmButton = screen.getByRole('button', { name: '승인 요청' });
    await act(async () => {
      await fireEvent.click(confirmButton);
    });

    expect(posAPI.default.updatePosStatus).toHaveBeenCalledWith(
      POS_STATUS.BREAK,
      expect.objectContaining({
        reason: '점심시간 휴게',
        estimatedRevenueLoss: 50000,
        affectedOrderCount: 5,
        userId: expect.any(String),
        userName: expect.any(String)
      })
    );
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

  test('cancels status change when dialog is dismissed', async () => {
    const onStatusChange = vi.fn();
    render(
      <PosStatusControl 
        currentStatus={POS_STATUS.OPEN}
        onStatusChange={onStatusChange}
      />
    );

    // 브레이크타임 버튼 클릭
    const breakButton = screen.getByRole('button', { name: '브레이크타임' });
    await fireEvent.click(breakButton);

    // 다이얼로그가 열리는지 확인
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // 취소 버튼 클릭
    const cancelButton = screen.getByRole('button', { name: '취소' });
    await fireEvent.click(cancelButton);

    // API가 호출되지 않았는지 확인
    expect(posAPI.default.updatePosStatus).not.toHaveBeenCalled();
    expect(onStatusChange).not.toHaveBeenCalled();
  });
}); 
