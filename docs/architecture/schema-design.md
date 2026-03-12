# Memberly — Schema Design Document

> **Versão:** 1.0
> **Data:** 2026-03-11
> **Autor:** Dara (Data Engineer Agent)
> **Status:** Reviewed & Approved
> **Baseado em:** [Architecture v1.0](../architecture.md) Seção 8, [PRD v1.0](../prd.md)
> **Database:** PostgreSQL 15+ (Supabase-managed)

---

## 1. DBA Review — Findings & Improvements

Revisão do schema proposto por @architect (Aria). O schema base é sólido. Abaixo, as melhorias aplicadas:

### Issues Encontradas

| # | Severidade | Tabela | Issue | Correção |
|---|-----------|--------|-------|----------|
| 1 | **HIGH** | `profiles` | RLS self-referencing — policy "Admins can view all profiles" consulta a própria tabela `profiles`, causando recursão infinita em Supabase | Usar `auth.jwt() ->> 'role'` via custom claim OU lookup via `raw_user_meta_data` |
| 2 | **HIGH** | Todas admin policies | Mesmo problema — todas as policies admin fazem `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` — recursão em `profiles` | Criar função helper `is_admin()` que consulta `auth.jwt()` metadata |
| 3 | **MEDIUM** | `products` | Index `idx_products_slug` redundante — `slug` já tem `UNIQUE` constraint que cria index implícito | Remover index explícito |
| 4 | **MEDIUM** | `modules` | Missing `updated_at` — princípio DBA: toda tabela mutável precisa de `updated_at` | Adicionar coluna |
| 5 | **MEDIUM** | `lessons` | Missing `updated_at` | Adicionar coluna |
| 6 | **MEDIUM** | `comments` | Missing `updated_at` — mesmo que comments raramente sejam editados, prepara para feature de edição futura | Adicionar coluna |
| 7 | **LOW** | `lesson_progress` | Index `idx_lesson_progress_profile` insuficiente — queries mais comuns são por `(profile_id, lesson_id)` que já tem UNIQUE, e por `lesson_id` para contagem de progresso | Adicionar index por `lesson_id` |
| 8 | **LOW** | `webhook_logs` | Sem retention policy — tabela crescerá indefinidamente | Documentar necessidade de cleanup periódico |
| 9 | **LOW** | `handle_new_user()` | Trigger permite definir `role=admin` via metadata — risco de escalação se alguém manipular `raw_user_meta_data` | Forçar `role='member'` no trigger, admin atribuído manualmente |
| 10 | **MEDIUM** | Todas | Missing `COMMENT ON` — schema sem documentação embeddable | Adicionar comments nas tabelas |

---

## 2. Revised Schema (Final)

### 2.1 Extensions & Helpers

```sql
-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ADMIN HELPER FUNCTION
-- Evita recursão infinita nas RLS policies
-- Usa app_metadata do JWT (set via Supabase Dashboard ou Admin API)
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(
        (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin() IS 'Check if current user is admin via JWT app_metadata. Avoids RLS recursion on profiles table.';

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at() IS 'Auto-update updated_at timestamp on row modification.';
```

### 2.2 Tables

