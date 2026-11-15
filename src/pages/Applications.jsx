import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  X,
  Calendar,
  MapPin,
  RefreshCw,
} from "lucide-react";

// ============ CHANGE ME IF NEEDED ============
// 1. Backend URL for your applications list
const API_URL = "http://127.0.0.1:8000/api/applications/";
// 2. Where your login stores the token (check Login.jsx / src/utils/auth.js)
const getToken = () =>
  localStorage.getItem("access") || localStorage.getItem("token");
// 3. JWT uses "Bearer". If you use DRF Token auth, change to "Token".
const AUTH_PREFIX = "Bearer";
// =============================================

const STATUS = {
  Submitted: {
    badge: "bg-slate-100 text-slate-700 border-slate-200",
    bar: "bg-slate-400",
    Icon: Send,
  },
  "In Review": {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-500",
    Icon: Clock,
  },
  Shortlisted: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  Rejected: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
    Icon: XCircle,
  },
};

function normalizeStatus(raw) {
  const key = String(raw || "").toLowerCase().replace(/[\s_-]/g, "");
  if (key.includes("short")) return "Shortlisted";
  if (key.includes("reject") || key.includes("notselected")) return "Rejected";
  if (key.includes("review")) return "In Review";
  return "Submitted";
}

function timeAgo(value) {
  if (!value) return "";
  const diff = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diff)) return "";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  return new Date(value).toLocaleDateString();
}

// Converts one backend record into the shape this page uses.
// If a card shows blank text, add your serializer's field name here.
function toApplication(a) {
  const job = a.job && typeof a.job === "object" ? a.job : {};
  const status = normalizeStatus(a.status);
  const applied = timeAgo(a.created_at || a.applied_at || a.applied_on);
  return {
    id: a.id,
    role: a.job_title || a.role || job.title || `Job #${a.job ?? a.id}`,
    company:
      a.company ||
      a.company_name ||
      a.job_company ||
      job.company ||
      job.company_name ||
      "",
    location: a.job_location || job.location || "",
    description: job.description || a.description || "",
    status,
    appliedAt: applied,
    timeline: buildTimeline(status, applied),
  };
}

function buildTimeline(status, applied) {
  const steps = [{ label: "Application submitted", date: applied, done: true }];
  if (status === "Submitted") {
    steps.push(
      { label: "Resume reviewed", date: "Pending", done: false },
      { label: "Interview", date: "Pending", done: false }
    );
  } else if (status === "In Review") {
    steps.push(
      { label: "Resume reviewed", date: "In progress", done: false },
      { label: "Interview", date: "Pending", done: false }
    );
  } else if (status === "Shortlisted") {
    steps.push(
      { label: "Resume reviewed", date: "Done", done: true },
      { label: "Shortlisted", date: "Done", done: true },
      { label: "Interview", date: "Pending", done: false }
    );
  } else {
    steps.push(
      { label: "Resume reviewed", date: "Done", done: true },
      { label: "Not selected", date: "Done", done: true }
    );
  }
  return steps;
}

function StatusBadge({ status }) {
  const { badge, Icon } = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status}
    </span>
  );
}

function Avatar({ name }) {
  const letters = (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return (
    <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 font-semibold flex items-center justify-center shrink-0">
      {letters}
    </div>
  );
}

function DetailModal({ app, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${app.role} application`}
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{app.role}</h2>
            {app.company && <p className="text-slate-500">{app.company}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-slate-500">
          <StatusBadge status={app.status} />
          {app.appliedAt && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Applied {app.appliedAt}
            </span>
          )}
          {app.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {app.location}
            </span>
          )}
        </div>

        {app.description && (
          <p className="text-sm text-slate-600 leading-relaxed mt-5">
            {app.description}
          </p>
        )}

        <h3 className="text-sm font-semibold text-slate-700 mt-6 mb-3">
          Progress
        </h3>
        <ol className="space-y-3">
          {app.timeline.map((step, i) => (
            <li key={i} className="flex items-center gap-3">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  step.done ? "bg-purple-500" : "bg-slate-200"
                }`}
              />
              <span
                className={`text-sm flex-1 ${
                  step.done ? "text-slate-800" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
              <span className="text-xs text-slate-400">{step.date}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="card-base p-5 flex items-center gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-100" />
    </div>
  );
}

const FILTERS = ["All", "In Review", "Shortlisted", "Rejected"];

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    setNeedsLogin(false);
    try {
      const token = getToken();
      if (!token) {
        setNeedsLogin(true);
        return;
      }
      const res = await fetch(API_URL, {
        headers: { Authorization: `${AUTH_PREFIX} ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        setNeedsLogin(true);
        return;
      }
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setApps(list.map(toApplication));
    } catch (e) {
      setError(
        "Could not load your applications. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const counts = useMemo(
    () => ({
      total: apps.length,
      shortlisted: apps.filter((a) => a.status === "Shortlisted").length,
      inReview: apps.filter((a) => a.status === "In Review").length,
    }),
    [apps]
  );

  const visible = useMemo(
    () => (filter === "All" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter]
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
        My applications
      </h1>
      <p className="text-slate-500 mt-1.5">
        Track the status of every job you have applied to.
      </p>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-8">
        {[
          { label: "Applied", value: counts.total, color: "text-slate-800" },
          { label: "Shortlisted", value: counts.shortlisted, color: "text-emerald-600" },
          { label: "In review", value: counts.inReview, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="card-base p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-slate-500">{s.label}</p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="flex flex-wrap gap-2 mt-8"
        role="tablist"
        aria-label="Filter by status"
      >
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filter === f
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 mt-5">
        {loading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {!loading && needsLogin && (
          <div className="card-base p-8 text-center">
            <p className="font-semibold text-slate-800">
              Log in to see your applications
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Your applications are saved to your account.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
            >
              Log in
            </Link>
          </div>
        )}

        {!loading && error && (
          <div className="card-base p-8 text-center">
            <p className="font-semibold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        )}

        {!loading && !needsLogin && !error && visible.length === 0 && (
          <div className="card-base p-8 text-center">
            <p className="font-semibold text-slate-800">
              {apps.length === 0
                ? "You have not applied to any jobs yet"
                : `No applications with status "${filter}"`}
            </p>
            {apps.length === 0 && (
              <Link
                to="/jobs"
                className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium"
              >
                Browse jobs
              </Link>
            )}
          </div>
        )}

        {!loading &&
          !needsLogin &&
          !error &&
          visible.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setSelected(a)}
              className="card-base card-hover relative overflow-hidden p-5 pl-6 flex items-center gap-4 w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <span
                className={`absolute left-0 top-0 bottom-0 w-1.5 ${STATUS[a.status].bar}`}
              />
              <Avatar name={a.company || a.role} />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 truncate">{a.role}</h3>
                {a.company && (
                  <p className="text-sm text-slate-500 truncate">{a.company}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={a.status} />
                <p className="text-xs text-slate-400 mt-1.5">{a.appliedAt}</p>
              </div>
            </button>
          ))}
      </div>

      {selected && (
        <DetailModal app={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}