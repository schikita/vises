import type { Applicant } from './types'
import { emptyApplicant } from './types'
import { Field } from './ui'

export const CATEGORIES = ['Normal', 'Premium']

export const SUBMIT_COUNTRIES = ['Belarus', 'Russia']

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  Belarus: ['Minsk'],
  Russia: [
    'Moscow',
    'St. Petersburg',
    'Yekaterinburg',
    'Rostov-on-Don',
    'Nizhny Novgorod',
    'Samara',
    'Kazan',
    'Novosibirsk',
  ],
}

const RELATIONSHIPS = ['Self', 'Spouse', 'Child', 'Parent', 'Other']
const MARITAL = ['Single', 'Married', 'Divorced', 'Widowed', 'Separated']
export const PASSPORT_TYPES = [
  'Ordinary passport',
  'Diplomatic passport',
  'Service passport',
  'Official passport',
]
const PURPOSES = ['Tourism', 'Business', 'Family visit', 'Medical', 'Study', 'Transit', 'Other']
const ENTRIES = ['Single entry', 'Two entries', 'Multientry']

function latin(value: string) {
  return value.toUpperCase()
}

export function ApplicantFields({
  person,
  onChange,
}: {
  person: Applicant
  onChange: (patch: Partial<Applicant>) => void
}) {
  const p = { ...emptyApplicant(), ...person }
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Personal details</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Relationship" required>
            <select className="field" value={p.relationship} onChange={(e) => onChange({ relationship: e.target.value })}>
              {RELATIONSHIPS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Surname" required>
            <input
              className="field uppercase"
              value={p.lastName}
              onChange={(e) => onChange({ lastName: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="Surname at birth" required>
            <input
              className="field uppercase"
              value={p.lastNameAtBirth}
              onChange={(e) => onChange({ lastNameAtBirth: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="First name(s)" required>
            <input
              className="field uppercase"
              value={p.firstName}
              onChange={(e) => onChange({ firstName: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="Other names">
            <input
              className="field uppercase"
              value={p.otherNames}
              onChange={(e) => onChange({ otherNames: latin(e.target.value) })}
            />
          </Field>
          <Field label="Date of birth" required>
            <input type="date" className="field" value={p.dob} onChange={(e) => onChange({ dob: e.target.value })} required />
          </Field>
          <Field label="Place of birth" required>
            <input
              className="field uppercase"
              value={p.placeOfBirth}
              onChange={(e) => onChange({ placeOfBirth: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="Country of birth" required>
            <input
              className="field uppercase"
              value={p.countryOfBirth}
              onChange={(e) => onChange({ countryOfBirth: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="Current nationality" required>
            <input
              className="field uppercase"
              value={p.nationality}
              onChange={(e) => onChange({ nationality: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="Nationality at birth">
            <input
              className="field uppercase"
              value={p.nationalityAtBirth}
              onChange={(e) => onChange({ nationalityAtBirth: latin(e.target.value) })}
            />
          </Field>
          <Field label="Gender" required>
            <select
              className="field"
              value={p.gender}
              onChange={(e) => onChange({ gender: e.target.value as Applicant['gender'] })}
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
          </Field>
          <Field label="Marital status" required>
            <select className="field" value={p.maritalStatus} onChange={(e) => onChange({ maritalStatus: e.target.value })}>
              {MARITAL.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="National identity number">
            <input
              className="field uppercase"
              value={p.nationalId}
              onChange={(e) => onChange({ nationalId: latin(e.target.value) })}
            />
          </Field>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Travel document</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type of travel document" required>
            <select className="field" value={p.passportType} onChange={(e) => onChange({ passportType: e.target.value })}>
              {PASSPORT_TYPES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Number of travel document" required>
            <input
              className="field uppercase"
              value={p.passportNumber}
              onChange={(e) => onChange({ passportNumber: latin(e.target.value) })}
              required
            />
          </Field>
          <Field label="Date of issue" required>
            <input
              type="date"
              className="field"
              value={p.passportIssued}
              onChange={(e) => onChange({ passportIssued: e.target.value })}
              required
            />
          </Field>
          <Field label="Valid until" required>
            <input
              type="date"
              className="field"
              value={p.passportExpires}
              onChange={(e) => onChange({ passportExpires: e.target.value })}
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Issued by" required>
              <input
                className="field uppercase"
                value={p.passportIssuedBy}
                onChange={(e) => onChange({ passportIssuedBy: latin(e.target.value) })}
                required
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Contact</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input className="field" type="email" value={p.email} onChange={(e) => onChange({ email: e.target.value })} />
          </Field>
          <Field label="Telephone" required>
            <input
              className="field"
              value={p.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              placeholder="291234567"
              inputMode="numeric"
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Home address">
              <input
                className="field uppercase"
                value={p.address}
                onChange={(e) => onChange({ address: latin(e.target.value) })}
              />
            </Field>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">Journey</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Purpose of journey" required>
            <select className="field" value={p.purpose} onChange={(e) => onChange({ purpose: e.target.value })}>
              {PURPOSES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Member state of first entry">
            <input className="field" value={p.firstEntry} onChange={(e) => onChange({ firstEntry: e.target.value })} />
          </Field>
          <Field label="Number of entries requested">
            <select className="field" value={p.entries} onChange={(e) => onChange({ entries: e.target.value })}>
              {ENTRIES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <Field label="Intended duration of stay (days)">
            <input className="field" value={p.durationDays} onChange={(e) => onChange({ durationDays: e.target.value })} />
          </Field>
        </div>
      </div>
    </div>
  )
}
