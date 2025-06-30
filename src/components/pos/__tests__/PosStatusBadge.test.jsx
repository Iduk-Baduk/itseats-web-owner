import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import PosStatusBadge from '../PosStatusBadge';
import { POS_STATUS, POS_STATUS_LABEL, POS_STATUS_STYLE } from '../../../constants/posStatus';

describe('PosStatusBadge', () => {
  test.each(Object.values(POS_STATUS))('applies correct style for %s status', (status) => {
    const { container } = render(<PosStatusBadge status={status} />);
    const badge = container.firstChild;
    
    // null 체크
    expect(badge).not.toBeNull();
    
    const style = POS_STATUS_STYLE[status];
    // 스타일 객체 존재 확인
    expect(style).toBeDefined();
    expect(Object.keys(style).length).toBeGreaterThan(0);
    
    // 각 스타일 속성 검증
    Object.entries(style).forEach(([property, value]) => {
      expect(badge).toHaveStyle({ [property]: value });
    });
  });

  test('renders status text correctly', () => {
    const status = POS_STATUS.OPEN;
    render(<PosStatusBadge status={status} />);
    expect(screen.getByText(POS_STATUS_LABEL[status])).toBeInTheDocument();
  });

  test('applies additional className if provided', () => {
    const { container } = render(
      <PosStatusBadge status={POS_STATUS.OPEN} className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  test('handles invalid status gracefully', () => {
    const { container } = render(<PosStatusBadge status="INVALID_STATUS" />);
    const badge = container.firstChild;
    
    expect(badge).not.toBeNull();
    expect(badge).toHaveStyle({
      backgroundColor: '#e0e0e0',  // 기본 배경색
      color: '#666666'            // 기본 텍스트 색상
    });
  });
}); 
