// Helper to generate basic template layouts as starting points

export function getTemplateElements(templateName: string): string {
  // Common shared styles
  const baseCanvas = {
    version: '7.4.0',
    objects: [],
    background: '#ffffff',
  }

  const objects: any[] = []

  if (templateName === 'Minimal') {
    objects.push({
      type: 'Textbox',
      text: 'CERTIFICATE OF ACHIEVEMENT',
      left: 421,
      top: 150,
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: 'bold',
      fill: '#1f2937',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: 'This is to certify that',
      left: 421,
      top: 220,
      fontFamily: 'Inter',
      fontSize: 16,
      fill: '#6b7280',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{recipient_name}}',
      left: 421,
      top: 280,
      fontFamily: 'Georgia',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#111827',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{achievement}}',
      left: 421,
      top: 350,
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#4b5563',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{citation_text}}',
      left: 421,
      top: 400,
      fontFamily: 'Inter',
      fontSize: 14,
      fill: '#6b7280',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: 'Issued on {{issued_date}}',
      left: 421,
      top: 500,
      fontFamily: 'Inter',
      fontSize: 12,
      fill: '#9ca3af',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
  } else if (templateName === 'Bordered') {
    objects.push({
      type: 'Rect',
      left: 30,
      top: 30,
      width: 782,
      height: 535,
      fill: 'transparent',
      stroke: '#0f172a',
      strokeWidth: 4,
      rx: 0,
      ry: 0,
    })
    objects.push({
      type: 'Rect',
      left: 40,
      top: 40,
      width: 762,
      height: 515,
      fill: 'transparent',
      stroke: '#0f172a',
      strokeWidth: 1,
      rx: 0,
      ry: 0,
    })
    objects.push({
      type: 'Textbox',
      text: 'CERTIFICATE',
      left: 421,
      top: 140,
      fontFamily: 'Times New Roman',
      fontSize: 48,
      fontWeight: 'bold',
      fill: '#0f172a',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{recipient_name}}',
      left: 421,
      top: 260,
      fontFamily: 'Times New Roman',
      fontSize: 42,
      fontStyle: 'italic',
      fill: '#1e293b',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{achievement}}',
      left: 421,
      top: 340,
      fontFamily: 'Inter',
      fontSize: 18,
      fill: '#334155',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{citation_text}}',
      left: 421,
      top: 390,
      fontFamily: 'Inter',
      fontSize: 14,
      fill: '#475569',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{issued_date}}',
      left: 150,
      top: 480,
      fontFamily: 'Inter',
      fontSize: 14,
      fill: '#0f172a',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: 'Date',
      left: 150,
      top: 500,
      fontFamily: 'Inter',
      fontSize: 12,
      fill: '#64748b',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
  } else if (templateName === 'Dark Header') {
    objects.push({
      type: 'Rect',
      left: 0,
      top: 0,
      width: 842,
      height: 120,
      fill: '#1e1b4b',
      strokeWidth: 0,
      rx: 0,
      ry: 0,
    })
    objects.push({
      type: 'Textbox',
      text: 'CERTIFICATE OF COMPLETION',
      left: 421,
      top: 60,
      fontFamily: 'Inter',
      fontSize: 28,
      fontWeight: 'bold',
      fill: '#ffffff',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{recipient_name}}',
      left: 421,
      top: 250,
      fontFamily: 'Georgia',
      fontSize: 42,
      fontWeight: 'bold',
      fill: '#111827',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{achievement}}',
      left: 421,
      top: 320,
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#4b5563',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: '{{citation_text}}',
      left: 421,
      top: 380,
      fontFamily: 'Inter',
      fontSize: 14,
      fill: '#6b7280',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
    objects.push({
      type: 'Textbox',
      text: 'Date: {{issued_date}}',
      left: 421,
      top: 480,
      fontFamily: 'Inter',
      fontSize: 14,
      fill: '#374151',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    })
  }

  return JSON.stringify({ ...baseCanvas, objects })
}
