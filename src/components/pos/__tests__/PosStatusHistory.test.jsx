import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { format } from 'date-fns';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS } from '../../../constants/posStatus';

describe('PosStatusHistory', () => {
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
    },
    {
      id: '2',
      timestamp: '2024-03-20T18:00:00.000Z',
      status: POS_STATUS.CLOSED,
      reason: '영업 종료',
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

  const historyWithApproval = [
    {
      ...mockHistory[0],
      requiresApproval: true,
      approvedBy: null,
      approvedAt: null
    }
  ];

  it('renders empty state when no history', () => {
    render(<PosStatusHistory history={[]} />);
    expect(screen.getByText('상태 변경 기록이 없습니다.')).toBeInTheDocument();
  });

  it('renders history items correctly', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    // 상태 확인
    const historyItems = screen.getAllByRole('listitem');
    expect(historyItems).toHaveLength(2);
    
    // 첫 번째 항목 (최신)
    const firstItem = historyItems[0];
    expect(firstItem).toHaveTextContent('영업 종료');
    expect(firstItem).toHaveTextContent('18:00');
    
    // 두 번째 항목
    const secondItem = historyItems[1];
    expect(secondItem).toHaveTextContent('영업 시작');
    expect(secondItem).toHaveTextContent('10:00');
  });

  it('renders timestamps in correct format', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    const timestamps = screen.getAllByRole('time');
    expect(timestamps).toHaveLength(2);
    
    // 시간 순서대로 정렬 (최신순)
    expect(timestamps[0]).toHaveAttribute('dateTime', '2024-03-20T18:00:00.000Z');
    expect(timestamps[1]).toHaveAttribute('dateTime', '2024-03-20T10:00:00.000Z');
    
    timestamps.forEach(timestamp => {
      expect(timestamp).toHaveAttribute('dateTime', expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/));
    });
  });

  it('handles approval status correctly', () => {
    render(<PosStatusHistory history={historyWithApproval} />);
    expect(screen.getByText(/승인 대기/, { exact: false })).toBeInTheDocument();
  });

  it('filters history by date', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    // 날짜 선택 확인
    const dateSelect = screen.getByRole('combobox', { name: /날짜 선택/ });
    expect(dateSelect).toBeInTheDocument();
    
    // 날짜 변경
    fireEvent.change(dateSelect, { target: { value: format(new Date('2024-03-20'), 'yyyy-MM-dd') } });
    
    // 해당 날짜의 이력만 표시되는지 확인
    const timestamps = screen.getAllByRole('time');
    timestamps.forEach(timestamp => {
      const date = new Date(timestamp.getAttribute('dateTime'));
      expect(format(date, 'yyyy-MM-dd')).toBe('2024-03-20');
    });
  });

  test('handles pagination correctly', () => {
    // 페이지당 10개 항목을 초과하는 히스토리 생성
    const longHistory = Array(15).fill(null).map((_, index) => ({
      id: `test-${index}`,
      status: POS_STATUS.OPEN,
      // 초 단위로 증가시켜 시간 오버플로우 방지
      timestamp: new Date(2024, 2, 20, 10, 0, index).toISOString(),
      reason: `테스트 사유 ${index}`,
      estimatedRevenueLoss: 0,
      affectedOrderCount: 0
    }));

    render(<PosStatusHistory history={longHistory} />);

    // 첫 페이지에서는 10개의 항목만 표시되어야 함
    const initialHistoryItems = screen.getAllByRole('listitem');
    expect(initialHistoryItems).toHaveLength(10);

    // 다음 페이지로 이동
    const nextPageButton = screen.getByText('2');
    fireEvent.click(nextPageButton);

    // 두 번째 페이지에서는 나머지 5개의 항목만 표시되어야 함
    const nextPageHistoryItems = screen.getAllByRole('listitem');
    expect(nextPageHistoryItems).toHaveLength(5);
  });
}); 

