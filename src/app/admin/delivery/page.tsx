"use client";

import { useEffect, useState } from "react";

type Zone = {
  _id: string;
  name: string;
  states: string[];
  cities: string[];
  fee: number;
  eta: string;
  active: boolean;
};

const input =
  "w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm outline-none focus:border-stone-900";

export default function DeliveryPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState("");
  const [states, setStates] = useState("");
  const [cities, setCities] = useState("");
  const [fee, setFee] = useState("");
  const [eta, setEta] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    fetch("/api/admin/delivery-zones")
      .then((response) => response.json())
      .then((data) => setZones(data.zones ?? []));

  useEffect(() => {
    void load();
  }, []);

  function clearForm() {
    setName("");
    setStates("");
    setCities("");
    setFee("");
    setEta("");
    setEditingId(null);
  }

  function edit(zone: Zone) {
    setEditingId(zone._id);
    setName(zone.name);
    setStates(zone.states.join(", "));
    setCities(zone.cities.join(", "));
    setFee(String(zone.fee));
    setEta(zone.eta);
    setMessage(`Editing ${zone.name}.`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch("/api/admin/delivery-zones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editingId ?? undefined,
        name,
        states: states.split(",").map((item) => item.trim()).filter(Boolean),
        cities: cities.split(",").map((item) => item.trim()).filter(Boolean),
        fee: Number(fee),
        eta,
        active: true,
      }),
    });
    setSaving(false);
    if (!response.ok) {
      setMessage("Please complete the zone details.");
      return;
    }
    const wasEditing = Boolean(editingId);
    clearForm();
    setMessage(wasEditing ? "Delivery zone updated." : "Delivery zone saved.");
    void load();
  }

  async function remove(zone: Zone) {
    setSaving(true);
    setMessage("");
    const response = await fetch(`/api/admin/delivery-zones?id=${encodeURIComponent(zone._id)}`, { method: "DELETE" });
    setSaving(false);
    if (!response.ok) {
      setMessage("Could not delete this delivery zone.");
      return;
    }
    if (editingId === zone._id) clearForm();
    setDeleteId(null);
    setMessage("Delivery zone deleted.");
    void load();
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
        Delivery zones
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        Delivery starts from Challenge, Ibadan. Customers see the matching fee at checkout. City matches take priority over state matches.
      </p>

      <form onSubmit={save} className="mt-6 grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 sm:grid-cols-2">
        <div className="sm:col-span-2 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-stone-900">
            {editingId ? "Edit delivery zone" : "Add delivery zone"}
          </h2>
          {editingId ? (
            <button type="button" onClick={clearForm} className="text-sm font-medium text-stone-600 underline underline-offset-2">
              Cancel edit
            </button>
          ) : null}
        </div>
        <input required className={input} value={name} onChange={(event) => setName(event.target.value)} placeholder="Zone name, e.g. Lagos Mainland" />
        <input required type="number" min="0" className={input} value={fee} onChange={(event) => setFee(event.target.value)} placeholder="Delivery fee in ₦" />
        <input className={input} value={states} onChange={(event) => setStates(event.target.value)} placeholder="States, comma separated" />
        <input className={input} value={cities} onChange={(event) => setCities(event.target.value)} placeholder="Cities or areas, comma separated" />
        <input className={input} value={eta} onChange={(event) => setEta(event.target.value)} placeholder="Estimated delivery, e.g. 1 to 2 business days" />
        <button disabled={saving} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
          {saving ? "Saving..." : editingId ? "Save changes" : "Save zone"}
        </button>
        {message ? <p className="sm:col-span-2 text-sm text-emerald-700">{message}</p> : null}
      </form>

      <div className="mt-6 space-y-3">
        {zones.map((zone) => (
          <div key={zone._id} className="rounded-2xl border border-stone-200 bg-white p-4 sm:flex sm:items-start sm:justify-between sm:gap-4">
            <div>
              <p className="font-medium text-stone-900">
                {zone.name} · ₦{zone.fee.toLocaleString("en-NG")}
              </p>
              <p className="mt-1 text-sm text-stone-500">
                {[...zone.cities, ...zone.states].join(", ") || "No locations added"}
                {zone.eta ? ` · ${zone.eta}` : ""}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2 sm:mt-0">
              <button type="button" onClick={() => edit(zone)} className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                Edit
              </button>
              {deleteId === zone._id ? (
                <>
                  <button type="button" disabled={saving} onClick={() => void remove(zone)} className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                    Confirm delete
                  </button>
                  <button type="button" disabled={saving} onClick={() => setDeleteId(null)} className="text-sm font-medium text-stone-600 underline underline-offset-2">
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setDeleteId(zone._id)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
