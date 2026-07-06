import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Toast } from "./common/toast";

interface CreateQuestionFormProps {
  courseId: string;
  onSuccess?: () => void;
}

export const CreateQuestionForm: React.FC<CreateQuestionFormProps> = ({
  courseId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    topic: "",
    subject: "",
    difficulty: "medium" as const,
    type: "mcq" as const,
    content: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return customFetch("/api/question-bank", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          courseId: parseInt(courseId),
          options: data.type === "mcq" ? data.options.filter((o) => o.trim()) : undefined,
        }),
        headers: { "content-type": "application/json" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      setToast({ message: "Question created successfully", type: "success" });
      setFormData({
        topic: "",
        subject: "",
        difficulty: "medium",
        type: "mcq",
        content: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
      });
      onSuccess?.();
    },
    onError: () => {
      setToast({ message: "Failed to create question", type: "error" });
    },
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  return (
    <Card>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <CardHeader>
        <CardTitle>Create New Question</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Topic"
              placeholder="e.g., Algebra, Photosynthesis"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              required
            />
            <Input
              label="Subject"
              placeholder="e.g., Mathematics, Biology"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>

            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            >
              <option value="mcq">Multiple Choice</option>
              <option value="true_false">True/False</option>
              <option value="essay">Essay</option>
              <option value="fill_blank">Fill in Blank</option>
            </Select>
          </div>

          <Textarea
            label="Question"
            placeholder="Enter the question text"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            rows={3}
          />

          {formData.type === "mcq" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Options</label>
              {formData.options.map((option, index) => (
                <Input
                  key={index}
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              ))}
            </div>
          )}

          <Input
            label="Correct Answer"
            placeholder="Enter the correct answer"
            value={formData.correctAnswer}
            onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
            required
          />

          <Textarea
            label="Explanation (Optional)"
            placeholder="Explain why this is the correct answer"
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={2}
          />

          <Button
            onClick={() => createMutation.mutate(formData)}
            disabled={createMutation.isPending || !formData.content || !formData.topic}
            className="w-full"
          >
            {createMutation.isPending ? "Creating..." : "Create Question"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
