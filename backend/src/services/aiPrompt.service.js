export const validCategories = [
  "DSA",
  "MERN Stack",
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Core CS",
  "DBMS",
  "Operating System",
  "Computer Networks",
  "OOP",
  "System Design",
  "Cybersecurity",
  "Aptitude",
  "Resume",
  "HR Preparation",
  "Mock Interview",
  "Other"
];

export const aiSystemInstruction = `You are an expert Indian campus placement preparation coach.
Return JSON only. Create realistic, day-wise preparation tasks that can be inserted into a todo app.
Use only these categories: ${validCategories.join(", ")}.
Use only these difficulties: Easy, Medium, Hard.
Use only these priorities: Low, Medium, High, Critical.
Respect the user's daily study hours and avoid impossible task loads.
Include revision and mock/interview practice when useful.`;

export function buildDailySuggestionPrompt(context) {
  return `${aiSystemInstruction}

Create 4 to 7 task suggestions for today.
Priority order:
1. If activeRoadmap exists, suggestions must primarily follow today's roadmap day or the next unconverted/upcoming roadmap day.
2. Use activeRoadmap focusAreas before general profile targetRole.
3. Use weak categories and pending tasks as secondary signals.
4. Do not add MERN/React/Node/MongoDB tasks unless those categories are in activeRoadmap.focusAreas, pendingTasks, weak categories, or the user has spare capacity after roadmap-critical work.
5. At least 70% of total suggested time should match activeRoadmap focus areas when activeRoadmap exists.
6. Keep total estimated time near the user's dailyStudyHoursGoal.

Context:
${JSON.stringify(context, null, 2)}

Return:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "category": "DSA",
      "difficulty": "Easy|Medium|Hard",
      "priority": "Low|Medium|High|Critical",
      "estimatedTimeMinutes": 30,
      "reason": "string"
    }
  ]
}`;
}

export function buildQuestionnairePrompt(payload) {
  return `${aiSystemInstruction}

Create 5 to 8 short questions needed before generating a roadmap.

Goal setup:
${JSON.stringify(payload, null, 2)}

Return:
{
  "questions": [
    {
      "id": "snake_case_id",
      "question": "string",
      "type": "single_choice|multi_choice|text",
      "options": ["string"]
    }
  ]
}`;
}

export function buildRoadmapPrompt(context) {
  return `${aiSystemInstruction}

Generate a complete day-wise roadmap.
Every day should have 2 to 5 tasks depending on study hours.
Total estimated minutes per day must fit within dailyStudyHours.
The roadmapRequest is the source of truth. You must obey it exactly:
- Use exactly roadmapRequest.focusAreas. Do not add unrelated areas.
- Use only allowedRoadmapCategories for task.category.
- If focusAreas is ["DSA"], every task.category must be "DSA".
- Do not add MERN, React, Node.js, MongoDB, Aptitude, Resume, HR, or Mock Interview unless that area is selected or appears in allowedRoadmapCategories.
- Use roadmapRequest.timelineDays exactly.
- Use roadmapRequest.dailyStudyHours exactly.
- Start on roadmapRequest.startDate.
- Reflect questionnaire answers, but never override selected focus areas with inferred interests.

Context:
${JSON.stringify(context, null, 2)}

Return:
{
  "title": "string",
  "summary": "string",
  "timelineDays": 30,
  "dailyStudyHours": 4,
  "focusAreas": ["DSA"],
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "theme": "string",
      "tasks": [
        {
          "title": "string",
          "description": "string",
          "category": "DSA",
          "difficulty": "Easy|Medium|Hard",
          "priority": "Low|Medium|High|Critical",
          "estimatedTimeMinutes": 45,
          "reason": "string"
        }
      ]
    }
  ]
}`;
}

export function buildWeaknessPrompt(context) {
  return `${aiSystemInstruction}

Analyze preparation weakness and readiness.

Context:
${JSON.stringify(context, null, 2)}

Return:
{
  "overallReadinessScore": 65,
  "categoryScores": [
    { "category": "DSA", "score": 60, "status": "Needs Focus", "reason": "string" }
  ],
  "recommendations": ["string"]
}`;
}
