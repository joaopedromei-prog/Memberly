# Integrate Gemini UI Reference

## Purpose

Integrar um componente visual gerado pelo Gemini 3.1 Pro (arquivo `.gemini.tsx`) no projeto brownfield. O `.gemini.tsx` é uma maquete em código — visualmente perfeita, mas com dados mockados e imports potencialmente incorretos. Esta task transforma a maquete em código de produção.

---

## Trigger

Esta task é ativada automaticamente quando:
- Existe um arquivo `*.gemini.tsx` em `src/components/` (qualquer subpasta)
- OU o desenvolvedor chama `*integrate-gemini-ui {component-path}`

---

## Execution Steps

### Step 1: Localizar o arquivo .gemini.tsx

Buscar em `packages/memberly-app/src/components/` por arquivos `*.gemini.tsx`.

Se não encontrar, perguntar ao usuário o path.

### Step 2: Analisar o .gemini.tsx

Ler o arquivo e identificar:
- Quais imports ele usa (e quais estão errados pro projeto)
- Quais dados estão mockados (hardcoded arrays, objetos fake)
- Quais componentes internos ele define (funções dentro do arquivo)
- Qual área do projeto ele pertence (admin, member, shared)

### Step 3: Mapear para código existente

| No .gemini.tsx | Substituir por |
|----------------|----------------|
| Dados mockados (arrays, objetos) | Queries Supabase reais (server component) ou props |
| `import { motion } from 'framer-motion'` | `import { motion } from 'motion/react'` |
| Tailwind v3 syntax (`bg-opacity-50`) | Tailwind v4 syntax (`bg-blue-500/50`) |
| Componentes UI inline | Componentes existentes em `src/components/ui/` se houver equivalente |
| `export default function App()` | `export default function {ProperName}()` |
| Inline SVG icons repetidos | Extrair ou usar ícones existentes do projeto |
| `import { LineChart } from 'recharts'` | Verificar se recharts está instalado, se não: `npm install recharts` |

### Step 4: Decompor em componentes

Se o .gemini.tsx tem mais de ~200 linhas, decompor:

1. Identificar seções visuais distintas (cards, charts, tables, lists)
2. Extrair cada seção como componente próprio em `src/components/{area}/`
3. Componentes com dados do servidor → ficam como server components ou recebem props
4. Componentes com interatividade (hover, click, state) → `'use client'`

**Convenção de nomes:**
- `src/components/admin/RecentWebhooks.tsx` (não `recent-webhooks.tsx`)
- `src/components/member/ContinueWatchingCard.tsx`
- PascalCase sempre

### Step 5: Conectar dados reais

Para cada bloco de dados mockados:

1. Verificar se já existe uma query similar no projeto (buscar em `app/` e `api/`)
2. Se existe: reutilizar
3. Se não existe: criar query no server component da page ou em API route
4. Passar dados via props para client components

**Padrão do projeto:**
```typescript
// Page (server component) → busca dados
export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from('...').select('...');
  return <ClientComponent data={data} />;
}
```

### Step 6: Ajustar estilos

1. Verificar se as cores do .gemini.tsx batem com `globals.css` / tema do projeto
2. Se o .gemini.tsx definiu cores customizadas boas → adicionar em `globals.css` via `@theme inline`
3. Manter consistência com componentes existentes (border-radius, shadows, spacing)
4. Testar responsividade nos 3 breakpoints

### Step 7: Limpar

1. Deletar o arquivo `.gemini.tsx` original
2. Verificar que não sobrou nenhum dado mockado no código final
3. Verificar que não sobrou nenhum `// TODO` ou comentário de placeholder

### Step 8: Validar

```bash
npm run typecheck   # 0 erros
npm run lint        # 0 erros  
npm run build       # build bem-sucedido
```

---

## Regras

- **O visual do .gemini.tsx é sagrado.** Não simplifique animações, não remova efeitos, não "limpe" o design. O objetivo é manter a qualidade visual exata e apenas trocar os internals.
- **Se um componente UI equivalente já existe no projeto** (Button, Card, Input), use o existente — não crie duplicata.
- **Se o .gemini.tsx traz algo visualmente superior** ao componente existente, atualize o existente.
- **Nunca deixe dados mockados no código final.** Se a query real ainda não é possível (falta tabela, falta API), use dados vazios com fallback visual ("Nenhum dado disponível").
- **Instale dependências se necessário** (recharts, etc.) mas evite adicionar libs que o .gemini.tsx usou sem necessidade (ex: se usou uma lib de ícones, prefira SVG inline).

---

## Uso

```
*integrate-gemini-ui                                          # Auto-detecta .gemini.tsx files
*integrate-gemini-ui src/components/admin/AdminDashboard.gemini.tsx   # Path específico
```

---

## Post-Conditions

```yaml
post-conditions:
  - [ ] Arquivo .gemini.tsx deletado
  - [ ] Componentes extraídos em arquivos próprios
  - [ ] Dados mockados substituídos por queries reais ou props
  - [ ] Imports corrigidos para o stack do projeto
  - [ ] Visual idêntico ao .gemini.tsx original
  - [ ] typecheck + lint + build passam
  - [ ] Nenhum dado hardcoded restante
```

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-12 | 1.0 | Task criada | Robin |
