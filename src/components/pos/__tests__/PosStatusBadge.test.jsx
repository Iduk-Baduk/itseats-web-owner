import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import PosStatusBadge from '../PosStatusBadge';
import { POS_STATUS, POS_STATUS_LABEL, POS_STATUS_STYLE } from '../../../constants/posStatus';

describe('PosStatusBadge', () => {
  test.each(Object.values(POS_STATUS))('renders correct label for %s status', (status) => {
    render(<PosStatusBadge status={status} />);
    expect(screen.getByText(POS_STATUS_LABEL[status])).toBeInTheDocument();
  });

  test.each(Object.values(POS_STATUS))('applies correct style for %s status', (status) => {
    const { container } = render(<PosStatusBadge status={status} />);
    const badge = container.firstChild;
    const style = POS_STATUS_STYLE[status];
    
    Object.entries(style).forEach(([property, value]) => {
      expect(badge).toHaveStyle({ [property]: value });
    });
  });

  test('renders nothing for invalid status', () => {
    const { container } = render(<PosStatusBadge status="INVALID_STATUS" />);
    expect(container.textContent).toBe('');
  });
}); 
