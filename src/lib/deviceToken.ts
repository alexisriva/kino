'use client';

export function getOrCreateDeviceToken(): string {
  if (typeof window === 'undefined') return 'server_side_device_token';

  let token = localStorage.getItem('kino_device_token');
  if (!token) {
    token = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('kino_device_token', token);
  }
  return token;
}
