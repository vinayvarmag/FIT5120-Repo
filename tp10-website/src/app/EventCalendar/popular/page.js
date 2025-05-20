// src/app/melbourne-events/page.js
import MelbourneEventsClient from "./PopularClient";
import { getUserId } from "@/lib/auth";  // reads the user_id cookie :contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1}

export default async function Page() {
    const userId = await getUserId();      // server-side
    return <MelbourneEventsClient userId={userId} />;
}
