import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { Readable } from 'stream';

// バッファからストリームを作成するヘルパー関数
function bufferToStream(buffer: Buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function POST(request: NextRequest) {
  try {
    // フォームデータからファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      );
    }

    // ファイルのバイナリデータを取得
    const buffer = Buffer.from(await file.arrayBuffer());

    // クッキーからアクセストークンを取得
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'アクセストークンがありません。' },
        { status: 401 }
      );
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // バッファからストリームを作成
    const fileStream = bufferToStream(buffer);

    // 「DriveUploader」フォルダを検索
    const folderName = 'DriveUploader';
    const folderQuery = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const folderList = await drive.files.list({
      q: folderQuery,
      fields: 'files(id, name)',
    });

    let folderId: string;

    if (folderList.data.files && folderList.data.files.length > 0) {
      // フォルダが存在する場合、そのIDを取得
      folderId = folderList.data.files[0].id!;
    } else {
      // フォルダが存在しない場合、新規作成
      const folderMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folderId = folder.data.id!;
    }

    // 同名ファイルが存在する場合のリネーム処理
    const originalFileName = file.name;
    let newFileName = originalFileName;
    let fileIndex = 1;

    while (true) {
      const existingFiles = await drive.files.list({
        q: `name='${newFileName}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      });

      if (existingFiles.data.files && existingFiles.data.files.length > 0) {
        // 同名ファイルが存在する場合、名前に番号を付ける
        const extensionIndex = originalFileName.lastIndexOf('.');
        if (extensionIndex !== -1) {
          const baseName = originalFileName.substring(0, extensionIndex);
          const extension = originalFileName.substring(extensionIndex);
          newFileName = `${baseName}(${fileIndex})${extension}`;
        } else {
          newFileName = `${originalFileName}(${fileIndex})`;
        }
        fileIndex++;
      } else {
        // 同名ファイルが存在しない場合、ループを抜ける
        break;
      }
    }

    // ファイルをアップロード
    const fileMetadata = {
      name: newFileName,
      parents: [folderId], // フォルダIDを指定
    };
    const media = {
      mimeType: file.type,
      body: fileStream,
    };
    const uploadedFile = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id',
    });

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.data.id,
    });
  } catch (error) {
    console.error('Google Drive API エラー:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロードに失敗しました' },
      { status: 500 }
    );
  }
}