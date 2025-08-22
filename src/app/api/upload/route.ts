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

export async function POST(request: NextRequest) {
  try {
    // フォームデータからファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'ファイルがアップロードされていません' }, 
        { status: 400 }
      );
    }
    
    // ファイルのバイナリデータを取得
    const buffer = Buffer.from(await file.arrayBuffer());
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

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

    const response = await drive.files.create({
      requestBody: {
        name: file.name, // ファイル名
      },
      media: {
        mimeType: file.type, // MIMEタイプ
        body: fileStream // ストリームを使用
      },
      fields: 'id, name',
    });

    return NextResponse.json({ 
      success: true, 
      fileId: response.data.id 
    });
    
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'ファイルアップロードに失敗しました' }, 
      { status: 500 }
    );
  }
}