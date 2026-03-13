import { useCallback, useEffect, useState } from "react";
import Layout from "../components/Layout";
import API, { getApiErrorMessage } from "../api";

function Onboarding() {
  const [records, setRecords] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    communityName: "",
    cityVillage: "",
    description: "",
    memberCount: "",
    contactName: "",
    contactEmail: ""
  });

  const fetchRecords = useCallback(async () => {
    try {
      setLoadError("");
      const { data } = await API.get("/onboarding");
      setRecords(data);
    } catch (error) {
      setRecords([]);
      setLoadError(getApiErrorMessage(error, "Failed to load onboarding records."));
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    try {
      await API.post("/onboarding", {
        ...form,
        memberCount: Number(form.memberCount) || 0
      });
      setForm({
        communityName: "",
        cityVillage: "",
        description: "",
        memberCount: "",
        contactName: "",
        contactEmail: ""
      });
      await fetchRecords();
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, "Failed to submit onboarding request."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="hero-glass p-8 sm:p-10">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#8d5a34] via-[#b78656] to-[#e39d58] p-6 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/85">Onboarding</p>
          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Community/Pandit Onboarding</h2>
          <p className="mt-2 text-sm text-white/90">Submit onboarding details and track approval status.</p>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            {loadError}
          </div>
        )}

        <form onSubmit={submit} className="glass-tile mb-6 grid gap-3 p-5 md:grid-cols-2">
          <input className="soft-input" placeholder="Community Name" value={form.communityName} onChange={(e) => setForm((prev) => ({ ...prev, communityName: e.target.value }))} required />
          <input className="soft-input" placeholder="City / Village" value={form.cityVillage} onChange={(e) => setForm((prev) => ({ ...prev, cityVillage: e.target.value }))} required />
          <textarea className="soft-input md:col-span-2 min-h-[90px]" placeholder="Description" value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
          <input type="number" className="soft-input" placeholder="Member Count" value={form.memberCount} onChange={(e) => setForm((prev) => ({ ...prev, memberCount: e.target.value }))} />
          <input className="soft-input" placeholder="Contact Name" value={form.contactName} onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))} required />
          <input type="email" className="soft-input md:col-span-2" placeholder="Contact Email" value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} required />
          {submitError && (
            <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {submitError}
            </div>
          )}
          <button className="primary-btn md:col-span-2" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Onboarding"}
          </button>
        </form>

        <div className="space-y-3">
          {records.map((record) => (
            <article key={record._id} className="glass-tile p-4">
              <p className="font-semibold text-stone-900">{record.communityName} ({record.cityVillage})</p>
              <p className="mt-1 text-sm text-stone-600">Contact: {record.contactName} | {record.contactEmail}</p>
              <p className="mt-1 text-sm text-stone-600">Status: {record.status}</p>
            </article>
          ))}
          {records.length === 0 && <p className="text-sm text-stone-600">No onboarding requests yet.</p>}
        </div>
      </section>
    </Layout>
  );
}

export default Onboarding;
