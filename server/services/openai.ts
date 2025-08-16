import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface GeneratedCourse {
  title: string;
  modules: GeneratedModule[];
  estimatedMinutes: number;
}

export interface GeneratedModule {
  title: string;
  contentHtml: string;
  learningObjectives: string[];
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestion {
  stemHtml: string;
  options: string[];
  correctIndex: number;
  rationaleHtml: string;
}

export async function generateCourseFromSOP(
  sopContent: string,
  moduleCount: string = "3-5",
  difficulty: string = "intermediate",
  passScore: number = 80
): Promise<GeneratedCourse> {
  try {
    const systemPrompt = `You are an expert instructional designer. Create concise, safety-aware micro-learning courses from business SOPs. Use plain language and active voice. Focus on practical, actionable content that learners can immediately apply.

Your task is to convert the provided SOP into a structured micro-course with modules, learning objectives, content, and assessment questions.

Guidelines:
- Create ${moduleCount} modules based on logical content divisions
- Each module should take 3-5 minutes to complete
- Write content at ${difficulty} level
- Include 3-5 multiple choice questions per module
- Ensure questions test comprehension and application
- Pass score is ${passScore}%

Respond with valid JSON in this exact format:
{
  "title": "Course title based on SOP content",
  "estimatedMinutes": 15,
  "modules": [
    {
      "title": "Module title",
      "contentHtml": "<p>HTML formatted content explaining key concepts...</p>",
      "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
      "questions": [
        {
          "stemHtml": "<p>Question text here?</p>",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 1,
          "rationaleHtml": "<p>Explanation of why this is correct...</p>"
        }
      ]
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Convert this SOP into a micro-course:\n\n${sopContent}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 4000
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from OpenAI");
    }

    const generatedCourse = JSON.parse(content) as GeneratedCourse;
    
    // Validate the structure
    if (!generatedCourse.title || !generatedCourse.modules || !Array.isArray(generatedCourse.modules)) {
      throw new Error("Invalid course structure generated");
    }

    return generatedCourse;
  } catch (error) {
    console.error("Error generating course:", error);
    throw new Error(`Failed to generate course: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function improveModuleContent(
  moduleContent: string,
  feedback?: string
): Promise<{ contentHtml: string; learningObjectives: string[] }> {
  try {
    const prompt = `Improve this training module content based on feedback. Keep it concise (3-5 minutes reading time) and practical.

Current content: ${moduleContent}
${feedback ? `Feedback: ${feedback}` : ''}

Respond with JSON:
{
  "contentHtml": "<p>Improved HTML content...</p>",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error improving module:", error);
    throw new Error(`Failed to improve module: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function regenerateQuiz(
  moduleContent: string,
  difficulty: string = "intermediate"
): Promise<GeneratedQuestion[]> {
  try {
    const prompt = `Generate 3-5 multiple choice questions for this training module content. Focus on practical application and comprehension.

Module content: ${moduleContent}
Difficulty: ${difficulty}

Each question should have 4 options with only one correct answer. Include clear explanations.

Respond with JSON:
{
  "questions": [
    {
      "stemHtml": "<p>Question text?</p>",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 1,
      "rationaleHtml": "<p>Explanation...</p>"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content generated from OpenAI");
    }

    const result = JSON.parse(content);
    return result.questions;
  } catch (error) {
    console.error("Error regenerating quiz:", error);
    throw new Error(`Failed to regenerate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
