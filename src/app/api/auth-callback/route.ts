import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // クッキーに保存されたstate値を取得
  const cookieStore = await cookies();
  const savedState = cookieStore.get('state')?.value;

  // デバッグ用ログ出力
  console.log('State from query:', state);
  console.log('State from cookie:', savedState);

  // CSRF対策: クッキーに保存されたstate値と一致するか確認
  if (state !== savedState) {
    return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
  }

  // 新しいstate値をクッキーに保存（10分間有効）
  cookieStore.set('state', state || '', { maxAge: 600 });

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  try {
    // 認可コードを使ってアクセストークンを取得
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // アクセストークンをクッキーに保存（1時間有効）
    cookieStore.set('access_token', tokens.access_token || '', { maxAge: 3600 });

    console.log('Access Token:', tokens.access_token);

    // 認証後にホームページにリダイレクト
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('Error retrieving access token:', error);
    return NextResponse.json({ error: 'トークン取得失敗' }, { status: 500 });
  }
}