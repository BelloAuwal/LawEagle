import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { PrecedentDigest } from '../../types';
import { Bookmark, BookmarkCheck, Scale, Copy, Check } from 'lucide-react';

interface PrecedentDetailModalProps {
  precedent: PrecedentDigest | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark: (id: string) => void;
}

export const PrecedentDetailModal: React.FC<PrecedentDetailModalProps> = ({
  precedent,
  isOpen,
  onClose,
  onToggleBookmark,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!precedent) return null;

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(`${precedent.title} ${precedent.citation}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={precedent.title}
      subtitle={precedent.court}
      maxWidth="xl"
    >
      <div className="space-y-4 text-left">
        {/* Citation bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#0E223D]/70 border border-[#C5A059]/30">
          <div>
            <p className="text-[10px] uppercase font-semibold text-slate-400">Official Citation</p>
            <p className="text-sm font-serif font-bold text-[#E4C47C]">{precedent.citation}</p>
          </div>
          <button
            onClick={handleCopyCitation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B192C] text-xs font-medium text-slate-300 hover:text-white border border-[#C5A059]/30 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Bench / Coram */}
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-white">Coram / Bench: </span>
          <span>{precedent.coram}</span>
        </div>

        {/* Ratio Decidendi */}
        <div className="p-4 rounded-xl bg-[#091526] border border-[#C5A059]/40 relative">
          <div className="flex items-center gap-2 mb-2 text-[#E4C47C]">
            <Scale className="w-4 h-4" />
            <h4 className="font-serif font-bold text-sm tracking-wide uppercase">
              Ratio Decidendi (Binding Principle of Law)
            </h4>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-serif italic">
            "{precedent.ratioDecidendi}"
          </p>
        </div>

        {/* Legal Principles */}
        <div>
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-2">
            Established Legal Holdings &amp; Points of Law
          </h4>
          <ul className="space-y-2">
            {precedent.principles.map((p, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-xs text-slate-300 bg-[#0E223D]/30 p-2.5 rounded-lg border border-slate-800"
              >
                <span className="font-mono text-[#E4C47C] shrink-0 font-bold">
                  {idx + 1}.
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onToggleBookmark(precedent.id)}
            className="flex items-center gap-2 text-xs font-medium text-[#E4C47C] hover:text-white p-2 rounded-lg hover:bg-white/5 cursor-pointer"
          >
            {precedent.bookmarked ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-[#C5A059]" />
                <span>Saved to My Legal Vault</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>Save to Vault</span>
              </>
            )}
          </button>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
