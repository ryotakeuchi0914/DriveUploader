"use client";
import { useState, useEffect, useCallback } from 'react';
import Script from 'next/script';
import LoadingSpinner from '@/components/LoadingSpinner';
import AuthSection from '@/components/AuthSection';
import FolderPicker from '@/components/FolderPicker';
import FileUploader from '@/components/FileUploader';
import '../components/types';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLogoutLoading, setIsLogoutLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFolderName, setSelectedFolderName] = useState<string | null>(null);
  const [isPickerLoaded, setIsPickerLoaded] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // 認証状態を確認する
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('/api/auth-status', {
          method: 'GET',
        });

        if (res.ok) {
          const { authenticated, token } = await res.json();
          setIsAuthenticated(authenticated);
          if (token) {
            setAccessToken(token);
          }
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

  // Google APIのロード
  const loadGooglePicker = useCallback(() => {
    if (!window.gapi) return;
    
    window.gapi.load('picker', () => {
      setIsPickerLoaded(true);
    });
  }, []);

  // Google APIがロードされた後に実行
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      loadGooglePicker();
    }
  }, [isAuthenticated, accessToken, loadGooglePicker]);

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

  // ローディング中の表示
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Script 
        src="https://apis.google.com/js/api.js" 
        onLoad={() => {
          if (isAuthenticated && accessToken) {
            loadGooglePicker();
          }
        }}
      />
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-sans">
        <h1 className="text-3xl font-bold text-center text-gray-800">Google Drive Uploader</h1>

        {/* 認証セクション */}
        <AuthSection 
          isAuthenticated={isAuthenticated}
          isAuthenticating={isAuthenticating}
          isLogoutLoading={isLogoutLoading}
          onLogout={handleLogout}
          setIsAuthenticating={setIsAuthenticating}
        />

        {/* 認証済みの場合のみアップロードUIを表示 */}
        {isAuthenticated && (
          <div className="w-full max-w-md space-y-6">
            {/* フォルダ選択セクション */}
            <FolderPicker 
              isPickerLoaded={isPickerLoaded}
              accessToken={accessToken}
              selectedFolderName={selectedFolderName}
              setSelectedFolderId={setSelectedFolderId}
              setSelectedFolderName={setSelectedFolderName}
            />
            
            {/* ファイルアップローダー */}
            <FileUploader 
              file={file}
              setFile={setFile}
              selectedFolderId={selectedFolderId}
              isAuthenticated={isAuthenticated}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
              setSelectedFolderId={setSelectedFolderId}
              setSelectedFolderName={setSelectedFolderName}
            />
          </div>
        )}
      </div>
    </>
  );
}
