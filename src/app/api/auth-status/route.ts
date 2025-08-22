import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // cookies()はawaitなしで呼び出し
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    // アクセストークンがあれば認証済みと判断
    const isAuthenticated = !!accessToken;

    return NextResponse.json({ 
      authenticated: isAuthenticated 
    });
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return NextResponse.json(
      { error: '認証状態の確認に失敗しました' }, 
      { status: 500 }
    );
  }
}