
import React, { useState } from 'react';
import ManageMovies from '../components/admin/ManageMovies';
import ManageAdmins from '../components/admin/ManageAdmins';
import ManageCategories from '../components/admin/ManageCategories';

// Define the structure for a tab configuration
interface TabConfig {
  key: string;
  label: string;
  component: React.ReactElement;
}

// Array of tab configurations makes it easy to add/remove sections
const adminTabs: TabConfig[] = [
  { key: 'movies', label: 'إدارة الأفلام', component: <ManageMovies /> },
  { key: 'categories', label: 'إدارة الفئات', component: <ManageCategories /> },
  { key: 'admins', label: 'إدارة المشرفين', component: <ManageAdmins /> },
];

// A reusable tab component as requested
const AdminTabButton: React.FC<{
  label: string;
  tabKey: string;
  activeTab: string;
  onClick: (tabKey: string) => void;
}> = ({ label, tabKey, activeTab, onClick }) => (
  <button
    onClick={() => onClick(tabKey)}
    className={`px-6 py-3 font-bold rounded-t-lg transition-colors duration-300 ${
      activeTab === tabKey
        ? 'bg-gray-800 text-cyan-400'
        : 'bg-gray-700 text-white hover:bg-gray-600'
    }`}
    role="tab"
    aria-selected={activeTab === tabKey}
  >
    {label}
  </button>
);

const AdminPage: React.FC = () => {
  // Initialize state with the key of the first tab
  const [activeTab, setActiveTab] = useState<string>(adminTabs[0].key);

  // Find the component to render based on the active tab key
  const activeComponent = adminTabs.find(tab => tab.key === activeTab)?.component;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-white mb-8">لوحة تحكم المشرف</h1>
      
      {/* Map over the configuration array to render tabs */}
      <div className="flex border-b border-gray-700 mb-6" role="tablist">
        {adminTabs.map(tab => (
          <AdminTabButton
            key={tab.key}
            label={tab.label}
            tabKey={tab.key}
            activeTab={activeTab}
            onClick={setActiveTab}
          />
        ))}
      </div>
      
      {/* Render the active component */}
      <div role="tabpanel">
        {activeComponent}
      </div>
    </div>
  );
};

export default AdminPage;
