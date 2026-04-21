/**
 * URL Validation & Security Helper
 * 
 * Prevents malicious, phishing, or private-network URLs from being stored
 */

// Known phishing/malware domains (extend this list as needed)
const BLOCKLIST_PATTERNS = [
  /phish/i,
  /malware/i,
  /bit\.ly\/[a-z0-9]+spam/i,
]

// Private IP ranges that should not be redirected to
const PRIVATE_IP_PATTERNS = [
  /^localhost$/i,
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^192\.168\./,
  /^::1$/,
  /^0\.0\.0\.0$/,
]

interface ValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Validate a URL before storing it:
 * 1. Must parse as a valid URL
 * 2. Must use http or https protocol
 * 3. Must not point to private/local IP ranges
 * 4. Must not match known malicious patterns
 */
export function validateUrl(url: string): ValidationResult {
  let parsed: URL

  try {
    parsed = new URL(url)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only http and https URLs are allowed' }
  }

  const hostname = parsed.hostname

  // Block private/local IP ranges
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, reason: 'URLs pointing to private networks are not allowed' }
    }
  }

  // Block known malicious patterns
  for (const pattern of BLOCKLIST_PATTERNS) {
    if (pattern.test(url)) {
      return { valid: false, reason: 'This URL has been flagged as potentially malicious' }
    }
  }

  // Must have a valid hostname (no empty host)
  if (!hostname || hostname.length < 2) {
    return { valid: false, reason: 'URL must have a valid hostname' }
  }

  return { valid: true }
}
