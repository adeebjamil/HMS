import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');
  const [selectedTheme, setSelectedTheme] = useState('light');
  
  useEffect(() => {
    // Get saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    setSelectedTheme(savedTheme);
  }, []);
  
  const selectTheme = (theme) => {
    setSelectedTheme(theme);
  };
  
  const saveTheme = async () => {
    try {
      setLoading(true);
      
      // Set the theme state
      setTheme(selectedTheme);
      
      // Save theme to localStorage
      localStorage.setItem('theme', selectedTheme);
      
      // Apply theme to the document
      if (selectedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Error updating theme:', error);
      toast.error('Failed to update theme');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-primary-700 dark:text-primary-300 mb-6">Appearance Settings</h1>
      
      <div className="bg-white dark:bg-secondary-600 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Theme</h2>
        
        <div className="grid grid-cols-2 gap-4 max-w-md">
          <div
            className={`border rounded-lg p-4 cursor-pointer transition ${
              selectedTheme === 'light'
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-500'
                : 'border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-secondary-500'
            }`}
            onClick={() => selectTheme('light')}
          >
            <div className="bg-white border border-gray-200 rounded-md p-3 mb-3 shadow-sm">
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-100 rounded mt-2"></div>
              <div className="h-3 w-1/2 bg-gray-100 rounded mt-1"></div>
            </div>
            <p className="text-sm font-medium text-center dark:text-gray-200">Light</p>
          </div>
          
          <div
            className={`border rounded-lg p-4 cursor-pointer transition ${
              selectedTheme === 'dark'
                ? 'bg-primary-50 border-primary-300 ring-2 ring-primary-500'
                : 'border-gray-200 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-secondary-500'
            }`}
            onClick={() => selectTheme('dark')}
          >
            <div className="bg-gray-800 border border-gray-700 rounded-md p-3 mb-3 shadow-sm">
              <div className="h-4 w-1/2 bg-gray-600 rounded"></div>
              <div className="h-3 w-3/4 bg-gray-700 rounded mt-2"></div>
              <div className="h-3 w-1/2 bg-gray-700 rounded mt-1"></div>
            </div>
            <p className="text-sm font-medium text-center dark:text-gray-200">Dark</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-300 mt-4 mb-6">
          Choose the theme that's easiest on your eyes. Click save to apply your selection.
        </p>
        
        {/* Add save button */}
        <button
          onClick={saveTheme}
          disabled={loading || theme === selectedTheme}
          className={`px-4 py-2 rounded-md font-medium ${
            theme === selectedTheme
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400'
              : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
          }`}
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}