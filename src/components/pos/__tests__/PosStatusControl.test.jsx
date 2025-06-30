import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../../contexts/AuthContext';
import PosStatusControl from '../PosStatusControl';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import * as posAPI from '../../../services/posAPI';

vi.mock('../../../services/posAPI', () => ({
  updatePosStatusWithNotification: vi.fn()
}));

vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">
      {children}
    </div>
  ),
  useAuth: () => ({
    user: {
      id: 'user1',
      name: '사용자1'
    }
  })
}));

describe('PosStatusControl', () => {
  const mockPosId = 'pos1';
  const mockOnStatusChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (currentStatus = POS_STATUS.OPEN) => {
    return render(
      <AuthProvider>
        <PosStatusControl
          posId={mockPosId}
          currentStatus={currentStatus}
          onStatusChange={mockOnStatusChange}
        />
      </AuthProvider>
    );
  };

  it('renders status buttons correctly', () => {
    renderComponent();
    
    Object.values(POS_STATUS).forEach(status => {
      const button = screen.getByRole('button', { name: POS_STATUS_LABEL[status] });
      expect(button).toBeInTheDocument();
      
      if (status === POS_STATUS.OPEN) {
        expect(button).toBeDisabled();
      } else {
        expect(button).not.toBeDisabled();
      }
    });
  });

  it('handles status change successfully', async () => {
    posAPI.updatePosStatusWithNotification.mockResolvedValueOnce({ success: true });
    
    renderComponent();
    
    // 상태 변경 버튼 클릭
    fireEvent.click(screen.getByRole('button', { name: POS_STATUS_LABEL[POS_STATUS.CLOSED] }));
    
    // 다이얼로그 표시 확인
    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { name: '상태 변경' });
      expect(dialog).toBeInTheDocument();
    });
    
    // 사유 선택
    const reasonSelect = await screen.findByLabelText('변경 사유');
    fireEvent.change(reasonSelect, { target: { value: '정기 휴무' } });
    
    // 필수 필드들 채우기 (영업 종료 시 필요)
    const revenueLossInput = await screen.findByPlaceholderText('예: 50000');
    fireEvent.change(revenueLossInput, { target: { value: '50000' } });
    
    const orderCountInput = await screen.findByPlaceholderText('예: 10');
    fireEvent.change(orderCountInput, { target: { value: '5' } });
    
    // 변경 확인
    const submitButton = await screen.findByRole('button', { name: '변경하기' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(posAPI.updatePosStatusWithNotification).toHaveBeenCalledWith(
        mockPosId,
        expect.objectContaining({
          status: POS_STATUS.CLOSED,
          reason: '정기 휴무',
          userId: 'user1',
          userName: '사용자1'
        })
      );
      expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.CLOSED);
    });
  });

  it('handles error during status change', async () => {
    const errorMessage = '상태 변경 중 오류가 발생했습니다.';
    posAPI.updatePosStatusWithNotification.mockRejectedValueOnce(new Error(errorMessage));
    
    renderComponent();
    
    // 상태 변경 시도
    fireEvent.click(screen.getByRole('button', { name: POS_STATUS_LABEL[POS_STATUS.CLOSED] }));
    
    // 다이얼로그 표시 확인
    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { name: '상태 변경' });
      expect(dialog).toBeInTheDocument();
    });
    
    // 사유 선택
    const reasonSelect = await screen.findByLabelText('변경 사유');
    fireEvent.change(reasonSelect, { target: { value: '정기 휴무' } });
    
    // 필수 필드들 채우기 (영업 종료 시 필요)
    const revenueLossInput = await screen.findByPlaceholderText('예: 50000');
    fireEvent.change(revenueLossInput, { target: { value: '50000' } });
    
    const orderCountInput = await screen.findByPlaceholderText('예: 10');
    fireEvent.change(orderCountInput, { target: { value: '5' } });
    
    // 변경 확인
    const submitButton = await screen.findByRole('button', { name: '변경하기' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockOnStatusChange).not.toHaveBeenCalled();
    });
  });
}); 
