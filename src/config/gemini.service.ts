import { Injectable } from "@nestjs/common";
import axios from "axios";
import { GoogleGenerativeAI, GenerativeModel, SchemaType } from "@google/generative-ai";
import { GenerativeAIDrawingFeedbackSchema } from "./generative-ai-drawing-feedback.dto";
import { Type } from "@google/genai";

@Injectable()
export class GeminiService {
    private readonly genAI: GoogleGenerativeAI;
    private readonly model: GenerativeModel;

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async generateDrawingRating(
        drawingImage: string,
        referenceImage: string
    ) {
        const imageResp1 = await axios.get(drawingImage, { responseType: 'arraybuffer' });
        const imageResp2 = await axios.get(referenceImage, { responseType: 'arraybuffer' });

        const drawingBase64 = Buffer.from(imageResp1.data).toString('base64');
        const referenceBase64 = Buffer.from(imageResp2.data).toString('base64');

        const drawingMimeType = imageResp1.headers['content-type'];
        const referenceMimeType = imageResp2.headers['content-type'];

        const prompt = `
            # Role and Objective
            You are an expert art instructor and drawing critic for beginners. Your job is to analyze a beginner artist's drawing (left) by comparing it to a reference image (right).

            # Feedback Components
            Please provide detailed, constructive feedback including:
            1. Overall score (0–100)
            2. Category-specific scores for:
               - Proportions
               - Anatomy
               - Perspective
               - Shading
               - Line quality
               - Composition
               - Likeness
            3. Written feedback for each category explaining:
               - What was done well
               - What can be improved
            4. Specific tips for improvement
            5. Detected drawing concepts (e.g., foreshortening, gesture, cross-contour, light source)
               with suggestions for improvement

            # Progress Tracking
            - If past feedback exists: Provide a short progress summary highlighting improvements/regressions
            - If no past feedback: Set progress_summary to null

            # Evaluation Guidelines
            - Use the reference image as the gold standard
            - The user's drawing is an attempt to replicate/interpret it
            - Provide honest, potentially strict feedback for lazily made drawings

            # Response Format
            Return your analysis in the following JSON structure:

            {
                "overall_score": 76,
                "category_scores": {
                    "proportions": 70,
                    "anatomy": 65,
                    "perspective": 80,
                    "shading": 75,
                    "line_quality": 60,
                    "composition": 85,
                    "likeness": 68
                },
                "category_feedback": {
                    "proportions": "The limbs are a bit longer than in the reference, especially the arms. Pay more attention to relative size.",
                    "anatomy": "Some muscles are hinted at nicely, but there is confusion around the shoulder area.",
                    "perspective": "The angles of the feet and face show that you understood the basic perspective, well done!",
                    "shading": "Nice values! You could improve edge control to create better form.",
                    "line_quality": "Lines are scratchy in places. Try more confident, intentional strokes.",
                    "composition": "You kept the subject well-placed on the page with good spacing. Great framing!",
                    "likeness": "The facial features are in the right place, but the expression and spacing slightly differ."
                },
                "improvement_tips": [
                    "Do more gesture drawing exercises to improve proportions and flow.",
                    "Practice using 3D forms (cylinders, boxes) to better understand anatomy.",
                    "Try copying master drawings to develop better line confidence."
                ],
                "progress_summary": "Compared to the last drawing, proportions and shading have improved, while line quality still needs work. Keep it up!"
            }`

        this.model.generationConfig = {
            responseMimeType: "application/json",
            responseSchema: {
                type: SchemaType.OBJECT,
                properties: {
                    "overall_score": {
                        type: SchemaType.INTEGER,
                        "description": "Overall score for the drawing (0-100).",
                        nullable: false
                    },
                    "category_scores": {
                        "type": SchemaType.OBJECT,
                        "description": "Scores for specific categories.",
                        "properties": {
                            "proportions": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for proportions."
                            },
                            "anatomy": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for anatomy."
                            },
                            "perspective": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for perspective."
                            },
                            "shading": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for shading."
                            },
                            "line_quality": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for line quality."
                            },
                            "composition": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for composition."
                            },
                            "likeness": {
                                "type": SchemaType.INTEGER,
                                "description": "Score for likeness."
                            }
                        },
                        "required": [
                            "proportions",
                            "anatomy",
                            "perspective",
                            "shading",
                            "line_quality",
                            "composition",
                            "likeness"
                        ]
                    },
                    "category_feedback": {
                        "type": SchemaType.OBJECT,
                        "description": "Detailed feedback for each category.",
                        "properties": {
                            "proportions": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on proportions."
                            },
                            "anatomy": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on anatomy."
                            },
                            "perspective": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on perspective."
                            },
                            "shading": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on shading."
                            },
                            "line_quality": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on line quality."
                            },
                            "composition": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on composition."
                            },
                            "likeness": {
                                "type": SchemaType.STRING,
                                "description": "Feedback on likeness."
                            }
                        },
                        "required": [
                            "proportions",
                            "anatomy",
                            "perspective",
                            "shading",
                            "line_quality",
                            "composition",
                            "likeness"
                        ]
                    },
                    "improvement_tips": {
                        "type": SchemaType.ARRAY,
                        "description": "Tips on how to improve weak areas.",
                        "items": {
                            "type": SchemaType.STRING
                        }
                    },
                    "progress_summary": {
                        "type": SchemaType.STRING,
                        "description": "Summary of progress compared to previous drawings. Only include if past_feedback was given.",
                        nullable: true
                    }
                },
                "required": [
                    "overall_score",
                    "category_scores",
                    "category_feedback",
                    "improvement_tips",
                    "progress_summary"
                  ]            
            }
        }
        
        const result = await this.model.generateContent(
            [
                {
                    inlineData: {
                        data: drawingBase64,
                        mimeType: drawingMimeType,
                    },
                },
                {
                    inlineData: {
                        data: referenceBase64,
                        mimeType: referenceMimeType,
                    },
                },
                prompt,
            ]
        );

        const response = result.response;
        const rawData = JSON.parse(response.text());
        const data = GenerativeAIDrawingFeedbackSchema.parse(rawData);

        return {
            overallScore: data.overall_score,
            categoryScores: {
                proportions: data.category_scores.proportions,
                anatomy: data.category_scores.anatomy,
                perspective: data.category_scores.perspective,
                shading: data.category_scores.shading,
                lineQuality: data.category_scores.line_quality,
                composition: data.category_scores.composition,
                likeness: data.category_scores.likeness
            },
            categoryFeedback: {
                proportions: data.category_feedback.proportions,
                anatomy: data.category_feedback.anatomy,
                perspective: data.category_feedback.perspective,
                shading: data.category_feedback.shading,
                lineQuality: data.category_feedback.line_quality,
                composition: data.category_feedback.composition,
                likeness: data.category_feedback.likeness
            },
            improvementTips: data.improvement_tips,
            progressSummary: data.progress_summary
        };
    }
}