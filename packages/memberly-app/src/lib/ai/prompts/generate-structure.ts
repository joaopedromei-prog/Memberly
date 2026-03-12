import type { WizardInputs } from '@/types/ai';

export function buildStructurePrompt(inputs: WizardInputs): string {
  return `Você é um especialista em criação de cursos online.
Gere a estrutura completa de um curso com base nos seguintes dados:

- Nome do Produto: ${inputs.productName}
- Tema/Nicho: ${inputs.topic}
- Público-alvo: ${inputs.targetAudience}
- Número de Módulos: ${inputs.moduleCount}
- Tom: ${inputs.tone === 'formal' ? 'Formal e profissional' : 'Informal e acessível'}

Retorne APENAS um JSON válido (sem markdown, sem explicações) com o seguinte schema:
{
  "product": {
    "title": "string",
    "description": "string (2-3 frases)",
    "bannerSuggestion": "string (descrição visual para gerar banner)"
  },
  "modules": [
    {
      "title": "string",
      "description": "string (1-2 frases)",
      "bannerSuggestion": "string",
      "lessons": [
        {
          "title": "string",
          "description": "string (1 frase)",
          "durationMinutes": number (5-60)
        }
      ]
    }
  ]
}

Regras:
- Exatamente ${inputs.moduleCount} módulos
- 3-7 aulas por módulo (varie conforme complexidade)
- Títulos claros e atrativos para o público-alvo
- Descrições no tom ${inputs.tone === 'formal' ? 'formal e profissional' : 'informal e acessível'}
- Durações realistas (5-60 minutos)
- bannerSuggestion deve descrever uma imagem 16:9 adequada ao tema`;
}
