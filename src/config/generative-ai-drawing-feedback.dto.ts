import { z } from 'zod';

const categoryScoreSchema = z.number().min(0).max(100);

export const GenerativeAIDrawingFeedbackSchema = z.object({
    overall_score: z.number().min(0).max(100),
    category_scores: z.object({
        proportions: categoryScoreSchema,
        anatomy: categoryScoreSchema,
        perspective: categoryScoreSchema,
        shading: categoryScoreSchema,
        line_quality: categoryScoreSchema,
        composition: categoryScoreSchema,
        likeness: categoryScoreSchema
    }),
    category_feedback: z.object({
        proportions: z.string(),
        anatomy: z.string(),
        perspective: z.string(),
        shading: z.string(),
        line_quality: z.string(),
        composition: z.string(),
        likeness: z.string()
    }),
    improvement_tips: z.array(z.string()),
    progress_summary: z.string().nullable()
});

export type GenerativeAIDrawingFeedback = z.infer<typeof GenerativeAIDrawingFeedbackSchema>;