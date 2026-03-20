# Epic 14 — Certificados de Conclusão

> **Fase 3 — Diferenciação | Prioridade: P1**

## Objetivo

Permitir que membros recebam um certificado de conclusão em PDF ao completar 100% das aulas de um produto, aumentando o valor percebido da plataforma e incentivando a finalização dos cursos.

## Escopo

### Incluído

- Geração de certificado em PDF com dados do membro e do produto
- Template visual Netflix-style (dark theme, logo, data de conclusão)
- Download direto pelo membro na página do produto (botão aparece quando 100% concluído)
- Página admin para configurar template (habilitar/desabilitar certificado por produto)
- Validação de certificado via URL única com hash
- Armazenamento no Supabase Storage (`certificates/` bucket)

### Excluído

- Envio automático por email (futuro)
- Múltiplos templates por produto (futuro)
- Certificados parciais (ex: 50% concluído)

## Dependências Técnicas

| Dependência | Status | Detalhe |
|-------------|--------|---------|
| `lesson_progress` table | Existe | Tracking de progresso por aula |
| `products` table | Existe | Dados do produto para o certificado |
| `profiles` table | Existe | Nome do membro |
| PDF generation library | Novo | `@react-pdf/renderer` ou `jspdf` |
| Supabase Storage bucket | Novo | `certificates/` bucket |
| Nova tabela `certificates` | Novo | id, profile_id, product_id, certificate_url, issued_at, hash |

## Stories Previstas

| Story | Título | Estimativa |
|-------|--------|-----------|
| 14.1 | Schema e migration da tabela `certificates` | ~1h |
| 14.2 | API de geração de certificado PDF | ~3h |
| 14.3 | Botão de download no produto (membro) | ~2h |
| 14.4 | Configuração de certificado no admin | ~2h |
| 14.5 | Validação pública de certificado via hash | ~1h |

**Estimativa total:** ~9h

## Métricas de Sucesso

- Taxa de conclusão de cursos aumenta após lançamento
- % de membros que baixam o certificado
- Certificados validados externamente (compartilhamento)

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| PDF generation lento | Baixa | Médio | Gerar async, cachear no Storage |
| Template não responsivo | Baixa | Baixo | PDF é formato fixo (A4 landscape) |