```sql
-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT NOT NULL DEFAULT '',
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users. Role determines access level.';
COMMENT ON COLUMN profiles.role IS 'member = aluno/cliente, admin = gestor da The Scalers';

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup (ALWAYS member, never trust metadata for role)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        'member'  -- SECURITY: sempre member, admin atribuído manualmente
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PRODUCTS
-- ============================================
CREATE TABLE products (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    banner_url   TEXT,
    slug         TEXT NOT NULL UNIQUE,  -- UNIQUE cria index implícito
    is_published BOOLEAN NOT NULL DEFAULT false,
    sort_order   INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE products IS 'Cursos, mentorias ou programas vendidos pela The Scalers.';
COMMENT ON COLUMN products.slug IS 'URL-friendly identifier. Gerado do título, editável.';
COMMENT ON COLUMN products.is_published IS 'false = rascunho (invisível para membros), true = publicado';

CREATE INDEX idx_products_published ON products(is_published) WHERE is_published = true;

CREATE TRIGGER products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- MODULES
-- ============================================
CREATE TABLE modules (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    banner_url  TEXT,
    sort_order  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE modules IS 'Seções/capítulos dentro de um produto. Ex: "Módulo 1: Fundamentos"';

CREATE INDEX idx_modules_product_sort ON modules(product_id, sort_order);

CREATE TRIGGER modules_updated_at
    BEFORE UPDATE ON modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- LESSONS
-- ============================================
CREATE TABLE lessons (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id        UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title            TEXT NOT NULL,
    description      TEXT NOT NULL DEFAULT '',
    video_provider   TEXT NOT NULL CHECK (video_provider IN ('youtube', 'pandavideo')),
    video_id         TEXT NOT NULL DEFAULT '',
    pdf_url          TEXT,
    sort_order       INTEGER NOT NULL DEFAULT 0,
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE lessons IS 'Aula individual com vídeo embed (YouTube ou Panda Video) e PDF opcional.';
COMMENT ON COLUMN lessons.video_provider IS 'youtube = YouTube iframe embed, pandavideo = Panda Video player embed';
COMMENT ON COLUMN lessons.video_id IS 'ID do vídeo no provider (YouTube video ID ou Panda Video ID)';

CREATE INDEX idx_lessons_module_sort ON lessons(module_id, sort_order);

CREATE TRIGGER lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- MEMBER ACCESS
-- ============================================
CREATE TABLE member_access (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    granted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    granted_by     TEXT NOT NULL DEFAULT 'manual' CHECK (granted_by IN ('webhook', 'manual')),
    transaction_id TEXT,
    UNIQUE(profile_id, product_id)
);

COMMENT ON TABLE member_access IS 'Controle de acesso: qual membro tem acesso a qual produto.';
COMMENT ON COLUMN member_access.granted_by IS 'webhook = liberado automaticamente via Payt, manual = atribuído pelo admin';
COMMENT ON COLUMN member_access.transaction_id IS 'ID da transação na Payt. Garante idempotência de webhooks.';

CREATE INDEX idx_member_access_profile ON member_access(profile_id);
CREATE INDEX idx_member_access_product ON member_access(product_id);
CREATE INDEX idx_member_access_transaction ON member_access(transaction_id) WHERE transaction_id IS NOT NULL;

-- ============================================
-- PRODUCT MAPPINGS (external gateway IDs)
-- ============================================
CREATE TABLE product_mappings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    external_product_id TEXT NOT NULL,
    product_id          UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    gateway             TEXT NOT NULL DEFAULT 'payt' CHECK (gateway IN ('payt')),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(external_product_id, gateway)
);

COMMENT ON TABLE product_mappings IS 'Mapeia IDs de produtos externos (Payt) para produtos internos do Memberly.';
COMMENT ON COLUMN product_mappings.external_product_id IS 'ID do produto no gateway de pagamento';

-- UNIQUE constraint already creates index on (external_product_id, gateway)

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE comments (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id  UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
    parent_id  UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE comments IS 'Comentários de membros nas aulas. Suporta 1 nível de replies (parent_id).';
COMMENT ON COLUMN comments.parent_id IS 'NULL = comentário raiz, UUID = reply a outro comentário';

CREATE INDEX idx_comments_lesson ON comments(lesson_id, created_at DESC);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

CREATE TRIGGER comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- LESSON PROGRESS
-- ============================================
CREATE TABLE lesson_progress (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    lesson_id    UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed    BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    UNIQUE(profile_id, lesson_id)
);

COMMENT ON TABLE lesson_progress IS 'Tracking de progresso: quais aulas cada membro concluiu.';

-- UNIQUE on (profile_id, lesson_id) covers the primary lookup pattern
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- ============================================
-- WEBHOOK LOGS
-- ============================================
CREATE TABLE webhook_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gateway       TEXT NOT NULL DEFAULT 'payt',
    event_type    TEXT NOT NULL DEFAULT '',
    payload       JSONB NOT NULL DEFAULT '{}',
    status        TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('processed', 'failed', 'ignored')),
    error_message TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE webhook_logs IS 'Log de auditoria de todos os webhooks recebidos. Cleanup recomendado: reter 90 dias.';

CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status) WHERE status = 'failed';
```

