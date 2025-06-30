import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS } from '../../../constants/posStatus';

describe('PosStatusHistory', () => {
  const mockHistory = [
    {
      id: '1',
      timestamp: '2024-03-20T10:00:00.000Z',
      status: 'OPEN',
      reason: '영업 시작',
      estimatedRevenueLoss: 0,
      affectedOrderCount: 0
    },
    {
      id: '2',
      timestamp: '2024-03-20T18:00:00.000Z',
      status: 'CLOSED',
      reason: '영업 종료',
      estimatedRevenueLoss: 50000,
      affectedOrderCount: 3
    }
  ];

  it('renders empty state when no history', () => {
    render(<PosStatusHistory history={[]} />);
    expect(screen.getByText('상태 변경 이력이 없습니다.')).toBeInTheDocument();
  });

  it('renders history items correctly', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    // 상태 확인
    expect(screen.getByText('OPEN')).toBeInTheDocument();
    expect(screen.getByText('CLOSED')).toBeInTheDocument();
    
    // 사유 확인
    expect(screen.getByText('영업 시작')).toBeInTheDocument();
    expect(screen.getByText('영업 종료')).toBeInTheDocument();
    
    // 영향도 정보 확인
    expect(screen.getByText('예상 매출 손실: 50,000원')).toBeInTheDocument();
    expect(screen.getByText('영향 받은 주문: 3건')).toBeInTheDocument();
  });

  it('renders timestamps in correct format', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    const timestamps = screen.getAllByRole('time');
    expect(timestamps).toHaveLength(2);
    
    timestamps.forEach(timestamp => {
      expect(timestamp).toHaveAttribute('dateTime');
    });
  });

  it('handles approval status correctly', () => {
    const historyWithApproval = [
      {
        ...mockHistory[0],
        requiresApproval: true
      }
    ];

    render(<PosStatusHistory history={historyWithApproval} />);
    expect(screen.getByText('승인 필요')).toBeInTheDocument();
  });

  test('filters history by date', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    const dateSelect = screen.getByLabelText('날짜 선택');
    const dates = Array.from(dateSelect.options).map(option => option.value);
    
    // 날짜 선택기에 두 날짜가 있는지 확인
    expect(dates).toHaveLength(2);
    
    // 날짜 변경 (2024-03-20 선택 - 2개 항목이 있는 날짜)
    fireEvent.change(dateSelect, { target: { value: '2024-03-20' } });
    
    // 변경된 날짜의 데이터만 표시되는지 확인 (2024-03-20의 데이터는 2개)
    const statusBadges = screen.getAllByRole('img');
    expect(statusBadges).toHaveLength(2);
  });

  test('handles pagination correctly', () => {
    // 페이지당 10개 항목을 초과하는 히스토리 생성 (모두 같은 날짜와 시간대)
    const longHistory = Array(15).fill(null).map((_, index) => ({
      status: POS_STATUS.OPEN,
      // 같은 날짜 내에서 초 단위로 증가시켜 시간 오버플로우 방지
      timestamp: new Date(2024, 2, 20, 10, 0, index).toISOString(),
    }));

    render(<PosStatusHistory history={longHistory} />);

    // 첫 페이지에서는 10개의 항목만 표시되어야 함
    const initialStatusBadges = screen.getAllByRole('img');
    expect(initialStatusBadges).toHaveLength(10);

    // 다음 페이지로 이동
    const nextPageButton = screen.getByText('2');
    fireEvent.click(nextPageButton);

    // 두 번째 페이지에서는 나머지 5개의 항목만 표시되어야 함
    const nextPageStatusBadges = screen.getAllByRole('img');
    expect(nextPageStatusBadges).toHaveLength(5);
  });

  test('sorts history items by time in descending order', () => {
    render(<PosStatusHistory history={mockHistory} />);
    const timestamps = screen.getAllByRole('time').map(item => item.textContent);
    const sortedTimestamps = [...timestamps].sort((a, b) => b.localeCompare(a));
    expect(timestamps).toEqual(sortedTimestamps);
  });
}); 

