import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { ColleaguePost, LawyerUser } from '../../types';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: LawyerUser;
  onAddPost: (post: Omit<ColleaguePost, 'id' | 'likesCount' | 'commentsCount'>) => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAddPost,
}) => {
  const [postType, setPostType] = useState<ColleaguePost['postType']>('Brief Request');
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    onAddPost({
      authorName: currentUser.fullName,
      authorTitle: currentUser.title,
      authorScn: currentUser.scnNumber,
      nbaBranch: currentUser.nbaBranch,
      postType,
      content: content.trim(),
      timestamp: 'Just now',
    });

    setContent('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish to Colleague Lounge"
      subtitle="Broadcast brief holding request, inquiry, or court notice"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <Select
          label="Notice Category"
          value={postType}
          onChange={(e) => setPostType(e.target.value as ColleaguePost['postType'])}
          options={[
            { value: 'Brief Request', label: 'Brief Request (Appearance / Hold Brief)' },
            { value: 'Legal Inquiry', label: 'Practice Inquiry / Registry Procedure' },
            { value: 'Court Notice', label: 'Court Sitting / Practice Direction Alert' },
            { value: 'Practice Update', label: 'Branch Notice & Bar Announcement' },
          ]}
        />

        <div>
          <label className="block text-xs font-semibold tracking-wide uppercase text-slate-300 mb-1.5">
            Notice Details &amp; Jurisdiction
          </label>
          <textarea
            rows={4}
            className="w-full rounded-xl bg-[#091526]/90 border border-[#C5A059]/30 text-slate-100 placeholder:text-slate-500 text-sm p-3.5 outline-none focus:border-[#C5A059]"
            placeholder="State court division, date, coram, and specific instructions for colleagues..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div className="p-3 rounded-lg bg-[#0E223D]/50 border border-slate-800 text-xs text-slate-400">
          <span>Publishing as: </span>
          <strong className="text-white">
            {currentUser.fullName} ({currentUser.title}) · {currentUser.scnNumber} · {currentUser.nbaBranch}
          </strong>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gold">
            Broadcast Notice
          </Button>
        </div>
      </form>
    </Modal>
  );
};
