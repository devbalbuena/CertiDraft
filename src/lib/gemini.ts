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
