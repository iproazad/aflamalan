
import React, { useState } from 'react';
import ManageMovies from '../components/admin/ManageMovies';
import ManageAdmins from '../components/admin/ManageAdmins';
import ManageCategories from '../components/admin/ManageCategories';

type AdminTab = 'movies' | 'categories' | 'admins';

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('movies');

  const renderContent = () => {
    switch (activeTab) {
      case 'movies':
        return <ManageMovies />;
      case 'categories':
        return <ManageCategories />;
       case 'admins':
         return <ManageAdmins />;
      default:
        return <ManageMovies />;
    }
  };

  const TabButton: React.FC<{tab: AdminTab; label: string}> = ({tab, label}) => (
     <button
        onClick={() => setActiveTab(tab)}
        className={`px-6 py-3 font-bold rounded-t-lg transition-colors duration-300 ${activeTab === tab ? 'bg-gray-800 text-cyan-400' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
      >
        {label}
    </button>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-black text-white mb-8">لوحة تحكم المشرف</h1>
      <div className="flex border-b border-gray-700 mb-6">
        <TabButton tab="movies" label="إدارة الأفلام"/>
        <TabButton tab="categories" label="إدارة الفئات"/>
        <TabButton tab="admins" label="إدارة المشرفين"/>
      </div>
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminPage;