"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Button, Input, Label, Card } from "frosted-ui";
import { Toast } from "frosted-ui";

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

      // Show success toast
      Toast.success('Submission successful!');
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Your P&L</DialogTitle>
          <DialogDescription>
            Submit your percentage gain or loss for today. You can only submit once per day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="percentageGain">Percentage Gain/Loss (%)</Label>
            <Input
              id="percentageGain"
              type="number"
              step="0.01"
              placeholder="e.g., 2.5 or -1.2"
              value={percentageGain}
              onChange={(e) => setPercentageGain(e.target.value)}
              className="mt-1"
            />
            <p className="text-xs text-gray-6 mt-1">
              Enter positive for gains, negative for losses
            </p>
          </div>

          <div>
            <Label htmlFor="proofImage">Proof Image (Optional)</Label>
            <Input
              id="proofImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1"
            />
            <p className="text-xs text-gray-6 mt-1">
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

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </Dialog.Content>
    </Dialog>
  );
}
