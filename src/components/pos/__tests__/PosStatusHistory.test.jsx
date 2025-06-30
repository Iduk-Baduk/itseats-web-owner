import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import PosStatusHistory from '../PosStatusHistory';
import { POS_STATUS, POS_STATUS_LABEL } from '../../../constants/posStatus';

describe('PosStatusHistory', () => {
  const mockHistory = [
    {
      status: POS_STATUS.OPEN,
      timestamp: '2024-03-20T10:00:00Z'
    },
    {
      status: POS_STATUS.BREAK,
      timestamp: '2024-03-20T14:00:00Z'
    },
    {
      status: POS_STATUS.OPEN,
      timestamp: '2024-03-20T15:00:00Z'
    },
    {
      status: POS_STATUS.CLOSED,
      timestamp: '2024-03-20T22:00:00Z'
    },
    // 다음날 데이터
    {
      status: POS_STATUS.OPEN,
      timestamp: '2024-03-21T10:00:00Z'
    }
  ];

  test('renders history title', () => {
    render(<PosStatusHistory history={[]} />);
    expect(screen.getByText('상태 변경 기록')).toBeInTheDocument();
  });

  test('renders empty state message when history is empty', () => {
    render(<PosStatusHistory history={[]} />);
    expect(screen.getByText('상태 변경 기록이 없습니다.')).toBeInTheDocument();
  });

  test('renders history items with correct status and timestamp', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    mockHistory.forEach(item => {
      const statusElements = screen.getAllByText(POS_STATUS_LABEL[item.status]);
      expect(statusElements.length).toBeGreaterThan(0);
      
      const date = new Date(item.timestamp);
      const formattedTime = date.toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      expect(screen.getByText(formattedTime)).toBeInTheDocument();
    });
  });

  test('renders history items in correct order', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    const timestampElements = screen.getAllByText(/오[전후] [0-9]{1,2}:[0-9]{2}/);
    expect(timestampElements).toHaveLength(mockHistory.length);
    
    const timestamps = timestampElements.map(el => el.textContent);
    const expectedTimestamps = mockHistory.map(item => {
      const date = new Date(item.timestamp);
      return date.toLocaleString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    });
    
    timestamps.forEach((timestamp, index) => {
      expect(timestamp).toContain(expectedTimestamps[index]);
    });
  });

  test('renders PosStatusBadge for each history item', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    mockHistory.forEach(item => {
      const badges = screen.getAllByText(POS_STATUS_LABEL[item.status]);
      expect(badges.length).toBeGreaterThan(0);
      badges.forEach(badge => {
        expect(badge).toBeInTheDocument();
      });
    });
  });

  test('renders empty state correctly', () => {
    render(<PosStatusHistory history={[]} />);
    expect(screen.getByText('변경 이력이 없습니다.')).toBeInTheDocument();
  });

  test('renders history items correctly', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    // 날짜 선택기 확인
    const dateSelect = screen.getByLabelText('날짜 선택');
    expect(dateSelect).toBeInTheDocument();
    
    // 상태 뱃지 확인
    const statusBadges = screen.getAllByRole('status');
    expect(statusBadges.length).toBeGreaterThan(0);
  });

  test('filters history by date', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    const dateSelect = screen.getByLabelText('날짜 선택');
    const dates = Array.from(dateSelect.options).map(option => option.value);
    
    // 날짜 선택기에 두 날짜가 있는지 확인
    expect(dates).toHaveLength(2);
    
    // 날짜 변경
    fireEvent.change(dateSelect, { target: { value: dates[1] } });
    
    // 변경된 날짜의 데이터만 표시되는지 확인
    const statusBadges = screen.getAllByRole('status');
    expect(statusBadges.length).toBe(1);
  });

  test('handles pagination correctly', () => {
    // 페이지당 10개 항목을 초과하는 히스토리 생성
    const longHistory = Array(15).fill(null).map((_, index) => ({
      status: POS_STATUS.OPEN,
      timestamp: new Date(2024, 2, 20, 10 + index).toISOString()
    }));

    render(<PosStatusHistory history={longHistory} />);

    // 페이지네이션 버튼 확인
    const prevButton = screen.getByLabelText('이전 페이지');
    const nextButton = screen.getByLabelText('다음 페이지');
    expect(prevButton).toBeDisabled();
    expect(nextButton).not.toBeDisabled();

    // 다음 페이지로 이동
    fireEvent.click(nextButton);
    expect(prevButton).not.toBeDisabled();
    expect(nextButton).toBeDisabled();

    // 페이지 정보 확인
    expect(screen.getByText('2 / 2')).toBeInTheDocument();
  });

  test('sorts history items by time in descending order', () => {
    render(<PosStatusHistory history={mockHistory} />);
    
    const timestamps = screen.getAllByText(/\d{2}:\d{2}:\d{2}/);
    const times = timestamps.map(el => el.textContent);
    
    // 시간이 내림차순으로 정렬되어 있는지 확인
    const sortedTimes = [...times].sort().reverse();
    expect(times).toEqual(sortedTimes);
  });
}); 

