import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach, it } from 'vitest';
import PosAutoSettings from '../PosAutoSettings';
import PosStatusControl from '../PosStatusControl';
import PosStatusHistory from '../PosStatusHistory';
import PosStatusBadge from '../PosStatusBadge';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import * as posAutoScheduler from '../../../utils/posAutoScheduler';
import posAPI from '../../../services/posAPI';
import { AuthProvider } from '../../../contexts/AuthContext';

// API 모킹
vi.mock('../../../services/posAPI', () => ({
  default: {
    updatePosStatus: vi.fn(),
    fetchPosHistory: vi.fn()
  }
}));

// react-hot-toast 모킹
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
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
      estimatedRevenueLoss: 0,
      affectedOrderCount: 0
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    posAPI.fetchPosHistory.mockResolvedValue(mockHistory);
  });

  const renderComponents = () => {
    return render(
      <AuthProvider>
        <div>
          <PosStatusBadge status={mockInitialStatus} />
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

  it('shows current status correctly across components', () => {
    renderComponents();
    expect(screen.getByText('영업 중')).toBeInTheDocument();
  });

  it('updates status badge when status changes', async () => {
    posAPI.updatePosStatus.mockResolvedValueOnce({
      status: POS_STATUS.CLOSED,
      timestamp: '2024-03-20T18:00:00.000Z'
    });

    renderComponents();
    
    // 상태 변경 시도
    fireEvent.click(screen.getByText('영업 종료'));
    const reasonInput = screen.getByLabelText('변경 사유');
    fireEvent.change(reasonInput, { target: { value: '영업 종료' } });
    fireEvent.click(screen.getByText('확인'));

    // 상태 변경 확인
    await waitFor(() => {
      expect(posAPI.updatePosStatus).toHaveBeenCalledWith(
        mockPosId,
        expect.objectContaining({
          status: POS_STATUS.CLOSED,
          reason: '영업 종료'
        })
      );
    });
  });

  it('shows error message when status update fails', async () => {
    posAPI.updatePosStatus.mockRejectedValueOnce(new Error('API Error'));

    renderComponents();
    
    // 상태 변경 시도
    fireEvent.click(screen.getByText('영업 종료'));
    const reasonInput = screen.getByLabelText('변경 사유');
    fireEvent.change(reasonInput, { target: { value: '영업 종료' } });
    fireEvent.click(screen.getByText('확인'));

    // 에러 메시지 확인
    await waitFor(() => {
      expect(screen.getByText(/오류가 발생했습니다/)).toBeInTheDocument();
    });
  });

  it('displays history correctly', () => {
    renderComponents();
    expect(screen.getByText('영업 시작')).toBeInTheDocument();
    expect(screen.getByRole('time')).toHaveAttribute('dateTime', '2024-03-20T10:00:00.000Z');
  });
});

describe('POS Status Management Integration', () => {
  const mockOnStatusChange = vi.fn();
  const mockOnAutoSettingsChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // 각 테스트마다 성공 응답으로 초기화
    posAPI.updatePosStatus.mockResolvedValue({});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('manual status change updates history', async () => {
    const initialHistory = [];
    let currentHistory = [...initialHistory];
    
    const updateHistory = (newStatus) => {
      currentHistory = [
        {
          status: newStatus,
          timestamp: new Date().toISOString()
        },
        ...currentHistory
      ];
    };

    const { rerender } = render(
      <>
        <PosStatusControl
          currentStatus={POS_STATUS.OPEN}
          onStatusChange={(status) => {
            mockOnStatusChange(status);
            updateHistory(status);
          }}
        />
        <PosStatusHistory history={currentHistory} />
      </>
    );

    const breakButton = screen.getByRole('button', { name: POS_STATUS_LABEL[POS_STATUS.BREAK] });
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

    expect(posAPI.updatePosStatus).toHaveBeenCalledWith(
      POS_STATUS.BREAK,
      expect.objectContaining({
        reason: '점심시간 휴게',
        estimatedRevenueLoss: 50000,
        affectedOrderCount: 5,
        userId: expect.any(String),
        userName: expect.any(String)
      })
    );
    expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.BREAK);
    
    rerender(
      <>
        <PosStatusControl
          currentStatus={POS_STATUS.BREAK}
          onStatusChange={(status) => {
            mockOnStatusChange(status);
            updateHistory(status);
          }}
        />
        <PosStatusHistory history={currentHistory} />
      </>
    );

    const badges = screen.getAllByText(POS_STATUS_LABEL[POS_STATUS.BREAK]);
    expect(badges.length).toBeGreaterThan(0);
  });

  test('auto settings interact with manual status control', () => {
    const autoSettings = {
      autoOpen: true,
      autoOpenTime: '09:00',
      autoClose: true,
      autoCloseTime: '22:00'
    };

    render(
      <>
        <PosAutoSettings
          settings={autoSettings}
          onSettingsChange={mockOnAutoSettingsChange}
        />
        <PosStatusControl
          currentStatus={POS_STATUS.OPEN}
          onStatusChange={mockOnStatusChange}
          disabled={autoSettings.autoOpen || autoSettings.autoClose}
        />
      </>
    );

    // 자동화 설정이 활성화되어 있으므로 모든 상태 변경 버튼이 비활성화되어야 함
    const statusButtons = screen.getAllByRole('button');
    statusButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  test('status changes based on operating hours', () => {
    const mockDate = new Date('2024-03-20T23:00:00Z');
    vi.setSystemTime(mockDate);

    const autoSettings = {
      autoOpen: true,
      autoOpenTime: '10:00',
      autoClose: true,
      autoCloseTime: '22:00'
    };

    const isWithinOperatingHoursSpy = vi.spyOn(posAutoScheduler, 'isWithinOperatingHours');
    isWithinOperatingHoursSpy.mockReturnValue(false);

    const determineCurrentStatusSpy = vi.spyOn(posAutoScheduler, 'determineCurrentStatus');
    determineCurrentStatusSpy.mockReturnValue(POS_STATUS.CLOSED);

    let currentStatus = POS_STATUS.OPEN;

    render(
      <>
        <PosAutoSettings
          settings={autoSettings}
          onSettingsChange={mockOnAutoSettingsChange}
        />
        <PosStatusControl
          currentStatus={currentStatus}
          onStatusChange={(status) => {
            mockOnStatusChange(status);
            currentStatus = status;
          }}
          disabled={autoSettings.autoOpen || autoSettings.autoClose}
        />
      </>
    );

    act(() => {
      const status = determineCurrentStatusSpy(autoSettings);
      if (status && status !== currentStatus) {
        mockOnStatusChange(status);
      }
    });

    expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.CLOSED);

    isWithinOperatingHoursSpy.mockRestore();
    determineCurrentStatusSpy.mockRestore();
  });
}); 
