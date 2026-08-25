import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DeviceCommunicator } from './DeviceCommunicator';

describe('DeviceCommunicator State Machine', () => {
  let communicator: DeviceCommunicator;

  beforeEach(() => {
    communicator = new DeviceCommunicator({
      host: '192.168.4.1',
      port: 80,
      endpoint: '/data',
      pollIntervalMs: 100,
    });
    vi.useFakeTimers();
    // Reset fetch mock
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    communicator.disconnect();
  });

  it('initial state should be DISCONNECTED', () => {
    expect(communicator.getState()).toBe('DISCONNECTED');
  });

  it('startConnecting should change state to CONNECTING and start polling', () => {
    communicator.startConnecting();
    expect(communicator.getState()).toBe('CONNECTING');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('successful poll should change state to CONNECTED and emit packet', async () => {
    const mockData = {
      wave: [1, 2, 3],
      spo2: 98,
      bpm: 72,
      finger: true,
      active: true,
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const packetListener = vi.fn();
    const stateListener = vi.fn();
    communicator.addPacketListener(packetListener);
    communicator.addStateListener(stateListener);

    // Initial state listener called immediately when registered
    expect(stateListener).toHaveBeenCalledWith('DISCONNECTED');

    communicator.startConnecting();

    // We need to wait for the microtasks to process the promise resolution
    await vi.runOnlyPendingTimersAsync();

    expect(communicator.getState()).toBe('CONNECTED');
    expect(stateListener).toHaveBeenCalledWith('CONNECTED');

    const packet = communicator.getLatestPacket();
    expect(packet.wave).toEqual([1, 2, 3]);
    expect(packet.spo2).toBe(98);
    expect(packet.bpm).toBe(72);

    // Test the latest packet listener arguments
    expect(packetListener).toHaveBeenLastCalledWith(packet);
  });

  it('failed poll (3 consecutive times) should change state to DEVICE_UNAVAILABLE', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    communicator.startConnecting();

    // The polling is async, wait for the promises to settle and timers to fire
    await vi.advanceTimersByTimeAsync(250);

    expect(communicator.getState()).toBe('DEVICE_UNAVAILABLE');
  });

  it('failed poll increments consecutive failures but doesn\'t change state until 3 failures', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    communicator.startConnecting();

    // State after 50ms (first poll has failed)
    await vi.advanceTimersByTimeAsync(50);
    expect(communicator.getState()).toBe('CONNECTING');

    // State after 150ms (second poll has failed)
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('CONNECTING');

    // State after 250ms (third poll has failed)
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('DEVICE_UNAVAILABLE');
  });

  it('successful poll after failure resets consecutive failures', async () => {
    let callCount = 0;
    (global.fetch as any).mockImplementation(() => {
      callCount++;
      if (callCount < 3) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ wave: [], spo2: 0, bpm: 0 }),
      });
    });

    communicator.startConnecting();

    // 1st fail (after 50ms)
    await vi.advanceTimersByTimeAsync(50);
    expect(communicator.getState()).toBe('CONNECTING');

    // 2nd fail (after 150ms)
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('CONNECTING');

    // 3rd try success (after 250ms)
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('CONNECTED');

    // Now fail again
    (global.fetch as any).mockImplementation(() => Promise.reject(new Error('Network error')));

    // Next poll fails (after 350ms)
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('CONNECTED'); // Still CONNECTED

    // It takes 3 MORE failures to go unavailable (after 450ms)
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('CONNECTED');

    // after 550ms -> 3rd failure
    await vi.advanceTimersByTimeAsync(100);
    expect(communicator.getState()).toBe('DEVICE_UNAVAILABLE');
  });

  it('disconnect should stop polling and set state to DISCONNECTED', () => {
    communicator.startConnecting();
    communicator.disconnect();
    expect(communicator.getState()).toBe('DISCONNECTED');
  });

  it('startSimulationMode should stop polling and set state to SIMULATING', () => {
    communicator.startSimulationMode();
    expect(communicator.getState()).toBe('SIMULATING');
  });
});
