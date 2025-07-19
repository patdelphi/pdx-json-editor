import { render, screen } from '@testing-library/preact';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('renders children correctly', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('PDX JSON Editor')).toBeInTheDocument();
  });

  it('has correct structure', () => {
    render(
      <AppLayout>
        <div>Test Content</div>
      </AppLayout>
    );

    // Check for header
    expect(screen.getByRole('banner')).toBeInTheDocument();
    
    // Check for main content area
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Check for footer/status bar
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});