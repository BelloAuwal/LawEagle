import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { CauseListEntry } from '../../types';

interface AddCauseListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (entry: Omit<CauseListEntry, 'id'>) => void;
}

export const AddCauseListModal: React.FC<AddCauseListModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [suitNumber, setSuitNumber] = useState('');
  const [courtName, setCourtName] = useState('Federal High Court of Nigeria');
  const [division, setDivision] = useState('Lagos Judicial Division (Ikoyi)');
  const [coram, setCoram] = useState('');
  const [parties, setParties] = useState('');
  const [stage, setStage] = useState<CauseListEntry['stage']>('Hearing');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00 AM');
  const [courtRoom, setCourtRoom] = useState('Courtroom 1');
  const [advocateRole, setAdvocateRole] = useState<CauseListEntry['advocateRole']>('Counsel for Claimant');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suitNumber.trim() || !parties.trim() || !coram.trim()) {
      return;
    }

    onAdd({
      suitNumber: suitNumber.trim(),
      courtName,
      division,
      coram: coram.trim(),
      parties: parties.trim(),
      stage,
      date,
      time,
      courtRoom: courtRoom.trim(),
      advocateRole,
      notes: notes.trim() || undefined,
    });

    // Reset and close
    setSuitNumber('');
    setParties('');
    setCoram('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Docket Cause List Sitting"
      subtitle="Record court appearance details and hearing stage"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Suit Number"
            placeholder="e.g. FHC/L/CS/1042/2024"
            value={suitNumber}
            onChange={(e) => setSuitNumber(e.target.value)}
            required
          />

          <Select
            label="Court Jurisdiction"
            value={courtName}
            onChange={(e) => setCourtName(e.target.value)}
            options={[
              { value: 'Supreme Court of Nigeria', label: 'Supreme Court of Nigeria' },
              { value: 'Court of Appeal', label: 'Court of Appeal' },
              { value: 'Federal High Court of Nigeria', label: 'Federal High Court' },
              { value: 'High Court of Lagos State', label: 'High Court of Lagos State' },
              { value: 'High Court of FCT Abuja', label: 'High Court of FCT Abuja' },
              { value: 'National Industrial Court of Nigeria', label: 'National Industrial Court (NICN)' },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Judicial Division / Bench"
            placeholder="e.g. Lagos (Ikoyi) or Abuja"
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            required
          />

          <Input
            label="Presiding Judge(s) / Coram"
            placeholder="e.g. Hon. Justice A. M. Liman"
            value={coram}
            onChange={(e) => setCoram(e.target.value)}
            required
          />
        </div>

        <Input
          label="Parties / Matter Title"
          placeholder="e.g. Zenith Energy Corp v. Federal Inland Revenue Service"
          value={parties}
          onChange={(e) => setParties(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Matter Stage"
            value={stage}
            onChange={(e) => setStage(e.target.value as CauseListEntry['stage'])}
            options={[
              { value: 'Mention', label: 'Mention' },
              { value: 'Hearing', label: 'Hearing' },
              { value: 'Ruling', label: 'Ruling' },
              { value: 'Cross-Examination', label: 'Cross-Examination' },
              { value: 'Adoption of Briefs', label: 'Adoption of Briefs' },
              { value: 'Judgment', label: 'Judgment' },
            ]}
          />

          <Input
            label="Hearing Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            label="Scheduled Time"
            placeholder="e.g. 09:00 AM"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Courtroom / Floor"
            placeholder="e.g. Court 4, 2nd Floor"
            value={courtRoom}
            onChange={(e) => setCourtRoom(e.target.value)}
          />

          <Select
            label="Advocate Appearance Role"
            value={advocateRole}
            onChange={(e) => setAdvocateRole(e.target.value as CauseListEntry['advocateRole'])}
            options={[
              { value: 'Counsel for Claimant', label: 'Counsel for Claimant' },
              { value: 'Counsel for Defendant', label: 'Counsel for Defendant' },
              { value: 'Appellant Counsel', label: 'Appellant Counsel' },
              { value: 'Respondent Counsel', label: 'Respondent Counsel' },
            ]}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-slate-300 mb-1.5">
            Hearing Strategy &amp; Notes
          </label>
          <textarea
            rows={2}
            className="w-full rounded-xl bg-[#091526]/90 border border-[#C5A059]/30 text-slate-100 placeholder:text-slate-500 text-sm px-4 py-2.5 outline-none focus:border-[#C5A059]"
            placeholder="e.g. Carry authorities on Section 84 SCPA and 3 bundles of amended statement of defense..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold">
            Docket Cause Entry
          </Button>
        </div>
      </form>
    </Modal>
  );
};
