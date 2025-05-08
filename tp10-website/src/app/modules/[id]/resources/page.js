// src/app/modules/[id]/resources/page.jsx
import { notFound }       from 'next/navigation';
import { modulesById }    from '@/lib/learningModules';
import ResourcesClient    from './ResourcesClient';

export default async function ResourcesPage({ params }) {
    /* 👈  “await params” removes the sync‑dynamic‑apis warning */
    const { id } = await params;

    const currentModule = modulesById[id];
    if (!currentModule) notFound();

    return <ResourcesClient currentModule={currentModule} />;
}
