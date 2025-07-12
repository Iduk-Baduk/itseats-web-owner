import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../../../contexts/AuthContext';
import PosStatusBadge from '../PosStatusBadge';
import PosStatusControl from '../PosStatusControl';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import posAPI from '../../../services/posAPI';

vi.mock('../../../services/posAPI', () => ({
  default: {
    updatePosStatusWithNotification: vi.fn(),
    getPosStatusHistory: vi.fn()
  }
}));

vi.mock('../../../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => (
    <div data-testid="auth-provider">
      {children}
    </div>
  ),
  useAuth: () => ({
    currentUser: {
      userId: 'user1',
      userName: '사용자1'
    }
  })
}));

describe('POS Integration Tests', () => {
  const mockPosId = 'pos1';
  const mockInitialStatus = POS_STATUS.OPEN;

  const mockHistory = [
    {
      id: '1',
      timestamp: '2024-03-20T10:00:00.000Z',
      status: POS_STATUS.OPEN,
      reason: '영업 시작',
      userId: 'user1',
      userName: '사용자1',
      notes: '',
      estimatedRevenueLoss: 0,
      affectedOrderCount: 0,
      category: 'MANUAL',
      requiresApproval: false,
      approvedBy: null,
      approvedAt: null
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    posAPI.getPosStatusHistory.mockResolvedValue({ history: mockHistory });
  });

  const renderComponents = () => {
    return render(
      <AuthProvider>
        <div>
          <PosStatusBadge status={mockInitialStatus} data-testid="status-badge" />
          <PosStatusControl
            posId={mockPosId}
            currentStatus={mockInitialStatus}
            onStatusChange={vi.fn()}
          />
          <PosStatusHistory history={mockHistory} />
        </div>
      </AuthProvider>
    );
  };

  it('displays initial status correctly', () => {
    renderComponents();
    const statusBadge = screen.getByTestId('status-badge');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveTextContent(POS_STATUS_LABEL[mockInitialStatus]);
  });

  it('displays history correctly', () => {
    renderComponents();
    expect(screen.getByText(/영업 시작/, { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('time')).toHaveAttribute('dateTime', '2024-03-20T10:00:00.000Z');
  });

  it('updates history after status change', async () => {
    const newStatus = POS_STATUS.CLOSED;
    posAPI.updatePosStatusWithNotification.mockResolvedValueOnce({ success: true });
    
    renderComponents();

    // 상태 변경
    fireEvent.click(screen.getByRole('button', { name: POS_STATUS_LABEL[newStatus] }));
    
    // 다이얼로그 표시 확인
    await waitFor(() => {
      const dialog = screen.getByRole('dialog', { name: '상태 변경' });
      expect(dialog).toBeInTheDocument();
    });
    
    // 사유 선택
    const reasonSelect = screen.getByLabelText('변경 사유');
    fireEvent.change(reasonSelect, { target: { value: '정기 휴무' } });
    
    // 필수 필드들 채우기 (영업 종료 시 필요)
    const revenueLossInput = screen.getByPlaceholderText('예: 50000');
    fireEvent.change(revenueLossInput, { target: { value: '50000' } });
    
    const orderCountInput = screen.getByPlaceholderText('예: 10');
    fireEvent.change(orderCountInput, { target: { value: '5' } });
    
    // 변경 확인
    fireEvent.click(screen.getByRole('button', { name: '변경하기' }));

    await waitFor(() => {
      expect(posAPI.updatePosStatusWithNotification).toHaveBeenCalledWith(
        mockPosId,
        expect.objectContaining({
          status: newStatus,
          reason: '정기 휴무',
          userId: 'user1',
          userName: '사용자1'
        })
      );
    });
  });
}); 