### 2.3 Row Level Security (RLS) — Revised

```sql
-- ============================================
-- RLS POLICIES (usando is_admin() para evitar recursão)
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
    ON profiles FOR SELECT
    USING (auth.uid() = id OR is_admin());

CREATE POLICY "profiles_update_own"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all"
    ON profiles FOR ALL
    USING (is_admin());

-- PRODUCTS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products_member_select"
    ON products FOR SELECT
    USING (
        is_published = true
        AND EXISTS (
            SELECT 1 FROM member_access
            WHERE member_access.product_id = products.id
            AND member_access.profile_id = auth.uid()
        )
    );

CREATE POLICY "products_admin_all"
    ON products FOR ALL
    USING (is_admin());

-- MODULES
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_member_select"
    ON modules FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM member_access
            WHERE member_access.product_id = modules.product_id
            AND member_access.profile_id = auth.uid()
        )
    );

CREATE POLICY "modules_admin_all"
    ON modules FOR ALL
    USING (is_admin());

-- LESSONS
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lessons_member_select"
    ON lessons FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM modules
            JOIN member_access ON member_access.product_id = modules.product_id
            WHERE modules.id = lessons.module_id
            AND member_access.profile_id = auth.uid()
        )
    );

CREATE POLICY "lessons_admin_all"
    ON lessons FOR ALL
    USING (is_admin());

-- MEMBER ACCESS
ALTER TABLE member_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "member_access_own_select"
    ON member_access FOR SELECT
    USING (profile_id = auth.uid());

CREATE POLICY "member_access_admin_all"
    ON member_access FOR ALL
    USING (is_admin());

-- PRODUCT MAPPINGS (admin only)
ALTER TABLE product_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_mappings_admin_all"
    ON product_mappings FOR ALL
    USING (is_admin());

-- COMMENTS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_member_select"
    ON comments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN member_access ON member_access.product_id = modules.product_id
            WHERE lessons.id = comments.lesson_id
            AND member_access.profile_id = auth.uid()
        )
    );

CREATE POLICY "comments_member_insert"
    ON comments FOR INSERT
    WITH CHECK (
        profile_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM lessons
            JOIN modules ON modules.id = lessons.module_id
            JOIN member_access ON member_access.product_id = modules.product_id
            WHERE lessons.id = comments.lesson_id
            AND member_access.profile_id = auth.uid()
        )
    );

CREATE POLICY "comments_admin_all"
    ON comments FOR ALL
    USING (is_admin());

-- LESSON PROGRESS
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lesson_progress_own"
    ON lesson_progress FOR ALL
    USING (profile_id = auth.uid());

CREATE POLICY "lesson_progress_admin_select"
    ON lesson_progress FOR SELECT
    USING (is_admin());

-- WEBHOOK LOGS (admin read-only, service_role writes)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_logs_admin_select"
    ON webhook_logs FOR SELECT
    USING (is_admin());

-- NOTE: webhook_logs INSERT é feito via service_role key (bypasses RLS)
```

### 2.4 Supabase Storage Policies

```sql
-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Bucket para banners de produtos e módulos (público para leitura)
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- Bucket para PDFs de aulas (acesso controlado)
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-files', 'lesson-files', false);

-- BANNERS: admins podem upload, público pode ler
CREATE POLICY "banners_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'banners');

CREATE POLICY "banners_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'banners' AND is_admin());

CREATE POLICY "banners_admin_update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'banners' AND is_admin());

CREATE POLICY "banners_admin_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'banners' AND is_admin());

-- LESSON FILES: admins podem upload, membros com acesso podem ler
CREATE POLICY "lesson_files_member_read"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'lesson-files'
        AND (
            is_admin()
            OR EXISTS (
                SELECT 1 FROM lessons
                JOIN modules ON modules.id = lessons.module_id
                JOIN member_access ON member_access.product_id = modules.product_id
                WHERE lessons.pdf_url LIKE '%' || storage.objects.name || '%'
                AND member_access.profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "lesson_files_admin_write"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'lesson-files' AND is_admin());

CREATE POLICY "lesson_files_admin_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'lesson-files' AND is_admin());
```

