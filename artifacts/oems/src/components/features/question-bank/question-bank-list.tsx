import React, { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import { Pagination } from "./common/pagination";
import { Toast } from "./common/toast";

interface QuestionBankItem {
  id: string;
  topic: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  type: "mcq" | "true_false" | "fill_blank" | "essay" | "matching" | "code";
  content: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  createdBy: string;
  usageCount: number;
  createdAt: string;
}

interface QuestionBankListProps {
  courseId: string;
  readonly?: boolean;
}

export const QuestionBankList: React.FC<QuestionBankListProps> = ({ courseId, readonly = false }) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [filters, setFilters] = useState({
    topic: "",
    subject: "",
    difficulty: "",
    type: "",
    search: "",
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Fetch questions
  const { data, isLoading, error } = useQuery({
    queryKey: ["question-bank", page, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)),
      });
      return customFetch<{ questions: QuestionBankItem[]; total: number }>(
        `/api/question-bank?${params}`
      );
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      return customFetch(`/api/question-bank/${questionId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank"] });
      setToast({ message: "Question deleted successfully", type: "success" });
    },
    onError: () => {
      setToast({ message: "Failed to delete question", type: "error" });
    },
  });

  const handleFilterChange = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    []
  );

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  return (
    <div className="space-y-4">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <Input
              placeholder="Search..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
            <Select
              value={filters.topic}
              onChange={(e) => handleFilterChange("topic", e.target.value)}
            >
              <option value="">All Topics</option>
              <option value="Algebra">Algebra</option>
              <option value="Geometry">Geometry</option>
            </Select>
            <Select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
            <Select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="mcq">MCQ</option>
              <option value="essay">Essay</option>
              <option value="true_false">True/False</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Questions {data?.total ? `(${data.total} total)` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-gray-500">Loading questions...</p>}
          {error && <p className="text-red-500">Failed to load questions</p>}

          {data?.questions && data.questions.length > 0 ? (
            <div className="space-y-3">
              {data.questions.map((q) => (
                <div
                  key={q.id}
                  className="p-3 border rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{q.content}</p>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {q.type}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {q.difficulty}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Used {q.usageCount} times
                        </span>
                      </div>
                    </div>
                    {!readonly && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteQuestionMutation.mutate(q.id)}
                        disabled={deleteQuestionMutation.isPending}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No questions found</p>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
        />
      )}
    </div>
  );
};
