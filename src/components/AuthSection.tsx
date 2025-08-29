"use client";
import { setCookie } from 'cookies-next';

interface AuthSectionProps {
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  isLogoutLoading: boolean;
  onLogout: () => Promise<void>;
  setIsAuthenticating: (value: boolean) => void;
}

export default function AuthSection({ 
  isAuthenticated, 
  isAuthenticating, 
  isLogoutLoading,
  onLogout,
  setIsAuthenticating 
}: AuthSectionProps) {
  
  // Google認証を開始
  const startAuth = () => {
    setIsAuthenticating(true);
    const state = Math.random().toString(36).substring(2);
    setCookie('state', state);
    window.location.href = `/api/auth?state=${state}`;
  };

  if (isAuthenticated) {
    return (
      <div className="w-full max-w-md bg-gray-100 p-4 rounded-lg shadow-sm">
        <p className="text-center text-lg">
          <span className="text-green-600 font-bold">認証済み ✅</span>
        </p>

        {/* 認証解除ボタン */}
        <div className="mt-3 text-center">
          <button
            onClick={onLogout}
            disabled={isLogoutLoading}
            className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 text-sm rounded-md transition duration-300 shadow"
          >
            {isLogoutLoading ? '処理中...' : '認証を解除する'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <p className="mb-4 text-gray-700">Google Driveへのアップロードには認証が必要です</p>
      <button
        onClick={startAuth}
        disabled={isAuthenticating}
        className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg ${
          isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isAuthenticating ? '認証中...' : 'Googleで認証する'}
      </button>
    </div>
  );
}