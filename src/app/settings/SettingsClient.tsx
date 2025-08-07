'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface SettingsClientProps {
  user: User;
}

export default function SettingsClient({ user }: SettingsClientProps) {
  const [name, setName] = useState(user.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const router = useRouter();

  const handleUpdateName = async () => {
    if (!name.trim()) {
      setMessage('Name cannot be empty');
      return;
    }

    setIsUpdating(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (response.ok) {
        setMessage('Name updated successfully!');
        router.refresh();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to update name');
      }
    } catch (error) {
      setMessage('Failed to update name');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetDatabase = async () => {
    setIsResetting(true);
    setMessage('');

    try {
      const response = await fetch('/api/database/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage('Database reset successfully! All job data has been cleared.');
        setShowResetConfirm(false);
        // Refresh the page to update any cached data
        router.refresh();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to reset database');
      }
    } catch (error) {
      setMessage('Failed to reset database');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Account Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Display Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your display name"
              />
              <button
                onClick={handleUpdateName}
                disabled={isUpdating || name === user.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Database Management</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-900 mb-2">Reset Database</h3>
            <p className="text-sm text-red-700 mb-4">
              This will permanently delete all job data, search configurations, and related information. 
              Your user account will remain intact. This action cannot be undone.
            </p>
            
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reset Database
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm font-medium text-red-900">
                  Are you sure you want to reset the database? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleResetDatabase}
                    disabled={isResetting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    {isResetting ? 'Resetting...' : 'Yes, Reset Database'}
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    disabled={isResetting}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('successfully') 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-center">
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
