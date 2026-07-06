import { z } from "zod/v4";

export const questionBankDifficultyEnum = z.enum(["easy", "medium", "hard"]);
export const questionBankTypeEnum = z.enum(["mcq", "true_false", "fill_blank", "essay", "matching", "code"]);

export const createQuestionBankItemSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  subject: z.string().min(1, "Subject is required"),
  difficulty: questionBankDifficultyEnum,
  type: questionBankTypeEnum,
  content: z.string().min(1, "Question content is required"),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
  codeLanguage: z.string().optional(),
});

export const updateQuestionBankItemSchema = createQuestionBankItemSchema.partial();

export const filterQuestionBankSchema = z.object({
  topic: z.string().optional(),
  subject: z.string().optional(),
  difficulty: questionBankDifficultyEnum.optional(),
  type: questionBankTypeEnum.optional(),
  search: z.string().optional(),
  limit: z.number().default(50),
  offset: z.number().default(0),
});

export type CreateQuestionBankItem = z.infer<typeof createQuestionBankItemSchema>;
export type UpdateQuestionBankItem = z.infer<typeof updateQuestionBankItemSchema>;
export type FilterQuestionBank = z.infer<typeof filterQuestionBankSchema>;
