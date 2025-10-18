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
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Submit Your P&L</h3>
          <p className="text-gray-600 text-sm mt-1">
            Submit your percentage gain or loss for today. You can only submit once per day.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="percentageGain" className="block text-sm font-medium text-gray-700 mb-1">
              Percentage Gain/Loss (%)
            </label>
            <input
              id="percentageGain"
              type="number"
              step="0.01"
              placeholder="e.g., 2.5 or -1.2"
              value={percentageGain}
              onChange={(e) => setPercentageGain(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Enter positive for gains, negative for losses
            </p>
          </div>

          <div>
            <label htmlFor="proofImage" className="block text-sm font-medium text-gray-700 mb-1">
              Proof Image (Optional)
            </label>
            <input
              id="proofImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-600 mt-1">
              Upload a screenshot of your trading results for verification
            </p>
          </div>

          {error && (
            <Card className="bg-red-50 border-red-200 p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          )}

          {proofImage && (
            <Card className="bg-green-50 border-green-200 p-3">
              <p className="text-green-700 text-sm">
                Selected: {proofImage.name}
              </p>
            </Card>
          )}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="soft" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
