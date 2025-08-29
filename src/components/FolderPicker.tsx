"use client";
import { useCallback } from 'react';
import { GooglePickerResponse } from './types';

interface FolderPickerProps {
  isPickerLoaded: boolean;
  accessToken: string | null;
  selectedFolderName: string | null;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedFolderName: (name: string | null) => void;
}

export default function FolderPicker({
  isPickerLoaded,
  accessToken,
  selectedFolderName,
  setSelectedFolderId,
  setSelectedFolderName
}: FolderPickerProps) {
  
  // Google Pickerを開く
  const openPicker = useCallback(() => {
    if (!isPickerLoaded || !accessToken) {
      alert('Google Pickerの読み込みが完了していないか、認証されていません');
      return;
    }

    // フォルダ選択用のビューを作成
    const folderView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes('application/vnd.google-apps.folder');
    
    // Pickerの構築
    const picker = new window.google.picker.PickerBuilder()
      .addView(folderView)
      .setOAuthToken(accessToken)
      .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY)
      // UIカスタマイズオプション
      .setTitle('保存先フォルダを選択')  // タイトルをカスタマイズ
      .setSize(800, 600)  // サイズを指定 (幅, 高さ)
      .setOrigin(window.location.protocol + '//' + window.location.host) // オリジン設定
      // ナビゲーション機能を明示的に有効化（NAV_HIDDENをfalseに設定）
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN, false)
      // 自分のファイルのみ表示
      .enableFeature(window.google.picker.Feature.MINE_ONLY, true)
      .setCallback((data: GooglePickerResponse) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const folder = data.docs?.[0];
          if (folder) {
            setSelectedFolderId(folder.id);
            setSelectedFolderName(folder.name);
          }
        }
      })
      .build();
    
    picker.setVisible(true);
  }, [isPickerLoaded, accessToken, setSelectedFolderId, setSelectedFolderName]);

  return (
    <div className="space-y-2">
      <label className="block text-gray-700">保存先フォルダ</label>
      <div className="flex items-center gap-2">
        <button
          onClick={openPicker}
          disabled={!isPickerLoaded || !accessToken}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 flex-1"
        >
          フォルダを選択
        </button>
      </div>
      {selectedFolderName && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            選択したフォルダ: {selectedFolderName}
          </p>
        </div>
      )}
    </div>
  );
}