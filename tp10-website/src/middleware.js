import { NextResponse } from 'next/server';

export function middleware(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
        const encoded = authHeader.split(' ')[1];         // Get the base64 part
        const decoded = atob(encoded);                     // Decode into "username:password"
        const parts = decoded.split(':');                  // Split into [username, password]
        const password = parts[1];                         // Extract only the password

        if (password === process.env.SITE_PASSWORD) {
            return NextResponse.next();
        }
    }

    return new Response('Password Required', {
        status: 401,
        headers: {
            'WWW-Authenticate': 'Basic realm="Protected", charset="UTF-8"',
        },
    });
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};