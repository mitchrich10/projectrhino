import { FC } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { Contact, FounderOnboardingData } from "./types";

interface Props {
  data: FounderOnboardingData;
  onChange: (patch: Partial<FounderOnboardingData>) => void;
  founderEmail: string;
  founderName: string;
}

const ROLE_OPTIONS = ["CFO / Finance Lead", "Operations Lead", "Marketing Lead", "Other"];

const KeyContactsStep: FC<Props> = ({ data, onChange, founderEmail, founderName }) => {
  const contacts = data.additional_contacts ?? [];

  const updateContact = (index: number, patch: Partial<Contact>) => {
    const updated = [...contacts];
    updated[index] = { ...updated[index], ...patch };
    onChange({ additional_contacts: updated });
  };

  const addContact = () => {
    onChange({ additional_contacts: [...contacts, { name: "", email: "", role: ROLE_OPTIONS[0] }] });
  };

  const removeContact = (index: number) => {
    onChange({ additional_contacts: contacts.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[#1A7EC8] mb-1">Your team</p>
        <h3 className="text-lg font-semibold text-[#173660] mb-1">Key Contacts</h3>
        <p className="text-sm text-[#173660]/60">
          Who should we loop in? Add the people on your team we should reach out to for events, operational discussions, finance check-ins, and portfolio updates.
        </p>
      </div>

      {/* Founder info (read-only) */}
      <div className="p-4 bg-[#F4F7FA] border border-[#CDD8E3] rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#173660] text-white flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#173660]">{founderName || "Founder"}</p>
            <p className="text-xs text-[#173660]/50">{founderEmail}</p>
          </div>
          <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[#1A7EC8] bg-[#1A7EC8]/10 px-2 py-1 rounded">
            You
          </span>
        </div>
      </div>

      {/* Additional contacts */}
      <div className="space-y-4">
        {contacts.map((contact, i) => (
          <div key={i} className="border border-[#CDD8E3] rounded-lg p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <select
                value={contact.role}
                onChange={(e) => updateContact(i, { role: e.target.value })}
                className="text-sm font-medium text-[#173660] bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={() => removeContact(i)}
                className="text-[#173660]/30 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateContact(i, { name: e.target.value })}
                placeholder="Full name"
                className="h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660] placeholder:text-[#173660]/30"
              />
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateContact(i, { email: e.target.value })}
                placeholder="Email address"
                className="h-10 border border-[#CDD8E3] rounded-lg px-3 text-sm bg-white text-[#173660] placeholder:text-[#173660]/30"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addContact}
        className="flex items-center gap-2 text-sm font-medium text-[#1A7EC8] hover:text-[#173660] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add contact
      </button>
    </div>
  );
};

export default KeyContactsStep;
