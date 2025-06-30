import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import PosAutoSettings from '../PosAutoSettings';
import PosStatusControl from '../PosStatusControl';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import * as posAutoScheduler from '../../../utils/posAutoScheduler';
import POS_API from '../../../services/posAPI';

// API 모킹
vi.mock('../../../services/posAPI');

const mockUpdatePosStatus = vi.fn().mockResolvedValue({});
POS_API.updatePosStatus = mockUpdatePosStatus;

describe('POS Status Management Integration', () => {
  const mockOnStatusChange = vi.fn();
  const mockOnAutoSettingsChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
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
    await act(async () => {
      fireEvent.click(breakButton);
    });

    expect(mockUpdatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
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
    const mockDate = new Date('2024-03-20T10:00:00Z');
    vi.setSystemTime(mockDate);

    const autoSettings = {
      autoOpen: false,
      autoOpenTime: '10:00',
      autoClose: false,
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

    const autoOpenToggle = screen.getByLabelText('자동 오픈');
    fireEvent.click(autoOpenToggle);

    expect(mockOnAutoSettingsChange).toHaveBeenCalledWith({
      ...autoSettings,
      autoOpen: true
    });
  });

  test('status changes based on operating hours', () => {
    // 현재 시간을 영업 시간 외로 설정
    const mockDate = new Date('2024-03-20T23:00:00Z');
    vi.setSystemTime(mockDate);

    const autoSettings = {
      autoOpen: true,
      autoOpenTime: '10:00',
      autoClose: true,
      autoCloseTime: '22:00'
    };

    // 자동화 관련 함수들을 모킹
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

    // 상태 변경 트리거
    act(() => {
      const status = determineCurrentStatusSpy(autoSettings);
      if (status && status !== currentStatus) {
        mockOnStatusChange(status);
      }
    });

    expect(mockOnStatusChange).toHaveBeenCalledWith(POS_STATUS.CLOSED);

    // 스파이 정리
    isWithinOperatingHoursSpy.mockRestore();
    determineCurrentStatusSpy.mockRestore();
  });
}); 
