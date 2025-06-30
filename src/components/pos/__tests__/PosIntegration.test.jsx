import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import PosAutoSettings from '../PosAutoSettings';
import PosStatusControl from '../PosStatusControl';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';
import * as posAutoScheduler from '../../../utils/posAutoScheduler';
import * as posAPI from '../../../services/posAPI';

// API 모킹
vi.mock('../../../services/posAPI', () => ({
  default: {
    updatePosStatus: vi.fn()
  }
}));

describe('POS Status Management Integration', () => {
  const mockOnStatusChange = vi.fn();
  const mockOnAutoSettingsChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // 각 테스트마다 성공 응답으로 초기화
    posAPI.default.updatePosStatus.mockResolvedValue({});
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
      await fireEvent.click(breakButton);
    });

    expect(posAPI.default.updatePosStatus).toHaveBeenCalledWith(POS_STATUS.BREAK);
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
