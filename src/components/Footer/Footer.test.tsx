import { render, screen } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import { Footer } from './Footer';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Footer component', () => {
  const { location } = window;
  beforeAll(() => {
    // @ts-ignore
    delete window.location;
    // @ts-ignore
    window.location = { href: '' };
  });

  afterAll((): void => {
    // @ts-ignore
    window.location = location;
  });
  it('should render copyright', () => {
    render(<Footer />);
    const element = screen.getByText('© 2021 @hellomuthu23 · © 2026 Roland Foerther');
    expect(element).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
