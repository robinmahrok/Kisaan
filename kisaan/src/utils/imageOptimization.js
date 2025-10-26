/**
 * Image Optimization Utilities for SEO
 * Use these utilities to optimize images for better page load times
 */

/**
 * Lazy load images
 * @param {HTMLImageElement} imgElement - The image element to lazy load
 */
export const lazyLoadImage = (imgElement) => {
  if ("loading" in HTMLImageElement.prototype) {
    imgElement.loading = "lazy";
  }
};

/**
 * Get optimized image props
 * Use this to get proper attributes for images
 * @param {string} src - Image source
 * @param {string} alt - Alt text for accessibility and SEO
 * @returns {object} Image props with loading and alt attributes
 */
export const getOptimizedImageProps = (src, alt) => ({
  src,
  alt,
  loading: "lazy",
  decoding: "async",
});

/**
 * Usage example:
 * <img {...getOptimizedImageProps('/path/to/image.jpg', 'Descriptive alt text')} />
 *
 * Or manually:
 * <img src="/path/to/image.jpg" alt="Descriptive alt text" loading="lazy" />
 */
