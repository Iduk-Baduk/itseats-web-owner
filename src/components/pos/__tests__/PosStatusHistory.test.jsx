import React from 'react';
import { render, screen } from '@testing-library/react';
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
      timestamp: '2024-03-20T12:00:00Z'
    },
    {
      status: POS_STATUS.OPEN,
      timestamp: '2024-03-20T13:00:00Z'
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
}); 
