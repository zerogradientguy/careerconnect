export function getBackendUrl(path) {
  if (path && path.startsWith('/uploads/')) {
    return `http://localhost:5000${path}`;
  }
  return path;
} 