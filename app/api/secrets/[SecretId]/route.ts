// raghu6798-cortex_frontend/app/api/secrets/[SecretId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cortex-l8hf.onrender.com';


export async function DELETE(
  request: NextRequest,
  { params }: { params: { SecretId: string } }
) {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const { SecretId } = params;
    const backendUrl = `${API_BASE_URL}/api/v1/secrets/${SecretId}`;

    // Proxy the DELETE request to the backend
    const response = await fetch(backendUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Note: DELETE requests often don't require a body/Content-Type
      },
    });

    // Forward the response status and data/error
    if (!response.ok) {
      const errorData = await response.text();
      return new NextResponse(errorData, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    if (response.status === 204) {
        return new NextResponse(null, { status: 204 });
    }

    // If it returns a body (e.g., {"message": "deleted"}), forward that too
    const data = await response.json().catch(() => ({})); 
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error deleting secret:', error);
    return NextResponse.json(
      { error: 'Failed to delete secret', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}