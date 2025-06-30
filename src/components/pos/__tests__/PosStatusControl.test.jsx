import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import PosStatusControl from '../PosStatusControl';
import posAPI from '../../../services/posAPI';

// API 모킹
vi.mock('../../../services/posAPI');

describe('PosStatusControl', () => {
  const mockStore = configureStore([]);
  let store;
  
  beforeEach(() => {
    // 스토어 초기화
    store = mockStore({
      pos: {
        status: 'OPEN',
        lastUpdated: new Date().toISOString()
      }
    });

    // API 모킹 초기화
    vi.mocked(posAPI).updatePosStatus.mockReset();
  });

  test('renders status buttons correctly', () => {
    render(
      <Provider store={store}>
        <PosStatusControl />
      </Provider>
    );

    expect(screen.getByRole('button', { name: /영업 시작/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /휴식/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /영업 종료/ })).toBeInTheDocument();
  });

  test('handles status update success', async () => {
    const mockResponse = { status: 'BREAK', timestamp: new Date().toISOString() };
    vi.mocked(posAPI).updatePosStatus.mockResolvedValueOnce(mockResponse);

    render(
      <Provider store={store}>
        <PosStatusControl />
      </Provider>
    );

    const breakButton = screen.getByRole('button', { name: /휴식/ });
    await fireEvent.click(breakButton);

    expect(posAPI.updatePosStatus).toHaveBeenCalledWith('BREAK');
    expect(store.getActions()).toContainEqual({
      type: 'pos/updateStatus',
      payload: mockResponse
    });
  });

  test('handles status update failure', async () => {
    const mockError = new Error('API Error');
    vi.mocked(posAPI).updatePosStatus.mockRejectedValueOnce(mockError);

    render(
      <Provider store={store}>
        <PosStatusControl />
      </Provider>
    );

    const breakButton = screen.getByRole('button', { name: /휴식/ });
    await fireEvent.click(breakButton);

    expect(posAPI.updatePosStatus).toHaveBeenCalledWith('BREAK');
    expect(store.getActions()).not.toContainEqual({
      type: 'pos/updateStatus',
      payload: expect.anything()
    });
  });

  test('disables current status button', () => {
    store = mockStore({
      pos: {
        status: 'BREAK',
        lastUpdated: new Date().toISOString()
      }
    });

    render(
      <Provider store={store}>
        <PosStatusControl />
      </Provider>
    );

    const breakButton = screen.getByRole('button', { name: /휴식/ });
    expect(breakButton).toBeDisabled();
  });

  test('shows confirmation dialog for status change', async () => {
    render(
      <Provider store={store}>
        <PosStatusControl />
      </Provider>
    );

    const closeButton = screen.getByRole('button', { name: /영업 종료/ });
    await fireEvent.click(closeButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/영업을 종료하시겠습니까/)).toBeInTheDocument();
  });
}); 
