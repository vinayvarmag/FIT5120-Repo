// src/app/saved/page.js
import { getUserId } from '@/lib/auth';      // reads the `user_id` cookie :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}
import SavedEventsClient from './SavedEventsClient';

export default async function Page() {
    const userId = await getUserId();

    if (!userId) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Please log in</h1>
                    <p>
                        You must{' '}
                        <a href="/login" className="underline text-purple-700">
                            log in
                        </a>{' '}
                        to view your saved events.
                    </p>
                </div>
            </main>
        );
    }

    return <SavedEventsClient />;
}
