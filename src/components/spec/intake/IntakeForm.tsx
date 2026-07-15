'use client';

/**
 * IntakeForm — token-gated single-page SPEC intake.
 *
 * Source spec: ops-software-bible/SPEC/04_CUSTOMER_UX.md § /spec/intake/[token]
 * (12 sections) + SPEC/07_ROLLOUT.md § 7.
 *
 * Per-field autosave on blur (text) / change (checkbox + select). The autosave
 * endpoint debounces server-side; client also throttles at 500ms per field.
 * Files upload to /api/spec/intake/upload immediately on selection and the
 * paths accumulate locally until final submit.
 *
 * Three submission gates:
 *  - Regulated workflow attestation (any true → blocked with refund path)
 *  - Quebec intake re-check (any QC criterion true → blocked + refund path)
 *  - File-path validation (server-side; client treats stored paths as opaque)
 *
 * Voice per ops-copywriter skill: terse tactical, // INTAKE READY header,
 * sentence case for content, UPPERCASE for authority. No emoji.
 * Motion per animation-architect: 200ms fade for the "saved" indicator,
 * honored `prefers-reduced-motion` (CSS handles via the existing global
 * motion conventions; no JS-driven animation needed).
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
} from 'react';
import {
  SPEC_INTAKE_MAX_BYTES,
  SPEC_INTAKE_ALLOWED_MIME,
} from '@/lib/spec/intake-storage';
import {
  REGULATED_WORKFLOW_KEYS,
  REGULATED_WORKFLOW_LABELS,
  QUEBEC_INTAKE_KEYS,
  QUEBEC_INTAKE_LABELS,
  type RegulatedWorkflowKey,
  type QuebecIntakeKey,
} from '@/lib/spec/intake-validation';

// ─── Types ───────────────────────────────────────────────────────────────────

interface IntakeFormProps {
  token: string;
  tier: 'spec01' | 'spec02' | 'spec03';
  companyName: string;
  buyerEmail: string;
  initialResponses: IntakeResponsesShape;
  initialFiles: UploadedFile[];
  calendlyUrl: string | null;
}

interface UploadedFile {
  path: string;
  original_filename: string;
  size_bytes: number;
  content_type: string;
}

// All keys MUST match the autosave field_path regex: top-level dotted paths
// of [a-z_]+ — the autosave route hard-rejects anything else.
interface IntakeResponsesShape {
  business: {
    company_name: string;
    legal_entity_type: string;
    years_operating: string;
    primary_trade: string;
    secondary_trades: string;
    service_area: string;
  };
  team: {
    team_size: string;
    roles: string;
    seasonality: string;
  };
  money: {
    revenue_band: string;
    avg_job_size: string;
    payment_terms: string;
  };
  current_tools: {
    selected: string[];
    other: string;
    notes_servicetitan: string;
    notes_jobber: string;
    notes_buildertrend: string;
    notes_fieldedge: string;
    notes_housecallpro: string;
    notes_quickbooks: string;
    notes_paper: string;
    notes_other: string;
  };
  workflow: {
    description: string;
  };
  pain_points: {
    one: string;
    two: string;
    three: string;
  };
  success_90_days: {
    description: string;
  };
  anything_else: {
    description: string;
  };
}

type RegulatedAttestationState = Record<RegulatedWorkflowKey, boolean>;
type QuebecAttestationState = Record<QuebecIntakeKey, boolean>;

type SaveState =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'saved'; at: number }
  | { kind: 'error'; message: string };

// ─── Defaults ────────────────────────────────────────────────────────────────

const TIER_DISPLAY: Record<IntakeFormProps['tier'], string> = {
  spec01: 'SPEC-01',
  spec02: 'SPEC-02',
  spec03: 'SPEC-03',
};

type ToolNotesField =
  | 'notes_servicetitan'
  | 'notes_jobber'
  | 'notes_buildertrend'
  | 'notes_fieldedge'
  | 'notes_housecallpro'
  | 'notes_quickbooks'
  | 'notes_paper'
  | 'notes_other';

const TOOL_OPTIONS: Array<{ key: string; label: string; notesField: ToolNotesField }> = [
  { key: 'servicetitan', label: 'ServiceTitan', notesField: 'notes_servicetitan' },
  { key: 'jobber', label: 'Jobber', notesField: 'notes_jobber' },
  { key: 'buildertrend', label: 'Buildertrend', notesField: 'notes_buildertrend' },
  { key: 'fieldedge', label: 'FieldEdge', notesField: 'notes_fieldedge' },
  { key: 'housecallpro', label: 'Housecall Pro', notesField: 'notes_housecallpro' },
  { key: 'quickbooks', label: 'QuickBooks', notesField: 'notes_quickbooks' },
  { key: 'paper', label: 'Paper / spreadsheets', notesField: 'notes_paper' },
  { key: 'other', label: 'Something else', notesField: 'notes_other' },
];

const LEGAL_ENTITY_OPTIONS = [
  { value: '', label: 'Select an entity type' },
  { value: 'sole_prop', label: 'Sole proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'corporation_federal', label: 'Federal corporation' },
  { value: 'corporation_provincial', label: 'Provincial corporation' },
  { value: 'other', label: 'Other' },
];

const REVENUE_BAND_OPTIONS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'under_250k', label: 'Under $250,000' },
  { value: '250k_500k', label: '$250,000 — $500,000' },
  { value: '500k_1m', label: '$500,000 — $1M' },
  { value: '1m_2_5m', label: '$1M — $2.5M' },
  { value: '2_5m_5m', label: '$2.5M — $5M' },
  { value: 'over_5m', label: 'Over $5M' },
];

const SEASONALITY_OPTIONS = [
  { value: '', label: 'Pick one' },
  { value: 'year_round', label: 'Year-round, steady headcount' },
  { value: 'seasonal_light', label: 'Mostly year-round, light seasonal flex' },
  { value: 'seasonal_heavy', label: 'Heavily seasonal' },
];

const EMPTY_RESPONSES: IntakeResponsesShape = {
  business: {
    company_name: '',
    legal_entity_type: '',
    years_operating: '',
    primary_trade: '',
    secondary_trades: '',
    service_area: '',
  },
  team: { team_size: '', roles: '', seasonality: '' },
  money: { revenue_band: '', avg_job_size: '', payment_terms: '' },
  current_tools: {
    selected: [],
    other: '',
    notes_servicetitan: '',
    notes_jobber: '',
    notes_buildertrend: '',
    notes_fieldedge: '',
    notes_housecallpro: '',
    notes_quickbooks: '',
    notes_paper: '',
    notes_other: '',
  },
  workflow: { description: '' },
  pain_points: { one: '', two: '', three: '' },
  success_90_days: { description: '' },
  anything_else: { description: '' },
};

const SECTIONS: Array<{ id: string; label: string }> = [
  { id: 'welcome', label: 'Welcome' },
  { id: 'business', label: 'Business basics' },
  { id: 'team', label: 'Team' },
  { id: 'money', label: 'Money' },
  { id: 'current_tools', label: 'Current tools' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'pain_points', label: 'Pain points' },
  { id: 'success_90_days', label: '90 days from now' },
  { id: 'regulated', label: 'Regulated workflows' },
  { id: 'files', label: 'Process docs' },
  { id: 'anything_else', label: 'Anything else' },
  { id: 'discovery', label: 'Discovery' },
];

const INPUT_CLASS =
  'w-full rounded-[3px] border border-ops-border bg-ops-surface-input px-3 py-2.5 text-sm text-ops-text-primary font-heading font-light focus:outline-none focus:border-ops-accent focus:ring-1 focus:ring-ops-accent transition-colors disabled:opacity-50';

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[120px] leading-relaxed resize-y`;

// ─── Component ───────────────────────────────────────────────────────────────

export function IntakeForm({
  token,
  tier,
  companyName,
  buyerEmail,
  initialResponses,
  initialFiles,
  calendlyUrl,
}: IntakeFormProps) {
  const [responses, setResponses] = useState<IntakeResponsesShape>(() =>
    mergeResponses(EMPTY_RESPONSES, initialResponses),
  );
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [regulated, setRegulated] = useState<RegulatedAttestationState>(() =>
    REGULATED_WORKFLOW_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: false }),
      {} as RegulatedAttestationState,
    ),
  );
  const [quebec, setQuebec] = useState<QuebecAttestationState>(() =>
    QUEBEC_INTAKE_KEYS.reduce(
      (acc, k) => ({ ...acc, [k]: false }),
      {} as QuebecAttestationState,
    ),
  );

  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const [uploadState, setUploadState] = useState<
    | { kind: 'idle' }
    | { kind: 'uploading'; filename: string }
    | { kind: 'error'; message: string }
  >({ kind: 'idle' });

  const [submitError, setSubmitError] = useState<{
    message: string;
    code?: string;
    flagged_labels?: string[];
    refund_path?: string;
  } | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  // ── Autosave: debounce per field_path ────────────────────────────────────
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const savedAtTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const flushSave = useCallback(
    (fieldPath: string, value: unknown) => {
      setSaveStates((prev) => ({ ...prev, [fieldPath]: { kind: 'saving' } }));
      fetch('/api/spec/intake/autosave', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, field_path: fieldPath, value }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const body = (await res.json().catch(() => null)) as { error?: string } | null;
            throw new Error(body?.error ?? `HTTP ${res.status}`);
          }
          setSaveStates((prev) => ({
            ...prev,
            [fieldPath]: { kind: 'saved', at: Date.now() },
          }));
          // Clear the "saved" indicator after 1600ms.
          if (savedAtTimers.current[fieldPath]) {
            clearTimeout(savedAtTimers.current[fieldPath]);
          }
          savedAtTimers.current[fieldPath] = setTimeout(() => {
            setSaveStates((prev) => {
              const next = { ...prev };
              delete next[fieldPath];
              return next;
            });
          }, 1600);
        })
        .catch((err: unknown) => {
          setSaveStates((prev) => ({
            ...prev,
            [fieldPath]: {
              kind: 'error',
              message: err instanceof Error ? err.message : 'Save failed',
            },
          }));
        });
    },
    [token],
  );

  const scheduleSave = useCallback(
    (fieldPath: string, value: unknown, debounceMs = 500) => {
      if (saveTimers.current[fieldPath]) {
        clearTimeout(saveTimers.current[fieldPath]);
      }
      saveTimers.current[fieldPath] = setTimeout(() => {
        flushSave(fieldPath, value);
      }, debounceMs);
    },
    [flushSave],
  );

  // Clean up timers on unmount.
  useEffect(() => {
    const timers = saveTimers.current;
    const savedTimers = savedAtTimers.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
      Object.values(savedTimers).forEach(clearTimeout);
    };
  }, []);

  // ── Helpers to mutate `responses` + trigger autosave ─────────────────────
  type ResponsesGroup = keyof IntakeResponsesShape;

  const setField = useCallback(
    <G extends ResponsesGroup, K extends keyof IntakeResponsesShape[G]>(
      group: G,
      key: K,
      value: IntakeResponsesShape[G][K],
    ) => {
      setResponses((prev) => ({
        ...prev,
        [group]: { ...prev[group], [key]: value },
      }));
    },
    [],
  );

  const handleBlurSave = useCallback(
    <G extends ResponsesGroup, K extends keyof IntakeResponsesShape[G]>(
      group: G,
      key: K,
    ) => {
      const fieldPath = `${group}.${String(key)}`;
      const value = (responses[group] as Record<string, unknown>)[String(key)];
      flushSave(fieldPath, value);
    },
    [flushSave, responses],
  );

  const handleSelectSave = useCallback(
    <G extends ResponsesGroup, K extends keyof IntakeResponsesShape[G]>(
      group: G,
      key: K,
      value: IntakeResponsesShape[G][K],
    ) => {
      setField(group, key, value);
      const fieldPath = `${group}.${String(key)}`;
      // Selects fire on change; small debounce to coalesce rapid keyboard nav.
      scheduleSave(fieldPath, value, 300);
    },
    [scheduleSave, setField],
  );

  const handleToolToggle = useCallback(
    (toolKey: string, checked: boolean) => {
      setResponses((prev) => {
        const currentlySelected = new Set(prev.current_tools.selected);
        if (checked) currentlySelected.add(toolKey);
        else currentlySelected.delete(toolKey);
        const nextSelected = Array.from(currentlySelected);
        scheduleSave('current_tools.selected', nextSelected, 200);
        return {
          ...prev,
          current_tools: { ...prev.current_tools, selected: nextSelected },
        };
      });
    },
    [scheduleSave],
  );

  // ── Upload handling ──────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      if (!fileList || fileList.length === 0) return;

      const selected = Array.from(fileList);
      // Reset input so re-selecting the same file fires onChange.
      event.target.value = '';

      for (const file of selected) {
        if (file.size > SPEC_INTAKE_MAX_BYTES) {
          setUploadState({
            kind: 'error',
            message: `${file.name} is over 25 MB. Pick a smaller file.`,
          });
          continue;
        }
        if (!(SPEC_INTAKE_ALLOWED_MIME as readonly string[]).includes(file.type)) {
          setUploadState({
            kind: 'error',
            message: `${file.name} isn't a PDF, image, DOCX, or XLSX.`,
          });
          continue;
        }
        setUploadState({ kind: 'uploading', filename: file.name });

        const formData = new FormData();
        formData.append('token', token);
        formData.append('file', file);

        try {
          const res = await fetch('/api/spec/intake/upload', {
            method: 'POST',
            credentials: 'same-origin',
            body: formData,
          });
          if (!res.ok) {
            const body = (await res.json().catch(() => null)) as { error?: string } | null;
            throw new Error(body?.error ?? `HTTP ${res.status}`);
          }
          const body = (await res.json()) as UploadedFile;
          setFiles((prev) => [...prev, body]);
          setUploadState({ kind: 'idle' });
        } catch (err: unknown) {
          setUploadState({
            kind: 'error',
            message: err instanceof Error ? err.message : 'Upload failed',
          });
        }
      }
    },
    [token],
  );

  const handleRemoveFile = useCallback(
    (path: string) => {
      // Client-side removal only — the actual storage object is cleaned up
      // by the operator later (or by the deletion cron when the engagement
      // reaches a terminal state per the bible's storage retention policy).
      // The intake_files array on submit only contains paths still in `files`.
      setFiles((prev) => prev.filter((f) => f.path !== path));
    },
    [],
  );

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitError(null);
      startTransition(async () => {
        // Flush any pending autosaves before submit.
        await Promise.all(
          Object.entries(saveTimers.current).map(([key, timer]) => {
            clearTimeout(timer);
            // Best-effort sync of the latest in-state value for this key.
            const segments = key.split('.');
            let cursor: unknown = responses;
            for (const seg of segments) {
              if (cursor && typeof cursor === 'object' && seg in (cursor as Record<string, unknown>)) {
                cursor = (cursor as Record<string, unknown>)[seg];
              } else {
                cursor = undefined;
                break;
              }
            }
            return fetch('/api/spec/intake/autosave', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token, field_path: key, value: cursor }),
            }).catch(() => null);
          }),
        );

        let res: Response;
        try {
          res = await fetch('/api/spec/intake/submit', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              token,
              responses,
              regulated_workflow_attestations: regulated,
              quebec_intake_attestations: quebec,
              uploaded_file_paths: files.map((f) => f.path),
            }),
          });
        } catch (err) {
          setSubmitError({
            message:
              err instanceof Error
                ? err.message
                : 'Network error. Check your connection and try again.',
          });
          return;
        }

        if (res.status === 404) {
          setSubmitError({
            message: 'This intake link is no longer active.',
          });
          return;
        }

        if (res.status === 409) {
          setSubmitError({
            message: 'This intake has already been submitted.',
            code: 'already_completed',
          });
          return;
        }

        if (res.status === 422) {
          const body = (await res.json().catch(() => null)) as {
            error?: string;
            code?: string;
            flagged_labels?: string[];
            refund_path?: string;
          } | null;
          setSubmitError({
            message: body?.error ?? 'Submission was rejected.',
            code: body?.code,
            flagged_labels: body?.flagged_labels,
            refund_path: body?.refund_path,
          });
          return;
        }

        if (!res.ok) {
          setSubmitError({
            message: 'Something went wrong on our end. Try again in a moment.',
          });
          return;
        }

        const body = (await res.json().catch(() => null)) as
          | { ok: true; redirect_to: string | null }
          | null;
        setSubmitSuccess(true);
        // If a discovery URL is configured, route to it; otherwise stay on
        // the success state.
        if (body?.redirect_to) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    },
    [token, responses, regulated, quebec, files],
  );

  const blockerActive = useMemo(
    () =>
      REGULATED_WORKFLOW_KEYS.some((k) => regulated[k]) ||
      QUEBEC_INTAKE_KEYS.some((k) => quebec[k]),
    [regulated, quebec],
  );

  const canSubmit = !isPending && !blockerActive && !submitSuccess;

  // ── Render ───────────────────────────────────────────────────────────────

  if (submitSuccess) {
    return <SuccessPanel calendlyUrl={calendlyUrl} />;
  }

  return (
    <div className="w-full max-w-[820px] mx-auto">
      <Toc />
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1 — Welcome */}
        <Section id="welcome" eyebrow="// INTAKE READY" heading="Tell us how you work">
          <p className="font-heading font-light text-sm text-ops-text-secondary leading-relaxed">
            {TIER_DISPLAY[tier]} build file opened for{' '}
            <span className="font-heading font-medium text-ops-text-primary">{companyName}</span>.
            This intake takes 30–45 minutes. Complete at your pace. Every field saves as you go.
          </p>
          <p className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-mute mt-3">
            [{buyerEmail}] · [{TIER_DISPLAY[tier]}]
          </p>
        </Section>

        {/* Section 2 — Business basics */}
        <Section id="business" eyebrow="// SECTION 02" heading="Business basics">
          <FieldGrid>
            <Field label="Company name" required>
              <TextInput
                value={responses.business.company_name}
                onChange={(v) => setField('business', 'company_name', v)}
                onBlur={() => handleBlurSave('business', 'company_name')}
                indicator={saveStates['business.company_name']}
              />
            </Field>
            <Field label="Legal entity type">
              <Select
                value={responses.business.legal_entity_type}
                options={LEGAL_ENTITY_OPTIONS}
                onChange={(v) => handleSelectSave('business', 'legal_entity_type', v)}
                indicator={saveStates['business.legal_entity_type']}
              />
            </Field>
            <Field label="Years operating">
              <TextInput
                value={responses.business.years_operating}
                onChange={(v) => setField('business', 'years_operating', v)}
                onBlur={() => handleBlurSave('business', 'years_operating')}
                inputMode="numeric"
                indicator={saveStates['business.years_operating']}
              />
            </Field>
            <Field label="Primary trade">
              <TextInput
                value={responses.business.primary_trade}
                onChange={(v) => setField('business', 'primary_trade', v)}
                onBlur={() => handleBlurSave('business', 'primary_trade')}
                placeholder="HVAC, deck & rail, electrical…"
                indicator={saveStates['business.primary_trade']}
              />
            </Field>
          </FieldGrid>
          <Field label="Secondary trades (optional)">
            <TextInput
              value={responses.business.secondary_trades}
              onChange={(v) => setField('business', 'secondary_trades', v)}
              onBlur={() => handleBlurSave('business', 'secondary_trades')}
              placeholder="Anything you also do that matters"
              indicator={saveStates['business.secondary_trades']}
            />
          </Field>
          <Field label="Service area" required>
            <TextInput
              value={responses.business.service_area}
              onChange={(v) => setField('business', 'service_area', v)}
              onBlur={() => handleBlurSave('business', 'service_area')}
              placeholder="Cities, regions, or radius from home base"
              indicator={saveStates['business.service_area']}
            />
          </Field>

          {/* Quebec intake re-check — embedded inside business basics */}
          <fieldset className="mt-6 border border-ops-border rounded-[3px] p-5">
            <legend className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary px-2">
              {'// QUEBEC OPERATIONS RE-CHECK'}
            </legend>
            <p className="font-heading font-light text-sm text-ops-text-secondary mb-3">
              We confirmed billing at deposit. Confirm operations too — check any that apply:
            </p>
            <div className="flex flex-col gap-1">
              {QUEBEC_INTAKE_KEYS.map((key) => (
                <Attestation
                  key={key}
                  id={`quebec_${key}`}
                  checked={quebec[key]}
                  onChange={(v) => setQuebec((prev) => ({ ...prev, [key]: v }))}
                  label={`We have a ${QUEBEC_INTAKE_LABELS[key].toLowerCase()}.`}
                  variant="warning"
                />
              ))}
            </div>
            <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute mt-4">
              [Leave blank if none apply. Any checked → pre-discovery refund.]
            </p>
          </fieldset>
        </Section>

        {/* Section 3 — Team */}
        <Section id="team" eyebrow="// SECTION 03" heading="Team">
          <FieldGrid>
            <Field label="Team size (today)" required>
              <TextInput
                value={responses.team.team_size}
                onChange={(v) => setField('team', 'team_size', v)}
                onBlur={() => handleBlurSave('team', 'team_size')}
                placeholder="Owner + crew count"
                indicator={saveStates['team.team_size']}
              />
            </Field>
            <Field label="Seasonality">
              <Select
                value={responses.team.seasonality}
                options={SEASONALITY_OPTIONS}
                onChange={(v) => handleSelectSave('team', 'seasonality', v)}
                indicator={saveStates['team.seasonality']}
              />
            </Field>
          </FieldGrid>
          <Field label="Roles on the team" help="Owner, ops manager, dispatch, crew lead, field crew, etc.">
            <TextArea
              value={responses.team.roles}
              onChange={(v) => setField('team', 'roles', v)}
              onBlur={() => handleBlurSave('team', 'roles')}
              placeholder="One line per role with rough headcount"
              indicator={saveStates['team.roles']}
            />
          </Field>
        </Section>

        {/* Section 4 — Money */}
        <Section id="money" eyebrow="// SECTION 04" heading="Money">
          <FieldGrid>
            <Field label="Revenue band (optional)">
              <Select
                value={responses.money.revenue_band}
                options={REVENUE_BAND_OPTIONS}
                onChange={(v) => handleSelectSave('money', 'revenue_band', v)}
                indicator={saveStates['money.revenue_band']}
              />
            </Field>
            <Field label="Average job size">
              <TextInput
                value={responses.money.avg_job_size}
                onChange={(v) => setField('money', 'avg_job_size', v)}
                onBlur={() => handleBlurSave('money', 'avg_job_size')}
                placeholder="$1,500 / $20,000 / etc."
                indicator={saveStates['money.avg_job_size']}
              />
            </Field>
          </FieldGrid>
          <Field
            label="Typical payment terms with customers"
            help="Deposit on signing, net-15 on completion, etc."
          >
            <TextArea
              value={responses.money.payment_terms}
              onChange={(v) => setField('money', 'payment_terms', v)}
              onBlur={() => handleBlurSave('money', 'payment_terms')}
              indicator={saveStates['money.payment_terms']}
            />
          </Field>
        </Section>

        {/* Section 5 — Current tools */}
        <Section id="current_tools" eyebrow="// SECTION 05" heading="Current tools">
          <p className="font-heading font-light text-sm text-ops-text-secondary mb-4">
            Pick everything that runs your business today — even paper.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {TOOL_OPTIONS.map((tool) => (
              <Attestation
                key={tool.key}
                id={`tool_${tool.key}`}
                checked={responses.current_tools.selected.includes(tool.key)}
                onChange={(v) => handleToolToggle(tool.key, v)}
                label={tool.label}
              />
            ))}
          </div>

          {/* "Other" free-text */}
          {responses.current_tools.selected.includes('other') && (
            <Field label="What's the other tool?" className="mt-4">
              <TextInput
                value={responses.current_tools.other}
                onChange={(v) => setField('current_tools', 'other', v)}
                onBlur={() => handleBlurSave('current_tools', 'other')}
                indicator={saveStates['current_tools.other']}
              />
            </Field>
          )}

          {/* Per-tool "what works / what doesn't" */}
          {responses.current_tools.selected.length > 0 && (
            <div className="mt-6 space-y-4">
              <p className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-tertiary">
                {'// FOR EACH TOOL — WHAT WORKS, WHAT DOESN\'T'}
              </p>
              {TOOL_OPTIONS.filter((t) =>
                responses.current_tools.selected.includes(t.key),
              ).map((tool) => (
                <Field
                  key={tool.key}
                  label={`${tool.label} — what works, what doesn't`}
                >
                  <TextArea
                    value={responses.current_tools[tool.notesField]}
                    onChange={(v) => setField('current_tools', tool.notesField, v)}
                    onBlur={() =>
                      handleBlurSave('current_tools', tool.notesField)
                    }
                    indicator={saveStates[`current_tools.${tool.notesField}`]}
                    placeholder="Two or three lines is enough"
                  />
                </Field>
              ))}
            </div>
          )}
        </Section>

        {/* Section 6 — Workflow */}
        <Section id="workflow" eyebrow="// SECTION 06" heading="Workflow">
          <Field
            label="Walk us through how a job goes from first lead to invoice paid"
            help="Who touches it. Where it lives. What hands it off to what."
          >
            <TextArea
              value={responses.workflow.description}
              onChange={(v) => setField('workflow', 'description', v)}
              onBlur={() => handleBlurSave('workflow', 'description')}
              indicator={saveStates['workflow.description']}
              placeholder={[
                'Example:',
                '1. Lead comes in via website form or referral.',
                '2. Office books a site visit; I review notes that night.',
                '3. Quote goes out via DocuSign; deposit lands in QuickBooks.',
                '4. Job scheduled in a paper calendar + texted to crew.',
                '5. Crew lead photographs daily; office invoices on completion.',
              ].join('\n')}
              rows={10}
            />
          </Field>
        </Section>

        {/* Section 7 — Pain points */}
        <Section id="pain_points" eyebrow="// SECTION 07" heading="Top 3 pain points">
          <p className="font-heading font-light text-sm text-ops-text-secondary mb-4">
            One line each. The things that wake you up at 2am.
          </p>
          <Field label="Pain point #1" required>
            <TextInput
              value={responses.pain_points.one}
              onChange={(v) => setField('pain_points', 'one', v)}
              onBlur={() => handleBlurSave('pain_points', 'one')}
              indicator={saveStates['pain_points.one']}
            />
          </Field>
          <Field label="Pain point #2">
            <TextInput
              value={responses.pain_points.two}
              onChange={(v) => setField('pain_points', 'two', v)}
              onBlur={() => handleBlurSave('pain_points', 'two')}
              indicator={saveStates['pain_points.two']}
            />
          </Field>
          <Field label="Pain point #3">
            <TextInput
              value={responses.pain_points.three}
              onChange={(v) => setField('pain_points', 'three', v)}
              onBlur={() => handleBlurSave('pain_points', 'three')}
              indicator={saveStates['pain_points.three']}
            />
          </Field>
        </Section>

        {/* Section 8 — 90 days from now */}
        <Section id="success_90_days" eyebrow="// SECTION 08" heading="90 days from now">
          <Field
            label="What would amazing look like 90 days from now?"
            help="If this works, what changed for you?"
          >
            <TextArea
              value={responses.success_90_days.description}
              onChange={(v) => setField('success_90_days', 'description', v)}
              onBlur={() => handleBlurSave('success_90_days', 'description')}
              indicator={saveStates['success_90_days.description']}
              rows={6}
            />
          </Field>
        </Section>

        {/* Section 9 — Regulated workflows */}
        <Section
          id="regulated"
          eyebrow="// SECTION 09"
          heading="Regulated workflows"
        >
          <p className="font-heading font-light text-sm text-ops-text-secondary mb-4">
            We don&apos;t build for these categories. Check any that describe what
            you need — we&apos;ll review and refund pre-discovery.
          </p>
          <fieldset className="border border-ops-border rounded-[3px] p-5">
            <legend className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary px-2">
              {'// EXCLUDED CATEGORIES'}
            </legend>
            <div className="flex flex-col gap-1">
              {REGULATED_WORKFLOW_KEYS.map((key) => (
                <Attestation
                  key={key}
                  id={`regulated_${key}`}
                  checked={regulated[key]}
                  onChange={(v) => setRegulated((prev) => ({ ...prev, [key]: v }))}
                  label={REGULATED_WORKFLOW_LABELS[key]}
                  variant="warning"
                />
              ))}
            </div>
            <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute mt-4">
              [Any checked → submission blocks. We&apos;ll reach out about a refund.]
            </p>
          </fieldset>
        </Section>

        {/* Section 10 — Process docs */}
        <Section id="files" eyebrow="// SECTION 10" heading="Existing process docs">
          <p className="font-heading font-light text-sm text-ops-text-secondary mb-4">
            SOPs, price books, sample contracts, screenshots of your current tools —
            anything that helps. PDF, PNG, JPEG, DOCX, or XLSX. 25 MB per file.
          </p>
          <FileUploader
            onChange={handleFileChange}
            uploadState={uploadState}
            files={files}
            onRemove={handleRemoveFile}
          />
        </Section>

        {/* Section 11 — Anything else */}
        <Section id="anything_else" eyebrow="// SECTION 11" heading="Anything else">
          <Field
            label="Anything we should know that didn't fit above"
            help="Optional. Skip if nothing comes to mind."
          >
            <TextArea
              value={responses.anything_else.description}
              onChange={(v) => setField('anything_else', 'description', v)}
              onBlur={() => handleBlurSave('anything_else', 'description')}
              indicator={saveStates['anything_else.description']}
              rows={5}
            />
          </Field>
        </Section>

        {/* Section 12 — Discovery scheduling */}
        <Section id="discovery" eyebrow="// SECTION 12" heading="Discovery">
          <p className="font-heading font-light text-sm text-ops-text-secondary mb-4">
            After you submit, you&apos;ll book the discovery session. 60 minutes,
            video, recorded for the project file.
          </p>
          {calendlyUrl ? (
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block px-5 py-2.5 rounded-[3px] border border-ops-border bg-ops-surface-input text-ops-text-primary font-caption text-xs uppercase tracking-[0.15em] hover:border-ops-accent transition-colors"
            >
              Open the scheduler →
            </a>
          ) : (
            <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute">
              [Scheduling link arrives by email after submit.]
            </p>
          )}
        </Section>

        {/* Submit error surface */}
        {submitError && (
          <div
            role="alert"
            className="border border-ops-brick rounded-[3px] p-4 bg-ops-brick/[0.08] mb-6"
          >
            <p className="font-heading font-light text-sm text-ops-brick">
              {submitError.message}
            </p>
            {submitError.flagged_labels && submitError.flagged_labels.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {submitError.flagged_labels.map((label) => (
                  <li
                    key={label}
                    className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute"
                  >
                    [{label}]
                  </li>
                ))}
              </ul>
            )}
            {submitError.refund_path && (
              <a
                href={submitError.refund_path}
                className="inline-block mt-3 font-caption text-[11px] uppercase tracking-[0.15em] text-ops-accent hover:underline"
              >
                Open refund request →
              </a>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="border-t border-ops-border pt-6 mt-8">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full sm:w-auto px-6 py-3.5 rounded-[3px] bg-ops-accent text-white border border-ops-accent hover:bg-ops-accent/90 transition-colors font-caption text-xs uppercase tracking-[0.15em] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? 'Submitting…' : 'Submit intake'}
          </button>
          <p className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-mute mt-3">
            {blockerActive
              ? '[A flagged checkbox blocks submission. Uncheck it or expect a refund.]'
              : '[We confirm receipt by email and follow up to schedule discovery.]'}
          </p>
        </div>
      </form>
    </div>
  );
}

