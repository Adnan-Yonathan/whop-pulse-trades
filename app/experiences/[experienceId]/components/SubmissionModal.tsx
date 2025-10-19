"use client";

import { useState } from "react";
import { Button, Card } from "frosted-ui";

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  experienceId: string;
}

export function SubmissionModal({ isOpen, onClose, onSuccess, experienceId }: SubmissionModalProps) {
  const [percentageGain, setPercentageGain] = useState("");
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!percentageGain) {
      setError("Please enter your percentage gain");
      return;
    }

    const gain = parseFloat(percentageGain);
    if (isNaN(gain)) {
      setError("Please enter a valid number");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('experienceId', experienceId);
      formData.append('percentageGain', gain.toString());
      
      if (proofImage) {
        formData.append('proofImage', proofImage);
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      // Show success message
      alert('Submission successful!');
      
      // Reset form and close modal
      setPercentageGain("");
      setProofImage(null);
      onClose();
      onSuccess();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setProofImage(file);
    } else {
      setError('Please select a valid image file');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--robinhood-card)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--robinhood-border)]">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-[var(--robinhood-text)]">Submit Your P&L</h3>
          <p className="text-[var(--robinhood-muted)] text-sm mt-1">
            Submit your percentage gain or loss for today. You can only submit once per day.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="percentageGain" className="block text-sm font-medium text-[var(--robinhood-text)] mb-1">
              Percentage Gain/Loss (%)
            </label>
            <input
              id="percentageGain"
              type="number"
              step="0.01"
              placeholder="e.g., 2.5 or -1.2"
              value={percentageGain}
              onChange={(e) => setPercentageGain(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-[var(--robinhood-bg)] border border-[var(--robinhood-border)] rounded-md text-[var(--robinhood-text)] focus:outline-none focus:ring-2 focus:ring-[var(--robinhood-green)] focus:border-[var(--robinhood-green)]"
            />
            <p className="text-xs text-[var(--robinhood-muted)] mt-1">
              Enter positive for gains, negative for losses
            </p>
          </div>

          <div>
            <label htmlFor="proofImage" className="block text-sm font-medium text-[var(--robinhood-text)] mb-1">
              Proof Image (Optional)
            </label>
            <input
              id="proofImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 bg-[var(--robinhood-bg)] border border-[var(--robinhood-border)] rounded-md text-[var(--robinhood-text)] focus:outline-none focus:ring-2 focus:ring-[var(--robinhood-green)] focus:border-[var(--robinhood-green)]"
            />
            <p className="text-xs text-[var(--robinhood-muted)] mt-1">
              Upload a screenshot of your trading results for verification
            </p>
          </div>

          {error && (
            <Card className="bg-[var(--robinhood-red)]/10 border-[var(--robinhood-red)] p-3">
              <p className="text-[var(--robinhood-red)] text-sm">{error}</p>
            </Card>
          )}

          {proofImage && (
            <Card className="bg-[var(--robinhood-green)]/10 border-[var(--robinhood-green)] p-3">
              <p className="text-[var(--robinhood-green)] text-sm">
                Selected: {proofImage.name}
              </p>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="soft" onClick={onClose} disabled={isSubmitting} className="text-[var(--robinhood-text)] border-[var(--robinhood-border)]">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-[var(--robinhood-green)] hover:bg-[var(--robinhood-green)]/80 text-[var(--robinhood-bg)]">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