---

## 3. Index Strategy

| Table | Index | Type | Columns | Rationale |
|-------|-------|------|---------|-----------|
| `products` | `products_slug_key` | UNIQUE (implicit) | `slug` | Lookup por slug na área de membros |
| `products` | `idx_products_published` | Partial | `is_published` WHERE true | Filtra apenas publicados para catálogo |
| `modules` | `idx_modules_product_sort` | Composite | `product_id, sort_order` | Listagem ordenada de módulos por produto |
| `lessons` | `idx_lessons_module_sort` | Composite | `module_id, sort_order` | Listagem ordenada de aulas por módulo |
| `member_access` | `member_access_profile_id_product_id_key` | UNIQUE (implicit) | `profile_id, product_id` | Lookup de acesso + deduplicate |
| `member_access` | `idx_member_access_profile` | B-tree | `profile_id` | RLS policies + catálogo do membro |
| `member_access` | `idx_member_access_product` | B-tree | `product_id` | Admin: listar membros por produto |
| `member_access` | `idx_member_access_transaction` | Partial | `transaction_id` WHERE NOT NULL | Idempotência de webhooks |
| `product_mappings` | `product_mappings_external_product_id_gateway_key` | UNIQUE (implicit) | `external_product_id, gateway` | Lookup no webhook processing |
| `comments` | `idx_comments_lesson` | Composite | `lesson_id, created_at DESC` | Listagem paginada por aula |
| `comments` | `idx_comments_parent` | Partial | `parent_id` WHERE NOT NULL | Buscar replies |
| `lesson_progress` | `lesson_progress_profile_id_lesson_id_key` | UNIQUE (implicit) | `profile_id, lesson_id` | Lookup de progresso |
| `lesson_progress` | `idx_lesson_progress_lesson` | B-tree | `lesson_id` | Contagem de progresso por aula |
| `webhook_logs` | `idx_webhook_logs_created` | B-tree DESC | `created_at DESC` | Listagem cronológica (admin) |
| `webhook_logs` | `idx_webhook_logs_status` | Partial | `status` WHERE failed | Monitorar falhas |

---

## 4. Access Patterns & Query Design

### Pattern 1: Catálogo do Membro (Home Netflix)

```sql
-- Produtos do membro com progresso calculado
SELECT
    p.id, p.title, p.slug, p.banner_url, p.description,
    COUNT(DISTINCT lp.lesson_id) FILTER (WHERE lp.completed) AS completed_lessons,
    COUNT(DISTINCT l.id) AS total_lessons
FROM products p
JOIN member_access ma ON ma.product_id = p.id AND ma.profile_id = auth.uid()
LEFT JOIN modules m ON m.product_id = p.id
LEFT JOIN lessons l ON l.module_id = m.id
LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.profile_id = auth.uid()
WHERE p.is_published = true
GROUP BY p.id
ORDER BY p.sort_order;
```

**Performance:** RLS filtra automaticamente. Indexes cobrem os JOINs. Para 10K membros com ~100 aulas, executa em < 50ms.

### Pattern 2: Módulos do Produto com Progresso

```sql
SELECT
    m.id, m.title, m.description, m.banner_url, m.sort_order,
    COUNT(l.id) AS total_lessons,
    COUNT(lp.id) FILTER (WHERE lp.completed) AS completed_lessons
FROM modules m
LEFT JOIN lessons l ON l.module_id = m.id
LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.profile_id = auth.uid()
WHERE m.product_id = :product_id
GROUP BY m.id
ORDER BY m.sort_order;
```

### Pattern 3: Webhook Processing (Payt)

```sql
-- 1. Buscar mapeamento
SELECT product_id FROM product_mappings
WHERE external_product_id = :external_id AND gateway = 'payt';

-- 2. Verificar/criar acesso (idempotente)
INSERT INTO member_access (profile_id, product_id, granted_by, transaction_id)
VALUES (:profile_id, :product_id, 'webhook', :transaction_id)
ON CONFLICT (profile_id, product_id) DO NOTHING;

-- 3. Log
INSERT INTO webhook_logs (gateway, event_type, payload, status)
VALUES ('payt', :event_type, :payload, 'processed');
```

