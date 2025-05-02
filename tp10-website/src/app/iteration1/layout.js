// app/[version]/layout.js
import Navbar from "@/components/Navbar";

export default function VersionLayout({ children, params }) {
    return (
        <>
            <Navbar version={params.version} />
            {children}
        </>
    );
}
