"use client";
import { useState, useEffect } from 'react';
import { setCookie } from 'cookies-next';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false); // アップロード中の状態を管理
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false); // 認証中の状態を管理

  // 認証状態を確認する
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/auth-status', {
          method: 'GET',
        });

        if (res.ok) {
          const { authenticated } = await res.json();
          setIsAuthenticated(authenticated);
        } else {
          console.error('認証状態の確認に失敗しました');
        }
      } catch (error) {
        console.error('認証確認エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Google認証を開始
  const startAuth = () => {
    setIsAuthenticating(true); // 認証中の状態を設定
    const state = Math.random().toString(36).substring(2); // ランダムなstate値を生成
    setCookie('state', state); // クッキーに保存

    // 認証エンドポイントにリダイレクト
    window.location.href = `/api/auth?state=${state}`;
  };

  // 認証を解除
  const handleLogout = async () => {
    setIsLogoutLoading(true);
    try {
      const res = await fetch('/api/auth-logout', {
        method: 'POST',
      });

      if (res.ok) {
        setIsAuthenticated(false);
        alert('認証が解除されました');
      } else {
        alert('認証の解除に失敗しました');
      }
    } catch (error) {
      console.error('ログアウトエラー:', error);
      alert('認証の解除中にエラーが発生しました');
    } finally {
      setIsLogoutLoading(false);
    }
  };

  // ファイル選択
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  // ファイルアップロード
  const handleUpload = async () => {
    if (!file) {
      alert('ファイルを選択してください');
      return;
    }

    if (!isAuthenticated) {
      alert('アップロードには認証が必要です');
      return;
    }

    setIsUploading(true); // アップロード中の状態を設定
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        alert(`アップロード成功！ファイルID: ${result.fileId}`);
      } else {
        alert('アップロードに失敗しました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false); // アップロード終了
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-700">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-sans">
      <h1 className="text-3xl font-bold text-center text-gray-800">Google Drive Uploader</h1>

      {/* 認証状態表示 */}
      <div className="w-full max-w-md bg-gray-100 p-4 rounded-lg shadow-sm">
        <p className="text-center text-lg">
          {isAuthenticated ? (
            <span className="text-green-600 font-bold">認証済み ✅</span>
          ) : (
            <span className="text-red-600 font-bold">未認証 ❌</span>
          )}
        </p>

        {/* 認証解除ボタン */}
        {isAuthenticated && (
          <div className="mt-3 text-center">
            <button
              onClick={handleLogout}
              disabled={isLogoutLoading}
              className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 text-sm rounded-md transition duration-300 shadow"
            >
              {isLogoutLoading ? '処理中...' : '認証を解除する'}
            </button>
          </div>
        )}
      </div>

      {/* 認証ボタンまたはアップロード機能 */}
      {!isAuthenticated ? (
        <div className="text-center">
          <p className="mb-4 text-gray-700">Google Driveへのアップロードには認証が必要です</p>
          <button
            onClick={startAuth}
            disabled={isAuthenticating} // 認証中は無効化
            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg ${
              isAuthenticating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isAuthenticating ? '認証中...' : 'Googleで認証する'}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="ファイルを選択してください" // アクセシビリティ対応
              />
              <button
                type="button"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {file ? file.name : 'ファイルを選択してください'}
              </button>
            </div>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || isUploading} // アップロード中は無効化
            className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg ${
              !file || isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'アップロード中...' : 'アップロード'}
          </button>
        </div>
      )}
    </div>
  );
}
