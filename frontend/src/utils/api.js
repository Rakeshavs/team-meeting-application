const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const wsBaseUrl = (import.meta.env.VITE_WS_BASE_URL || '').replace(/\/$/, '');

export function buildApiUrl(path) {
  if (!path.startsWith('/')) {
    throw new Error(`API path must start with "/": ${path}`);
  }

  return apiBaseUrl ? `${apiBaseUrl}${path}` : path;
}

export function buildWebSocketUrl(path) {
  if (!path.startsWith('/')) {
    throw new Error(`WebSocket path must start with "/": ${path}`);
  }

  // 1. If explicit WS URL is provided, use it
  if (wsBaseUrl) {
    return `${wsBaseUrl}${path}`;
  }

  // 2. If API URL is an absolute URL, derive WS URL from it
  if (apiBaseUrl.startsWith('http')) {
    const url = new URL(apiBaseUrl);
    const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${url.host}${path}`;
  }

  // 3. Fallback to current browser host
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}${path}`;
}
