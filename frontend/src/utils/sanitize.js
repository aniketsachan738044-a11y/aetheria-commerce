import DOMPurify from 'dompurify';

/**
 * Sanitizes any raw string or user-generated text against XSS attacks
 * @param {string} dirty 
 * @returns {string} clean string
 */
export const sanitize = (dirty) => {
  if (typeof dirty !== 'string') return '';
  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};
