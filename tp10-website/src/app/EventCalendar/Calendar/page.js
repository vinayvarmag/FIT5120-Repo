// src/app/calendar/page.js
import CalendarClient from "./CalendarClient";
import { getUserId } from "@/lib/auth"; // reads the user_id cookie :contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3}

export default async function Page() {
    const userId = await getUserId();     // server-side
    return <CalendarClient userId={userId} />;
}
