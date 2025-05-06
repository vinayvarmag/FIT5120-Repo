"use client";
import { useEffect } from "react";
import { markCompleted } from "@/utils/progress";

export default function useMarkComplete(id, page) {
    useEffect(() => {
        markCompleted(id, page);
    }, [id, page]);
}
