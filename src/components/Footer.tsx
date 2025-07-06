
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          © 2024 Travel Pro. Sistem Pengelolaan Perjalanan Dinas.
        </div>
        <div className="flex space-x-6 mt-2 md:mt-0">
          <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            Bantuan
          </a>
          <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            Kebijakan Privasi
          </a>
          <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            Syarat & Ketentuan
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
