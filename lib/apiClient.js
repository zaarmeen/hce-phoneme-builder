// Thin fetch wrapper for the /api/activity-sets and /api/words routes.
// Every function returns parsed JSON on success and throws an Error whose
// message is suitable to show directly to a teacher on failure.

async function request(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // No JSON body (e.g. a 204/network-level failure) — fall through to the status check below.
  }

  if (!res.ok) {
    const detail = body?.details?.length ? ` (${body.details.join(" ")})` : "";
    throw new Error((body?.error || `Request failed with status ${res.status}`) + detail);
  }

  return body;
}

export const listActivitySets = () => request("/api/activity-sets");

export const getActivitySet = (id) => request(`/api/activity-sets/${id}`);

export const createActivitySet = (data) =>
  request("/api/activity-sets", { method: "POST", body: JSON.stringify(data) });

export const updateActivitySet = (id, data) =>
  request(`/api/activity-sets/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteActivitySet = (id) =>
  request(`/api/activity-sets/${id}`, { method: "DELETE" });

export const addWord = (activitySetId, data) =>
  request(`/api/activity-sets/${activitySetId}/words`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateWord = (id, data) =>
  request(`/api/words/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteWord = (id) => request(`/api/words/${id}`, { method: "DELETE" });
