// === Banner State (client-side tracking) ===

export type BannerStatus = 'pending' | 'generating' | 'generated' | 'rejected' | 'failed';

export interface BannerState {
  status: BannerStatus;
  url: string | null;
}
