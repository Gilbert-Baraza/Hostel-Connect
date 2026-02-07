import React from 'react';
import { Link } from 'react-router-dom';

/**
 * SkipLink Component
 * Provides keyboard navigation skip link for accessibility
 * Allows users to skip navigation and go directly to main content
 */
const SkipLink = () => {
  return (
    <Link
      to="#main-content"
      className="skip-link"
      onClick={(e) => {
        e.preventDefault();
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
          mainContent.tabIndex = -1;
          mainContent.focus();
          mainContent.removeAttribute('tabindex');
        }
      }}
    >
      Skip to main content
    </Link>
  );
};

export default SkipLink;
