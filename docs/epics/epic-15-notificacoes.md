# Epic 14 — Notificações

> **Fase 3 — Diferenciação | Prioridade: P2**

## Objetivo

Implementar sistema de notificações in-app para engajar membros com atualizações relevantes (nova aula disponível, resposta a comentário, progresso de curso), mantendo-os ativos na plataforma.

## Escopo

### Incluído

- Notificações in-app (bell icon no header com badge de contagem)
- Dropdown/painel de notificações com lista scrollable
- Tipos de notificação:
  - **Nova aula:** Quando admin publica nova lesson em produto que o membro tem acesso
  - **Novo comentário:** Quando alguém responde ao comentário do membro
  - **Curso concluído:** Parabéns ao atingir 100% (trigger para certificado)
- Marcar como lida (individual e "marcar todas")
- Página de notificações completa (`/notifications`)
- Admin: toggle para habilitar/desabilitar tipos de notificação por produto

### Excluído

- Notificações por email (futuro — Epic separado)
- Push notifications mobile (futuro)
- Notificações em tempo real via WebSocket (usar polling ou Supabase Realtime)
- Notificações para admins (foco no membro)

## Dependências Técnicas

| Dependência | Status | Detalhe |
|-------------|--------|---------|
| `profiles` table | Existe | Destinatário |
| `lessons` table | Existe | Trigger de nova aula |
| `comments` table | Existe | Trigger de resposta |
| `lesson_progress` table | Existe | Trigger de conclusão |
| `member_access` table | Existe | Filtrar membros com acesso |
| Nova tabela `notifications` | Novo | id, profile_id, type, title, body, read, data (jsonb), created_at |
| Nova tabela `notification_preferences` | Novo | profile_id, type, enabled |
| Supabase Realtime (opcional) | Disponível | Subscribe em `notifications` table |

## Stories Previstas

| Story | Título | Estimativa |
|-------|--------|-----------|
| 14.1 | Schema: tabelas `notifications` e `notification_preferences` + RLS | ~2h |
| 14.2 | API de notificações (CRUD + marcar como lida) | ~2h |
| 14.3 | Serviço de criação de notificações (triggers) | ~3h |
| 14.4 | UI: Bell icon + dropdown no header do membro | ~3h |
| 14.5 | Página `/notifications` com lista completa | ~2h |
| 14.6 | Admin: configuração de notificações por produto | ~2h |

**Estimativa total:** ~14h

## Métricas de Sucesso

- % de membros que interagem com notificações
- Aumento de retorno à plataforma (DAU/MAU)
- Redução do tempo entre publicação de aula e primeiro acesso

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Volume alto de notificações | Média | Médio | Rate limit por tipo, batch insert |
| Polling performance | Baixa | Médio | Supabase Realtime como upgrade path |
| Notification spam | Média | Alto | Preferências por tipo, throttling |
