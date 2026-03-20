# Epic 15 — Gamificação

> **Fase 3 — Diferenciação | Prioridade: P3**

## Objetivo

Implementar sistema de gamificação com badges, streaks e indicadores de progresso para aumentar a retenção de membros e incentivar o engajamento contínuo com o conteúdo.

## Escopo

### Incluído

- **Badges/conquistas:** Concedidos automaticamente por ações (primeira aula, curso completo, streak de 7 dias, 10 comentários, etc.)
- **Streaks:** Contador de dias consecutivos com pelo menos 1 aula assistida
- **Perfil de conquistas:** Seção no perfil do membro exibindo badges obtidos
- **Indicadores visuais:** Badge icons com animação ao desbloquear, streak counter no dashboard
- **Admin:** Gerenciamento de badges (criar, editar, ativar/desativar)
- **Notificação integrada:** Trigger de notificação ao desbloquear badge (usa Epic 14)

### Excluído

- Leaderboard/ranking entre membros (futuro — questões de privacidade)
- Pontos/moedas virtuais (complexidade desnecessária no MVP)
- Recompensas externas (cupons, descontos)
- Gamificação customizada por produto (global primeiro)

## Dependências Técnicas

| Dependência | Status | Detalhe |
|-------------|--------|---------|
| `lesson_progress` table | Existe | Fonte de dados para streaks e badges |
| `comments` table | Existe | Trigger para badge de engajamento |
| `notifications` (Epic 14) | Depende | Notificar ao desbloquear badge |
| Nova tabela `badges` | Novo | id, name, description, icon_url, criteria (jsonb), active |
| Nova tabela `member_badges` | Novo | profile_id, badge_id, unlocked_at |
| Nova tabela `streaks` | Novo | profile_id, current_streak, longest_streak, last_activity_date |
| Badge icons/assets | Novo | SVG icons para cada badge |

## Stories Previstas

| Story | Título | Estimativa |
|-------|--------|-----------|
| 15.1 | Schema: tabelas `badges`, `member_badges`, `streaks` + RLS | ~2h |
| 15.2 | Engine de badges: serviço de avaliação de critérios | ~4h |
| 15.3 | Streak tracker: cron/trigger para atualizar streaks diários | ~3h |
| 15.4 | API de gamificação (badges do membro, streak, unlock) | ~2h |
| 15.5 | UI membro: seção de conquistas no perfil | ~3h |
| 15.6 | UI membro: streak counter no dashboard | ~2h |
| 15.7 | Admin: CRUD de badges com ícones | ~3h |
| 15.8 | Integração com notificações (Epic 14) | ~1h |

**Estimativa total:** ~20h

## Badges Iniciais (Seed Data)

| Badge | Critério | Ícone |
|-------|---------|-------|
| Primeiro Passo | Completar 1ª aula | 🎯 |
| Maratonista | Completar 1 curso inteiro | 🏆 |
| Streak 7 | 7 dias consecutivos | 🔥 |
| Streak 30 | 30 dias consecutivos | ⚡ |
| Comentarista | 10 comentários | 💬 |
| Explorador | Acessar 3 produtos diferentes | 🧭 |
| Dedicado | 50 aulas completadas | 📚 |

## Métricas de Sucesso

- Aumento na taxa de conclusão de cursos
- Aumento no streak médio (dias consecutivos)
- % de membros com pelo menos 1 badge
- Correlação entre badges desbloqueados e retenção

## Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Badge engine performance | Média | Médio | Avaliar apenas em eventos relevantes, não polling |
| Critérios complexos demais | Baixa | Médio | Começar com critérios simples (contagem) |
| Dependência do Epic 14 | Alta | Baixo | Notificação é opcional, badge funciona sem |
| Streak timezone issues | Média | Médio | Usar UTC, converter no client |
