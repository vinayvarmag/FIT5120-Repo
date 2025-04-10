"use client";

// Force dynamic rendering so that the page is not statically pre-rendered.
export const dynamic = "force-dynamic";

import React, { Suspense } from "react";
import FinanceDashboardContent from "./FinanceDashboardContent";

export default function FinanceDashboardPage() {
    return (
        <Suspense fallback={<div>Loading Finance Dashboard...</div>}>
            <FinanceDashboardContent />
        </Suspense>
    );
}