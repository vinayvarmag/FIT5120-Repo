import { redirect } from "next/navigation";

export default function ModuleIndex({ params }) {
    redirect(`/modules/${params.id}/overview`);
}
