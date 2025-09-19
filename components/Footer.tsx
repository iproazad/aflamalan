
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 border-t border-gray-700 mt-12">
      <div className="container mx-auto px-4 py-6 text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} افلام. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};

export default Footer;
