import { useEffect, useRef } from 'react';

/**
 * useDocumentTitle Hook
 * Custom hook for managing document title with support for prefixes/suffixes
 * 
 * @param {string} title - The title to set
 * @param {Object} options - Configuration options
 * @param {boolean} options.append - Whether to append to default title (default: false)
 * @param {boolean} options.prepend - Whether to prepend to default title (default: false)
 * @param {string} options.separator - Separator between titles (default: ' | ')
 * @param {string} options.defaultTitle - Default title to use as base (default: 'Hostel Connect')
 * 
 * @example
 * // Simple usage
 * useDocumentTitle('My Dashboard');
 * 
 * // Append to default title
 * useDocumentTitle('Dashboard', { append: true });
 * // Results in: "Dashboard | Hostel Connect"
 * 
 * // Prepend to default title
 * useDocumentTitle('Admin', { prepend: true });
 * // Results in: "Hostel Connect | Admin"
 */
const useDocumentTitle = (title, options = {}) => {
  const {
    append = false,
    prepend = false,
    separator = ' | ',
    defaultTitle = 'Hostel Connect'
  } = options;

  const titleRef = useRef(title);

  useEffect(() => {
    const baseTitle = defaultTitle;
    let newTitle;

    if (append) {
      newTitle = `${titleRef.current}${separator}${baseTitle}`;
    } else if (prepend) {
      newTitle = `${baseTitle}${separator}${titleRef.current}`;
    } else {
      newTitle = titleRef.current || baseTitle;
    }

    // Store the original title
    const originalTitle = document.title;
    document.title = newTitle;

    // Restore original title on cleanup
    return () => {
      document.title = originalTitle;
    };
  }, [title, append, prepend, separator, defaultTitle]);
};

export default useDocumentTitle;