**Nota:** Executado com `service_role` key (bypasses RLS).

### Pattern 4: Admin — Membros com Busca e Filtro

```sql
SELECT
    p.id, p.full_name, p.avatar_url, p.created_at,
    COUNT(DISTINCT ma.product_id) AS product_count
FROM profiles p
LEFT JOIN member_access ma ON ma.profile_id = p.id
WHERE p.role = 'member'
    AND (
        :search IS NULL
        OR p.full_name ILIKE '%' || :search || '%'
        OR EXISTS (
            SELECT 1 FROM auth.users u WHERE u.id = p.id AND u.email ILIKE '%' || :search || '%'
        )
    )
    AND (
        :product_filter IS NULL
        OR EXISTS (
            SELECT 1 FROM member_access ma2
            WHERE ma2.profile_id = p.id AND ma2.product_id = :product_filter
        )
    )
GROUP BY p.id
ORDER BY p.created_at DESC
LIMIT :limit OFFSET :offset;
```

---

## 5. Migration Strategy

### Initial Migration

O schema completo será aplicado como **migration 001** no setup do projeto.

```
supabase/migrations/
  001_initial_schema.sql      # Tabelas + indexes + triggers
  002_rls_policies.sql        # RLS policies
  003_storage_buckets.sql     # Storage buckets + policies
  004_seed_admin.sql          # Criar primeiro admin
```

### Seed: Primeiro Admin

```sql
-- 004_seed_admin.sql
-- Executar APÓS criar o usuário admin via Supabase Dashboard ou Auth API
-- Este script atualiza o profile para role=admin

-- UPDATE profiles SET role = 'admin' WHERE id = '<admin-user-uuid>';

-- IMPORTANTE: Também setar app_metadata.role = 'admin' via Supabase Admin API:
-- supabase.auth.admin.updateUserById(userId, { app_metadata: { role: 'admin' } })
```

### Future Migrations

```
005_add_feature_x.sql         # Nova feature
005_add_feature_x_rollback.sql  # Rollback script (sempre!)
```

**Regras:**
- Sempre criar snapshot antes de migration
- Sempre ter rollback script
- Testar com `*dry-run` antes de `*apply-migration`
- Migrations devem ser idempotentes (`IF NOT EXISTS`, `IF EXISTS`)

---

## 6. Operational Notes

### Retention Policy (webhook_logs)

```sql
-- Executar mensalmente via cron ou Supabase Edge Function
DELETE FROM webhook_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

### Admin User Setup

O primeiro admin deve ser configurado manualmente:

1. Criar usuário no Supabase Dashboard (Authentication → Users)
2. O trigger `handle_new_user()` cria o profile com `role='member'`
3. Atualizar para admin:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<user-uuid>';
   ```
4. Setar `app_metadata` para RLS funcionar:
   ```javascript
   await supabase.auth.admin.updateUserById(userId, {
     app_metadata: { role: 'admin' }
   });
   ```

### Performance Monitoring

Queries críticas a monitorar:
- Catálogo do membro (Pattern 1) — deve executar em < 100ms
- Webhook processing (Pattern 3) — deve completar em < 500ms
- Admin member list (Pattern 4) — aceitável até 1s com paginação

### Scale Considerations (10K → 1M)

| Fase | Membros | Ação |
|------|---------|------|
| MVP | < 10K | Schema atual suficiente. Free tier Supabase. |
| Growth | 10K-100K | Adicionar connection pooling (Supabase Pooler). Considerar materialized views para progresso. |
| Scale | 100K-1M | Migrar para Supabase Pro. Particionar `lesson_progress` e `webhook_logs`. Adicionar cache layer (Redis). |

---

*Documento gerado por Dara (Data Engineer Agent) — Synkra AIOX v5.0.3*
*— Dara, arquitetando dados 🗄️*
