"use client";

import React, { useMemo } from "react";
import {
    LineChart as RCLineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

/*  Build a [{ date, amount }] array aggregated by day  */
export default function LineChart({ expenseItems = [] }) {      // default = []
    const data = useMemo(() => {
        const map = {};
        expenseItems.forEach((e) => {
            if (!e?.date) return;
            const d = e.date.substring(0, 10); // YYYY-MM-DD
            map[d] = (map[d] || 0) + Number(e.amount || 0);
        });
        return Object.entries(map)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .map(([date, amount]) => ({ date, amount }));
    }, [expenseItems]);

    if (!data.length) {
        return (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                No data
            </div>
        );
    }

    /*  Fixed-height wrapper keeps the chart size stable  */
    return (
        <div className="relative w-full h-64">      {/* h-64 ≈ 256 px; tweak as needed */}
            <ResponsiveContainer width="100%" height="100%">
                <RCLineChart
                    data={data}
                    margin={{ top: 10, right: 10, bottom: 0, left: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="currentColor"
                        strokeWidth={2}
                    />
                </RCLineChart>
            </ResponsiveContainer>
        </div>
    );
}
