"use client";

import type { AnalysisResult } from "@/types";
import type { RetailAvailability } from "@/types";

interface ReferenceInfoProps {
  result: AnalysisResult;
}

const AVAIL_LABEL: Record<RetailAvailability, string> = {
  easy:         "Available",
  waitlist:     "Waitlist Required",
  impossible:   "Allocation Only",
  discontinued: "Discontinued",
};

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "12px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span className="label">{label}</span>
      <span
        className="font-body"
        style={{
          color: "var(--text-primary)",
          fontSize: "0.9rem",
          fontWeight: 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function ReferenceInfo({ result }: ReferenceInfoProps) {
  const { watch } = result;

  const specs: { label: string; value: string }[] = [
    { label: "Brand",             value: watch.brand },
    { label: "Model",             value: watch.model },
    { label: "Reference",         value: watch.reference },
    { label: "Case Size",         value: `${watch.case_size_mm} mm` },
    { label: "Case Material",     value: watch.case_material },
    { label: "Movement",          value: watch.movement },
    { label: "Water Resistance",  value: watch.water_resistance },
    { label: "Introduced",        value: String(watch.year_introduced) },
    { label: "Retail MSRP",       value: "$" + watch.msrp_usd.toLocaleString("en-US") },
    { label: "Retail Availability", value: AVAIL_LABEL[watch.retail_availability] },
  ];

  // Split into two columns
  const mid  = Math.ceil(specs.length / 2);
  const left  = specs.slice(0, mid);
  const right = specs.slice(mid);

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "0.5rem",
        padding: "1.5rem",
      }}
    >
      {/* Header */}
      <p className="label" style={{ marginBottom: "0.25rem" }}>
        Reference Information
      </p>
      <p
        className="font-display"
        style={{
          color: "var(--text-primary)",
          fontSize: "1.375rem",
          fontWeight: 300,
          marginBottom: "1.25rem",
          letterSpacing: "0.01em",
        }}
      >
        {watch.brand} {watch.model}
        {watch.nickname && (
          <em
            style={{
              color: "var(--accent-gold)",
              fontStyle: "italic",
              marginLeft: "0.4em",
            }}
          >
            {watch.nickname}
          </em>
        )}
      </p>

      {/* Two-column specs grid */}
      <div
        className="ref-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0 2.5rem",
        }}
      >
        <div>
          {left.map((s) => (
            <SpecRow key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
        <div>
          {right.map((s) => (
            <SpecRow key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
