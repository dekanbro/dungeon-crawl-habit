"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import MDEditor from "@uiw/react-md-editor";

interface SubmissionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: {
    text: string;
    date: string;
  } | null;
}

export default function SubmissionPreviewModal({ 
  isOpen, 
  onClose, 
  submission 
}: SubmissionPreviewModalProps) {
  if (!submission) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif">
            Quest Log - {format(new Date(submission.date), "MMMM d, yyyy")}
          </DialogTitle>
          <DialogDescription>
            Your recorded progress for this day
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 prose prose-invert max-w-none bg-background text-foreground rounded-md p-2 overflow-auto max-h-[70vh]">
          <MDEditor.Markdown 
            source={submission.text} 
            className="!bg-transparent !text-foreground"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 