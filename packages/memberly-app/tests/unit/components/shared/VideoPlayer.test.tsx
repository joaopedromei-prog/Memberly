import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { VideoPlayer } from '@/components/shared/VideoPlayer';

let intersectionCallback: IntersectionObserverCallback;

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

function triggerIntersection() {
  act(() => {
    intersectionCallback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver
    );
  });
}

describe('VideoPlayer', () => {
  it('renders YouTube iframe with correct src after intersection', () => {
    render(<VideoPlayer provider="youtube" videoId="dQw4w9WgXcQ" />);
    triggerIntersection();

    const iframe = screen.getByTitle('Video player - youtube');
    expect(iframe).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1'
    );
  });

  it('renders Panda Video iframe with correct src after intersection', () => {
    render(
      <VideoPlayer
        provider="pandavideo"
        videoId="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      />
    );
    triggerIntersection();

    const iframe = screen.getByTitle('Video player - pandavideo');
    expect(iframe).toHaveAttribute(
      'src',
      'https://player-vz-a1b2c3d4.tv.pandavideo.com.br/embed/?v=a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    );
  });

  it('has aspect-video class for 16:9 ratio', () => {
    const { container } = render(
      <VideoPlayer provider="youtube" videoId="dQw4w9WgXcQ" />
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('aspect-video');
  });

  it('shows placeholder when videoId is empty', () => {
    render(<VideoPlayer provider="youtube" videoId="" />);
    expect(screen.getByText('Nenhum vídeo selecionado')).toBeInTheDocument();
  });

  it('uses custom title when provided', () => {
    render(<VideoPlayer provider="youtube" videoId="dQw4w9WgXcQ" title="Aula 1" />);
    triggerIntersection();

    const iframe = screen.getByTitle('Aula 1');
    expect(iframe).toBeInTheDocument();
  });

  it('shows loading spinner before iframe loads', () => {
    const { container } = render(
      <VideoPlayer provider="youtube" videoId="dQw4w9WgXcQ" />
    );

    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('has sandbox attribute on iframe for security', () => {
    render(<VideoPlayer provider="youtube" videoId="dQw4w9WgXcQ" />);
    triggerIntersection();

    const iframe = screen.getByTitle('Video player - youtube');
    expect(iframe).toHaveAttribute('sandbox');
    expect(iframe.getAttribute('sandbox')).toContain('allow-scripts');
    expect(iframe.getAttribute('sandbox')).toContain('allow-same-origin');
  });
});
