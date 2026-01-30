/**
 * Sanitize a string using DOMPurify (client-side only)
 * On server-side, returns the original string to avoid __dirname issues
 */
const sanitizeString = (str: string): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use DOMPurify
    // Dynamic import is handled at module level for performance
    const DOMPurify = require('dompurify');
    return DOMPurify.sanitize(str);
  }
  // Server-side: return trimmed string (basic sanitization)
  // Full sanitization will happen on client-side
  return str;
};

/**
 * Sanitizes data by removing potentially harmful content
 * @param data - The data to sanitize
 * @returns Sanitized data
 */
export const sanitizeData = (data: unknown): unknown => {
  try {
    if (!data) {
      return data;
    }

    // Handle different data types
    if (typeof data === 'string') {
      // Allow email addresses to pass through without sanitizing
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(data)) {
        return data;
      }
      const trimmedData = data?.trim();
      return sanitizeString(trimmedData);
    }

    if (Array.isArray(data)) {
      return data.map((item) => {
        if (typeof item === 'string') {
          const trimmedItem = item?.trim();
          return sanitizeData(trimmedItem);
        }
        return sanitizeData(item);
      });
    }

    if (typeof data === 'object') {
      const sanitizedData: { [key: string]: unknown } = {};
      for (const [key, value] of Object.entries(data)) {
        const trimmedValue = typeof value === 'string' ? value?.trim() : value;
        sanitizedData[key] = sanitizeData(trimmedValue);
      }
      return sanitizedData;
    }

    return data;
  } catch (error) {
    console.error('Error sanitizing data:', error);
    return data; // Return original data if sanitization fails
  }
};

/**
 * Sanitizes URL by cleaning both path parameters and query parameters
 * @param url - The URL to sanitize
 * @returns Sanitized URL
 */
export const sanitizeUrl = (url: string): string => {
  try {
    // Split URL into base path and query string
    const [basePath, queryString] = url.split('?');

    // Sanitize path parameters
    const pathParts = basePath.split('/');
    const sanitizedPathParts = pathParts.map((part) => sanitizeData(decodeURIComponent(part)));
    const sanitizedBasePath = sanitizedPathParts.join('/');

    // If there's no query string, return the sanitized base path
    if (!queryString) {
      return sanitizedBasePath;
    }

    // Parse and sanitize query parameters
    const searchParams = new URLSearchParams(queryString);
    const sanitizedParams = new URLSearchParams();

    searchParams.forEach((value, key) => {
      sanitizedParams.append(
        sanitizeData(key) as string,
        sanitizeData(decodeURIComponent(value)) as string,
      );
    });

    // Reconstruct the URL with sanitized parts
    const sanitizedQueryString = sanitizedParams.toString();
    return sanitizedQueryString
      ? `${sanitizedBasePath}?${sanitizedQueryString}`
      : sanitizedBasePath;
  } catch (error) {
    console.error('Error sanitizing URL:', error);
    return url; // Return original URL if sanitization fails
  }
};
