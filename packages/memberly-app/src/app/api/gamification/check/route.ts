import { authenticateUser } from '@/lib/utils/auth-guard';
import { apiSuccess, apiError } from '@/lib/utils/api-response';
import { evaluateBadges } from '@/lib/gamification/badge-engine';

export async function POST() {
  const auth = await authenticateUser();
  if (!auth.ok) return auth.response;

  const { user } = auth.data;

  try {
    const unlocked = await evaluateBadges(user.id);
    return apiSuccess({ unlocked });
  } catch {
    return apiError('EVALUATION_ERROR', 'Erro ao avaliar badges', 500);
  }
}
