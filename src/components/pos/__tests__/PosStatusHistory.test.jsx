import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS } from '../../../constants/posStatus';

describe('PosStatusHistory', () => {
  const mockHistory = [
    {
      status: POS_STATUS.OPEN,
      timestamp: new Date('2024-03-21T10:00:00').toISOString(),
    },
    {
      status: POS_STATUS.BREAK,
      timestamp: new Date('2024-03-20T15:00:00').toISOString(),
    },
    {
      status: POS_STATUS.CLOSED,
      timestamp: new Date('2024-03-20T22:00:00').toISOString(),
    },
  ];

  test('renders empty state correctly', () => {
    render(<PosStatusHistory history={[]} />);
    expect(screen.getByText('상태 변경 기록이 없습니다.')).toBeInTheDocument();
  });

  test('renders history items correctly', () => {
    render(<PosStatusHistory history={mockHistory} />);
    const statusBadges = screen.getAllByRole('status');
    // 초기에는 가장 최근 날짜(2024-03-21)의 기록만 표시되므로 1개
    expect(statusBadges).toHaveLength(1);
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
    const statusBadges = screen.getAllByRole('status');
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
    const initialStatusBadges = screen.getAllByRole('status');
    expect(initialStatusBadges).toHaveLength(10);

    // 다음 페이지로 이동
    const nextPageButton = screen.getByText('2');
    fireEvent.click(nextPageButton);

    // 두 번째 페이지에서는 나머지 5개의 항목만 표시되어야 함
    const nextPageStatusBadges = screen.getAllByRole('status');
    expect(nextPageStatusBadges).toHaveLength(5);
  });

  test('sorts history items by time in descending order', () => {
    render(<PosStatusHistory history={mockHistory} />);
    const timestamps = screen.getAllByRole('timestamp').map(item => item.textContent);
    const sortedTimestamps = [...timestamps].sort((a, b) => b.localeCompare(a));
    expect(timestamps).toEqual(sortedTimestamps);
  });
}); 

