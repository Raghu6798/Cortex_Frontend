import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Ensure this environment variable is set in your Next.js configuration or .env file
const API_BASE_URL = 'https://cortex-l8hf.onrender.com';
const BACKEND_ENDPOINT = `${API_BASE_URL}/api/v1/secrets`;

/**
 * GET /api/secrets
 * Proxies the request to GET /api/v1/secrets to list all user secrets (metadata only).
 */
export async function GET() {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    // Proxy the GET request to the backend
    const response = await fetch(BACKEND_ENDPOINT, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Cache-control headers are important for freshness
      cache: 'no-store' 
    });

    // Forward the response status and data/error
    if (!response.ok) {
      const errorData = await response.text();
      return new NextResponse(errorData, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error listing secrets:', error);
    return NextResponse.json(
      { error: 'Failed to list secrets', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/secrets
 * Proxies the request to POST /api/v1/secrets to create a new secret.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, getToken } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: 'No authentication token' }, { status: 401 });
    }

    const body = await request.json();

    // Proxy the POST request to the backend
    const response = await fetch(BACKEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Forward the response status and data/error
    if (!response.ok) {
      const errorData = await response.text();
      return new NextResponse(errorData, { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status }); // Use backend status (e.g., 201)

  } catch (error) {
    console.error('Error creating secret:', error);
    return NextResponse.json(
      { error: 'Failed to create secret', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}