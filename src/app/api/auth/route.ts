import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get('state');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // 認証URLを生成
  const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // offline に変更してrefresh tokenを取得できるようにする
    scope: ['https://www.googleapis.com/auth/drive.file'], // drive.fileスコープだけを使用
    state: state || '', // クエリパラメータから受け取ったstate値を設定
    prompt: 'consent', // 毎回同意画面を表示し、refresh tokenを確実に取得
    include_granted_scopes: true // すでに許可されたスコープを含める
  });

  // Google認証ページにリダイレクト
  return NextResponse.redirect(authorizationUrl);
}