// ─── Success Panel ───────────────────────────────────────────────────────────

function SuccessPanel({ calendlyUrl }: { calendlyUrl: string | null }) {
  return (
    <div className="w-full max-w-[620px] mx-auto py-8">
      <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary">
        {'// INTAKE COMPLETE'}
      </p>
      <h1 className="font-heading font-bold uppercase text-ops-text-primary text-3xl sm:text-4xl mt-3 leading-tight">
        Intake received
      </h1>
      <p className="font-heading font-light text-sm text-ops-text-secondary mt-4 leading-relaxed">
        We&apos;ll review your responses and confirm next steps by email. Book
        discovery now — you can move the time later if needed.
      </p>
      {calendlyUrl ? (
        <a
          href={calendlyUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-6 px-6 py-3.5 rounded-[3px] bg-ops-accent text-white border border-ops-accent hover:bg-ops-accent/90 transition-colors font-caption text-xs uppercase tracking-[0.15em]"
        >
          Book discovery →
        </a>
      ) : (
        <p className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-mute mt-6">
          [Scheduling link arrives by email shortly.]
        </p>
      )}
    </div>
  );
}

// ─── Small helpers ───────────────────────────────────────────────────────────

function Toc() {
  return (
    <nav
      aria-label="Sections"
      className="hidden lg:block sticky top-6 float-right ml-8 -mt-2 max-w-[180px]"
    >
      <p className="font-caption text-[10px] uppercase tracking-[0.18em] text-ops-text-mute mb-2">
        {'// SECTIONS'}
      </p>
      <ol className="space-y-1.5">
        {SECTIONS.map((s, i) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              className="font-caption text-[11px] uppercase tracking-[0.12em] text-ops-text-tertiary hover:text-ops-accent transition-colors block leading-tight"
            >
              <span className="text-ops-text-mute mr-2">
                {String(i + 1).padStart(2, '0')}
              </span>
              {s.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function Section({
  id,
  eyebrow,
  heading,
  children,
}: {
  id: string;
  eyebrow: string;
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="py-8 border-b border-ops-border last:border-b-0">
      <p className="font-caption text-[11px] uppercase tracking-[0.18em] text-ops-text-tertiary">
        {eyebrow}
      </p>
      <h2 className="font-heading font-bold uppercase text-ops-text-primary text-xl sm:text-2xl mt-2 mb-5 leading-tight">
        {heading}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  help,
  required,
  className,
  children,
}: {
  label: string;
  help?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <span className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-tertiary">
        {label}
        {required && <span className="text-ops-brick"> *</span>}
      </span>
      {help && (
        <span className="font-heading font-light text-xs text-ops-text-mute -mt-0.5">
          {help}
        </span>
      )}
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  onBlur,
  placeholder,
  inputMode,
  indicator,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  inputMode?: 'text' | 'numeric';
  indicator: SaveState | undefined;
}) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        inputMode={inputMode}
        className={INPUT_CLASS}
      />
      <SaveIndicator state={indicator} />
    </div>
  );
}

function TextArea({
  value,
  onChange,
  onBlur,
  placeholder,
  indicator,
  rows = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  placeholder?: string;
  indicator: SaveState | undefined;
  rows?: number;
}) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        className={TEXTAREA_CLASS}
      />
      <SaveIndicator state={indicator} />
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
  indicator,
}: {
  value: string;
  onChange: (v: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  indicator: SaveState | undefined;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
            {opt.label}
          </option>
        ))}
      </select>
      <SaveIndicator state={indicator} />
    </div>
  );
}

