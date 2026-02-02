import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-50 dark:bg-gray-900 shadow-md">
        <Header />
      </div>

      <div className="flex flex-1 pt-[64px]">
        {/* Sidebar */}
        <div className="sticky top-0 h-screen z-40 bg-white dark:bg-gray-800 overflow-y-auto">
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>

          {/* Footer */}
          <div className="sticky bottom-0 z-50 bg-gray-50 dark:bg-gray-900">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;