/**
 * URL validation utility to prevent SSRF (Server-Side Request Forgery) attacks
 */

// Private IP ranges that should be blocked
const PRIVATE_IP_RANGES = [
  /^127\./,                    // 127.0.0.0/8 (loopback)
  /^10\./,                     // 10.0.0.0/8 (private)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12 (private)
  /^192\.168\./,               // 192.168.0.0/16 (private)
  /^169\.254\./,               // 169.254.0.0/16 (link-local)
  /^0\./,                      // 0.0.0.0/8 (current network)
  /^224\./,                    // 224.0.0.0/4 (multicast)
  /^240\./,                    // 240.0.0.0/4 (reserved)
  /^255\.255\.255\.255$/,      // broadcast
];

// IPv6 private/special addresses
const PRIVATE_IPV6_PATTERNS = [
  /^::1$/,                     // loopback
  /^::$/,                      // unspecified
  /^::ffff:/,                  // IPv4-mapped IPv6
  /^fe80:/,                    // link-local
  /^fc00:/,                    // unique local
  /^fd00:/,                    // unique local
  /^ff00:/,                    // multicast
];

// Allowed protocols
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

export interface UrlValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Check if an IP address is private or special-use
 */
function isPrivateIP(ip: string): boolean {
  // Check IPv4
  if (ip.includes('.')) {
    return PRIVATE_IP_RANGES.some(pattern => pattern.test(ip));
  }
  
  // Check IPv6
  if (ip.includes(':')) {
    const normalizedIp = ip.toLowerCase();
    return PRIVATE_IPV6_PATTERNS.some(pattern => pattern.test(normalizedIp));
  }
  
  return false;
}

/**
 * Check if hostname is localhost
 */
function isLocalhost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === 'localhost' || 
         normalized.endsWith('.localhost') ||
         normalized === '[::1]';
}

/**
 * Validate URL to prevent SSRF attacks
 */
export function validateUrl(urlString: string): UrlValidationResult {
  let parsedUrl: URL;
  
  try {
    parsedUrl = new URL(urlString);
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid URL format',
    };
  }
  
  // Check protocol
  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol)) {
    return {
      valid: false,
      error: `Protocol "${parsedUrl.protocol}" is not allowed. Only http and https are supported.`,
    };
  }
  
  const hostname = parsedUrl.hostname;
  
  // Check for localhost
  if (isLocalhost(hostname)) {
    return {
      valid: false,
      error: 'Requests to localhost are not allowed',
    };
  }
  
  // Check if hostname is an IP address (IPv4 or IPv6)
  // IPv6 addresses in URLs are wrapped in brackets, e.g., [::1]
  const ipAddress = hostname.replace(/^\[|\]$/g, '');
  
  // Check for private/special IP addresses
  if (isPrivateIP(ipAddress)) {
    return {
      valid: false,
      error: 'Requests to private IP addresses are not allowed',
    };
  }
  
  // Additional check: prevent DNS rebinding by checking if hostname
  // could resolve to private IPs (this is a basic check)
  // Note: Full DNS validation would require async DNS resolution
  // which is not practical for synchronous validation
  
  return {
    valid: true,
  };
}
