export default function ProgressBar({ value }) {
    return (
        <div className="h-2 w-full overflow-hidden rounded bg-gray-200">
            <div
                style={{ width: `${value}%` }}
                className="h-full rounded bg-emerald-500 transition-all"
            />
        </div>
    );
}
