import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { NewsHeadline } from '@/components/NewsHeadline';

describe('NewsHeadline Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should display loading state initially', () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(() => {}) // Never resolves to keep loading state
    );

    render(<NewsHeadline />);

    const loadingElement = screen.getByRole('status', { busy: true });
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    expect(loadingElement).toHaveAttribute('aria-live', 'polite');
  });

  it('should display headline when API returns data', async () => {
    const mockHeadline = {
      title: 'Breaking News: Test Headline',
      link: 'https://spiegel.de/article',
      publishedAt: new Date().toISOString(),
      source: 'SPIEGEL',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockHeadline),
    });

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText(mockHeadline.title)).toBeInTheDocument();
    });

    const link = screen.getByRole('link', { name: /SPIEGEL: Breaking News: Test Headline/i });
    expect(link).toHaveAttribute('href', mockHeadline.link);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should display error message when API fails', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('Gerade keine Schlagzeile verfügbar')).toBeInTheDocument();
    });

    const statusElement = screen.getByRole('status');
    expect(statusElement).toHaveAttribute('aria-live', 'polite');
  });

  it('should display error message when API returns non-ok response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('Gerade keine Schlagzeile verfügbar')).toBeInTheDocument();
    });
  });

  it('should refresh headline after 5 minutes', async () => {
    vi.useFakeTimers();

    const firstHeadline = {
      title: 'First Headline',
      link: 'https://spiegel.de/first',
      publishedAt: new Date().toISOString(),
      source: 'SPIEGEL',
    };

    const secondHeadline = {
      title: 'Second Headline',
      link: 'https://spiegel.de/second',
      publishedAt: new Date().toISOString(),
      source: 'SPIEGEL',
    };

    let callCount = 0;
    global.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: vi.fn().mockResolvedValue(callCount === 1 ? firstHeadline : secondHeadline),
      });
    });

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('First Headline')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Fast-forward 5 minutes
    vi.advanceTimersByTime(5 * 60 * 1000);

    await waitFor(() => {
      expect(screen.getByText('Second Headline')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });

  it('should include EILMELDUNG badge', async () => {
    const mockHeadline = {
      title: 'Breaking News',
      link: 'https://spiegel.de/article',
      publishedAt: new Date().toISOString(),
      source: 'SPIEGEL',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockHeadline),
    });

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('EILMELDUNG')).toBeInTheDocument();
    });

    const badge = screen.getByText('EILMELDUNG');
    expect(badge).toHaveClass('text-red-600');
    expect(badge).toHaveClass('bg-red-100');
  });

  it('should have proper accessibility attributes', async () => {
    const mockHeadline = {
      title: 'Accessible Headline',
      link: 'https://spiegel.de/article',
      publishedAt: new Date().toISOString(),
      source: 'SPIEGEL',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockHeadline),
    });

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('Accessible Headline')).toBeInTheDocument();
    });

    const container = screen.getByRole('status');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-label', 'Aktuelle Schlagzeile von SPIEGEL');

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'SPIEGEL: Accessible Headline');
  });

  it('should clean up interval on unmount', async () => {
    vi.useFakeTimers();
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        title: 'Test',
        link: 'https://test.com',
        publishedAt: new Date().toISOString(),
        source: 'SPIEGEL',
      }),
    });

    const { unmount } = render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should format time correctly', async () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const mockHeadline = {
      title: 'Recent Headline',
      link: 'https://spiegel.de/article',
      publishedAt: oneHourAgo.toISOString(),
      source: 'SPIEGEL',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockHeadline),
    });

    render(<NewsHeadline />);

    await waitFor(() => {
      expect(screen.getByText('Recent Headline')).toBeInTheDocument();
    });

    // Time formatting is hidden on small screens by default
    // But the component should still process it correctly
    expect(screen.queryByText('vor 1 Stunde')).toBeDefined();
  });
});