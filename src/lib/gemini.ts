import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function generateCitation(
  recipientName: string,
  achievement: string,
  eventType: string,
  organizationName?: string,
  tone: string = 'formal'
): Promise<string> {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Falling back to default citation generator.')
      return generateFallbackCitation(recipientName, achievement, eventType, organizationName, tone)
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
Write a professional certificate citation of exactly 2 to 3 sentences.
The citation must be written in the third person.
You must specifically mention the recipient by name: "${recipientName}".
You must specifically mention their achievement: "${achievement}".
Event type: "${eventType}".
Organization (if any): "${organizationName || 'Not specified'}".
Tone: ${tone}.

Do not include any placeholders or brackets in your response. Output only the citation text.
    `.trim()

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    if (!text || text.trim().length === 0) {
      throw new Error('Received empty response from Gemini')
    }

    return text.trim()
  } catch (error) {
    console.error('Error in generateCitation:', error)
    return generateFallbackCitation(recipientName, achievement, eventType, organizationName, tone)
  }
}

function generateFallbackCitation(
  recipientName: string,
  achievement: string,
  eventType: string,
  organizationName?: string,
  tone: string = 'formal'
): string {
  const org = organizationName ? ` by ${organizationName}` : ''
  
  if (tone === 'warm') {
    return `We are thrilled to recognize ${recipientName} for their outstanding dedication in completing the ${achievement}. Your hard work during this ${eventType}${org} truly sets you apart as an inspiration to others.`
  }
  
  if (tone === 'inspiring') {
    return `This certifies that ${recipientName} has triumphantly completed the ${achievement}. May this milestone achieved during the ${eventType}${org} serve as a stepping stone to even greater successes in the future.`
  }
  
  // Default / Formal
  return `This is to certify that ${recipientName} has successfully completed the requirements for ${achievement}. Conferred during the ${eventType}${org} in recognition of their demonstrated competence and commitment.`
}

export interface GeneratedProject {
  projectName: string;
  eventType: string; // 'Conference' | 'Training' | 'Academic' | 'Sports' | 'Workshop' | 'Other'
  achievement: string;
  citationText: string;
  templateCategory: string; // 'Corporate' | 'Academic' | 'Sports' | 'Recognition'
  tone: string; // 'formal' | 'warm' | 'inspiring'
}

export async function generateProject(description: string): Promise<GeneratedProject> {
  const fallback: GeneratedProject = {
    projectName: 'Generated Certificate',
    eventType: 'Training',
    achievement: 'Completion of Training',
    citationText: 'This is to certify that the recipient has successfully completed the required training program and demonstrated competence in the subject matter.',
    templateCategory: 'Corporate',
    tone: 'formal'
  }

  try {
    if (!GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Returning fallback project.')
      return fallback
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
You are an expert system that parses user requests for generating certificates.
Analyze the following description:
"${description}"

Return a raw JSON object (with NO markdown formatting, NO \`\`\`json blocks) containing exactly these keys:
- projectName (string, a short suitable project name)
- eventType (string, ONE OF: Conference, Training, Academic, Sports, Workshop, Other)
- achievement (string, the specific award or completion text, e.g. "Advanced React Course" or "Employee of the Month")
- citationText (string, 2 to 3 sentences recognizing the achievement)
- templateCategory (string, ONE OF: Corporate, Academic, Sports, Recognition. Pick the best visual style fit)
- tone (string, ONE OF: formal, warm, inspiring. Pick based on description intent)
`.trim()

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()
    
    // Clean up potential markdown formatting if model ignores instruction
    text = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/```$/, '').trim()

    const parsed = JSON.parse(text)
    
    // Ensure all fields exist
    return {
      projectName: parsed.projectName || fallback.projectName,
      eventType: parsed.eventType || fallback.eventType,
      achievement: parsed.achievement || fallback.achievement,
      citationText: parsed.citationText || fallback.citationText,
      templateCategory: parsed.templateCategory || fallback.templateCategory,
      tone: parsed.tone || fallback.tone,
    }
  } catch (error) {
    console.error('Error in generateProject:', error)
    return fallback
  }
}
