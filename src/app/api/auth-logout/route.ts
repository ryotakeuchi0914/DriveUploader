import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // クッキーストアを取得
    const cookieStore = await cookies();
    
    // access_tokenクッキーを削除（有効期限を過去に設定）
    cookieStore.set('access_token', '', { 
      maxAge: 0,
      expires: new Date(0)
    });
    
    // stateクッキーも削除
    cookieStore.set('state', '', { 
      maxAge: 0,
      expires: new Date(0)
    });

    return NextResponse.json({ 
      success: true,
      message: '認証が正常に解除されました' 
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: '認証解除に失敗しました' }, 
      { status: 500 }
    );
  }
}