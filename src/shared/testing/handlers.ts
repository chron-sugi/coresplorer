import { http, HttpResponse } from 'msw';

export const handlers = [
  // Example handler; extend with real API mocks as needed
  http.get('/health', () => HttpResponse.json({ status: 'ok' })),
];
