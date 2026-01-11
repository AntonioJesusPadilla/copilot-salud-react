import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';

describe('StatsCard', () => {
  const mockStats = [
    {
      label: 'Total Users',
      value: 1234,
      color: '#3b82f6',
      subtitle: 'Active users',
    },
    {
      label: 'Revenue',
      value: '$5,678',
      color: '#10b981',
    },
  ];

  it('should render title and icon', () => {
    render(<StatsCard title="User Statistics" icon="👥" stats={mockStats} />);

    expect(screen.getByText(/User Statistics/)).toBeInTheDocument();
    expect(screen.getByText(/👥/)).toBeInTheDocument();
  });

  it('should render all stats', () => {
    render(<StatsCard title="Statistics" icon="📊" stats={mockStats} />);

    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('1234')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$5,678')).toBeInTheDocument();
  });

  it('should render subtitles when provided', () => {
    render(<StatsCard title="Statistics" icon="📊" stats={mockStats} />);

    expect(screen.getByText('Active users')).toBeInTheDocument();
  });

  it('should apply custom colors to stat values', () => {
    const { container } = render(
      <StatsCard title="Statistics" icon="📊" stats={mockStats} />
    );

    const statValues = container.querySelectorAll('.text-2xl');
    expect(statValues[0]).toHaveStyle({ color: '#3b82f6' });
    expect(statValues[1]).toHaveStyle({ color: '#10b981' });
  });

  it('should render empty stats array', () => {
    render(<StatsCard title="Empty Stats" icon="📊" stats={[]} />);

    expect(screen.getByText(/Empty Stats/)).toBeInTheDocument();
  });

  it('should handle string values', () => {
    const stats = [{ label: 'Status', value: 'Active' }];
    render(<StatsCard title="Status" icon="✅" stats={stats} />);

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should have correct CSS classes for dark mode', () => {
    const { container } = render(
      <StatsCard title="Statistics" icon="📊" stats={mockStats} />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'dark:bg-gray-800');
  });
});
