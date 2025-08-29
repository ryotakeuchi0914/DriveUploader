"use client";

interface FileUploaderProps {
  file: File | null;
  setFile: (file: File | null) => void;
  selectedFolderId: string | null;
  isAuthenticated: boolean;
  isUploading: boolean;
  setIsUploading: (value: boolean) => void;
  setSelectedFolderId: (id: string | null) => void;
  setSelectedFolderName: (name: string | null) => void;
}

export default function FileUploader({
  file,
  setFile,
  selectedFolderId,
  isAuthenticated,
  isUploading,
  setIsUploading,
  setSelectedFolderId,
  setSelectedFolderName
}: FileUploaderProps) {
  
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

    if (!selectedFolderId) {
      alert('保存先フォルダを選択してください');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderId', selectedFolderId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();
        alert(`アップロード成功！ファイルID: ${result.fileId}`);
        // アップロード後にフォーム状態をリセット
        setFile(null);
        setSelectedFolderId(null);
        setSelectedFolderName(null);
      } else {
        alert('アップロードに失敗しました');
      }
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('アップロード中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* ファイル選択セクション */}
      <div className="space-y-4">
        <div className="relative">
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="ファイルを選択してください"
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
        disabled={!file || !selectedFolderId || isUploading}
        className={`w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-lg ${
          !file || !selectedFolderId || isUploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isUploading ? 'アップロード中...' : 'アップロード'}
      </button>
    </>
  );
}