function Attestation({
  id,
  checked,
  onChange,
  label,
  variant,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  variant?: 'warning';
}) {
  return (
    <label
      htmlFor={id}
      className={`flex items-start gap-3 cursor-pointer select-none rounded-[2px] px-2 py-2 transition-colors ${
        variant === 'warning' && checked
          ? 'bg-ops-brick/[0.08]'
          : 'hover:bg-white/[0.02]'
      }`}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 accent-ops-accent shrink-0"
      />
      <span
        className={`font-heading font-light text-sm ${
          variant === 'warning' && checked
            ? 'text-ops-brick'
            : 'text-ops-text-secondary'
        }`}
      >
        {label}
      </span>
    </label>
  );
}

function FileUploader({
  onChange,
  uploadState,
  files,
  onRemove,
}: {
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  uploadState:
    | { kind: 'idle' }
    | { kind: 'uploading'; filename: string }
    | { kind: 'error'; message: string };
  files: UploadedFile[];
  onRemove: (path: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor="intake_files"
        className="inline-flex items-center gap-3 cursor-pointer rounded-[3px] border border-dashed border-ops-border px-4 py-4 hover:border-ops-accent transition-colors"
      >
        <input
          id="intake_files"
          type="file"
          multiple
          accept={[...SPEC_INTAKE_ALLOWED_MIME].join(',')}
          onChange={onChange}
          className="sr-only"
          disabled={uploadState.kind === 'uploading'}
        />
        <span className="font-caption text-[11px] uppercase tracking-[0.15em] text-ops-text-tertiary">
          {uploadState.kind === 'uploading'
            ? `Uploading ${uploadState.filename}…`
            : '+ Add files'}
        </span>
      </label>

      {uploadState.kind === 'error' && (
        <p
          role="alert"
          className="font-heading font-light text-sm text-ops-brick"
        >
          {uploadState.message}
        </p>
      )}

      {files.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {files.map((f) => (
            <li
              key={f.path}
              className="flex items-center justify-between gap-3 border border-ops-border rounded-[3px] px-3 py-2"
            >
              <div className="flex flex-col min-w-0">
                <span className="font-heading font-light text-sm text-ops-text-primary truncate">
                  {f.original_filename}
                </span>
                <span className="font-caption text-[10px] uppercase tracking-[0.12em] text-ops-text-mute">
                  [{formatBytes(f.size_bytes)}]
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemove(f.path)}
                className="font-caption text-[10px] uppercase tracking-[0.15em] text-ops-text-tertiary hover:text-ops-brick transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState | undefined }) {
  if (!state || state.kind === 'idle') return null;
  const label =
    state.kind === 'saving'
      ? 'SAVING'
      : state.kind === 'saved'
        ? 'SAVED'
        : 'RETRY';
  const tone =
    state.kind === 'error'
      ? 'text-ops-brick'
      : state.kind === 'saved'
        ? 'text-ops-accent'
        : 'text-ops-text-mute';
  return (
    <span
      aria-live="polite"
      className={`absolute right-2 top-1/2 -translate-y-1/2 font-caption text-[9px] uppercase tracking-[0.18em] pointer-events-none ${tone} transition-opacity duration-200 motion-reduce:transition-none`}
    >
      {label}
    </span>
  );
}

// ─── Pure helpers ────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mergeResponses(
  base: IntakeResponsesShape,
  incoming: Partial<IntakeResponsesShape> | undefined,
): IntakeResponsesShape {
  if (!incoming) return base;
  const baseRecord = base as unknown as Record<string, Record<string, unknown>>;
  const incomingRecord = incoming as unknown as Record<string, unknown>;
  const result: Record<string, Record<string, unknown>> = { ...baseRecord };
  for (const group of Object.keys(baseRecord)) {
    const incomingGroup = incomingRecord[group];
    if (incomingGroup && typeof incomingGroup === 'object') {
      result[group] = {
        ...baseRecord[group],
        ...(incomingGroup as Record<string, unknown>),
      };
    }
  }
  return result as unknown as IntakeResponsesShape;
}
