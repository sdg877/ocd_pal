"use client";

import { useEffect, useState } from "react";

type Check = {
  id: string;
  signedUrl: string;
  checked_at: string;
  checklist_items: { name: string } | null;
};

export default function CheckHistory() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/checks/history")
      .then((res) => res.json())
      .then((data) => {
        setChecks(data.checks || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-sm text-gray-500">Loading history…</p>;

  if (checks.length === 0) {
    return <p className="text-sm text-gray-500">No checks yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {checks.map((check) => (
        <div key={check.id} className="border rounded-lg overflow-hidden">
          <img
            src={check.signedUrl}
            alt={check.checklist_items?.name}
            className="w-full h-32 object-cover"
          />
          <div className="p-2">
            <p className="text-sm font-medium">{check.checklist_items?.name}</p>
            <p className="text-xs text-gray-500">
              {new Date(check.checked_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
