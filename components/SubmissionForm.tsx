"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollText, Edit2 } from "lucide-react";
import MDEditor, { commands } from "@uiw/react-md-editor";

interface SubmissionFormProps {
  onSubmit: (text: string) => Promise<void>;
  todayUpdate?: {
    text: string;
    date: string;
  };
}

export default function SubmissionForm({ onSubmit, todayUpdate }: SubmissionFormProps) {
  const [text, setText] = useState(todayUpdate?.text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update text when todayUpdate changes
  useEffect(() => {
    if (todayUpdate?.text) {
      setText(todayUpdate.text);
    }
  }, [todayUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(text);
      if (!todayUpdate) {
        setText("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const customCommands = [
    commands.bold,
    commands.strikethrough,
    commands.link,
    commands.image,
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {todayUpdate && (
        <div className="text-sm text-muted-foreground mb-2">
          You already have an update for today ({new Date(todayUpdate.date).toLocaleDateString()})
        </div>
      )}
      <div data-color-mode="dark">
        <MDEditor
          value={text}
          onChange={(value) => setText(value || "")}
          preview="edit"
          height={200}
          className="!bg-background !border-input"
          commands={customCommands}
          textareaProps={{
            placeholder: "Record your progress on today's quest... (Markdown supported)",
          }}
        />
      </div>
      <Button 
        type="submit" 
        disabled={!text.trim() || isSubmitting}
        className="w-full bg-primary/90 hover:bg-primary text-primary-foreground transition-colors font-medium"
      >
        {isSubmitting ? (
          "Inscribing your scroll..."
        ) : (
          <>
            {todayUpdate ? (
              <Edit2 size={16} className="mr-2" />
            ) : (
              <ScrollText size={16} className="mr-2" />
            )}
            {todayUpdate ? "Update Today's Entry" : "Submit Today's Update"}
          </>
        )}
      </Button>
    </form>
  );
}