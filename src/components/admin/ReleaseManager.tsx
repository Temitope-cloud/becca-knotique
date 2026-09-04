"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, Plus, Pencil, X } from "lucide-react";
import type { ReleaseRow, ReleaseTag } from "@/lib/releases";

const TAGS: ReleaseTag[] = ["feature", "improvement", "fix", "launch"];

const tagStyles: Record<ReleaseTag, string> = {
  launch: "bg-emerald-100 text-emerald-800",
  feature: "bg-stone-900 text-white",
  improvement: "bg-stone-100 text-stone-700",
  fix: "bg-amber-100 text-amber-800",
};

const tagLabels: Record<ReleaseTag, string> = {
  launch: "Launch",
  feature: "New feature",
  improvement: "Improvements",
  fix: "Fixes",
};

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

type FormState = {
  date: string;
  title: string;
  tag: ReleaseTag;
  items: string;
};

const emptyForm = (): FormState => ({
  date: todayIso(),
  title: "",
  tag: "improvement",
  items: "",
});

export default function ReleaseManager({
  releases,
}: {
  releases: ReleaseRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const input =
    "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900";

  function resetForm() {
    setForm(emptyForm());
    setEditingId(null);
    setError(null);
  }

  function startEdit(r: ReleaseRow) {
    setEditingId(r.id);
    setError(null);
    setForm({
      date: r.date,
      title: r.title,
      tag: r.tag,
      items: r.items.join("\n"),
    });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const items = form.items
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!form.title.trim() || items.length === 0) {
      setError("Add a title and at least one change.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        editingId ? `/api/admin/releases/${editingId}` : "/api/admin/releases",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: form.date,
            title: form.title.trim(),
            tag: form.tag,
            items,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Could not save the entry.");
        setSaving(false);
        return;
      }
      resetForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this release entry?")) return;
    await fetch(`/api/admin/releases/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    router.refresh();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
      {/* create / edit form */}
      <form
        onSubmit={submit}
        className="h-fit space-y-3 rounded-2xl border border-stone-200 bg-white p-5 lg:sticky lg:top-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">
            {editingId ? "Edit entry" : "New entry"}
          </h2>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-900"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-xs text-stone-500">Date</label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={input}
          />
        </div>

        <input
          required
          placeholder="Title (e.g. Wishlist improvements)"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className={input}
        />

        <div>
          <label className="mb-1 block text-xs text-stone-500">Type</label>
          <select
            value={form.tag}
            onChange={(e) =>
              setForm((f) => ({ ...f, tag: e.target.value as ReleaseTag }))
            }
            className={input}
          >
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {tagLabels[t]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-stone-500">
            Changes (one per line)
          </label>
          <textarea
            rows={6}
            placeholder={"Added a wishlist confirmation toast\nFixed a mobile tooltip glitch"}
            value={form.items}
            onChange={(e) => setForm((f) => ({ ...f, items: e.target.value }))}
            className={input}
          />
        </div>

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
          {editingId ? "Save changes" : "Add entry"}
        </button>
      </form>

      {/* timeline */}
      <div>
        {releases.length === 0 ? (
          <p className="rounded-2xl border border-stone-200 bg-white px-4 py-12 text-center text-stone-500">
            No entries yet. Add your first one on the left.
          </p>
        ) : (
          <ol className="relative border-l border-stone-200">
            {releases.map((r) => (
              <li key={r.id} className="relative ml-6 pb-10 last:pb-0">
                <span className="absolute top-1.5 -left-[31px] flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-emerald-600 bg-white" />

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <time className="text-sm font-semibold text-stone-900">
                    {formatDate(r.date)}
                  </time>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${tagStyles[r.tag]}`}
                  >
                    {tagLabels[r.tag]}
                  </span>
                  <span className="ml-auto flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      aria-label="Edit entry"
                      className="rounded-md p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-800"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r.id)}
                      aria-label="Delete entry"
                      className="rounded-md p-1.5 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </span>
                </div>

                <h3 className="mt-1 text-lg font-semibold text-stone-900">
                  {r.title}
                </h3>

                <ul className="mt-3 space-y-2">
                  {r.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-sm leading-relaxed text-stone-600"
                    >
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                        aria-hidden
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
