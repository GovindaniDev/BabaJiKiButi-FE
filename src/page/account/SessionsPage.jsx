// src/page/account/SessionsPage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import toast from "react-hot-toast";

export default function SessionsPage() {
  const { listSessions, revokeSession } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await listSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleRevoke = async (id) => {
    try {
      await revokeSession(id);
      toast.success("Session revoked");
      refresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to revoke session");
    }
  };

  if (loading) return <div className="p-6">Loading sessions…</div>;

  if (!sessions.length) {
    return <div className="p-6 text-gray-500">No sessions.</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Sessions</h1>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div key={s.id} className="rounded-xl border p-4 bg-white/80">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">
                  {s.currentSession ? "Current Session" : "Session"}
                </div>
                <div className="text-sm text-gray-600">
                  IP: {s.ipAddress || "—"} · Device: {s.deviceInfo || "—"}
                </div>
                <div className="text-sm text-gray-600">
                  Created:{" "}
                  {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                  {s.lastAccessedAt && (
                    <>
                      {" "}
                      · Last Access: {new Date(s.lastAccessedAt).toLocaleString()}
                    </>
                  )}
                </div>
                <div className="text-sm">
                  Status: {s.active ? "Active" : "Revoked"}
                  {s.revokedAt && (
                    <> · Revoked: {new Date(s.revokedAt).toLocaleString()}</>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!s.currentSession && s.active && (
                  <button
                    onClick={() => handleRevoke(s.id)}
                    className="px-3 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium"
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={refresh}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
