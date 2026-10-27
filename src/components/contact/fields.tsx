// Shared form fields for the contact panel.
export function Field({
  label,
  id,
  textarea,
  ...props
}: { label: string; id: string; textarea?: boolean } & React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const cls =
    "mt-2 w-full rounded-sm border border-line bg-ink/60 px-3.5 py-3 text-[0.95rem] text-paper placeholder:text-dim transition-colors focus:border-orange focus:outline-none";
  return (
    <label htmlFor={id} className="block">
      <span className="label text-[0.6rem] text-muted">{label}</span>
      {textarea ? <textarea id={id} rows={5} className={`${cls} resize-y`} {...props} /> : <input id={id} className={cls} {...props} />}
    </label>
  );
}

export async function sendViaForm(endpoint: string, payload: Record<string, string>) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ _template: "table", _captcha: "false", ...payload }),
  });
  const data = (await res.json().catch(() => ({}))) as { success?: string | boolean; message?: string };
  if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `Request failed (${res.status})`);
}
