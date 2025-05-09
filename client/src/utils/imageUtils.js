// Helper function to format image URLs
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return 'http://localhost:5000/uploads/no-image.jpg';
  
  // If the URL is already absolute (starts with http or https), use local fallback
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return `http://localhost:5000/uploads/${imageUrl.split('/').pop()}`; // Get the filename from the URL
  }
  
  // If it's a local path starting with /uploads, prepend server URL
  if (imageUrl.startsWith('/uploads/')) {
    return `http://localhost:5000${imageUrl}`;
  }
  
  // Otherwise, assume it's a filename and prepend the server URL and uploads path
  return `http://localhost:5000/uploads/${imageUrl}`;
}; 