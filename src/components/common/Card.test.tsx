import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Card from './Card';

describe('Card', () => {
  it('should render children', () => {
    render(
      <Card>
        <p>Card content</p>
      </Card>
    );

    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should render title and subtitle', () => {
    render(
      <Card title="Card Title" subtitle="Card Subtitle">
        Content
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Subtitle')).toBeInTheDocument();
  });

  it('should render footer when provided', () => {
    render(
      <Card footer={<div>Footer content</div>}>
        Content
      </Card>
    );

    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should render actions when provided', () => {
    render(
      <Card title="Title" actions={<button>Action</button>}>
        Content
      </Card>
    );

    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('should apply default variant styles', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('bg-white', 'dark:bg-gray-800');
  });

  it('should apply outlined variant styles', () => {
    const { container } = render(<Card variant="outlined">Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('bg-transparent', 'border-2');
  });

  it('should apply elevated variant styles', () => {
    const { container } = render(<Card variant="elevated">Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('shadow-lg', 'hover:shadow-xl');
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    const { container } = render(
      <Card onClick={handleClick}>
        Content
      </Card>
    );

    const card = container.firstChild as HTMLElement;
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply hover styles when hoverable', () => {
    const { container } = render(<Card hoverable>Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer', 'hover:scale-[1.02]');
  });

  it('should apply hover styles when onClick is provided', () => {
    const { container } = render(<Card onClick={() => {}}>Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('should apply custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class');
  });

  it('should apply custom headerClassName', () => {
    const { container } = render(
      <Card title="Title" headerClassName="custom-header">
        Content
      </Card>
    );

    const header = container.querySelector('.custom-header');
    expect(header).toBeInTheDocument();
  });

  it('should apply custom bodyClassName', () => {
    const { container } = render(
      <Card bodyClassName="custom-body">
        Content
      </Card>
    );

    const body = container.querySelector('.custom-body');
    expect(body).toBeInTheDocument();
  });

  it('should apply custom footerClassName', () => {
    const { container } = render(
      <Card footer={<div>Footer</div>} footerClassName="custom-footer">
        Content
      </Card>
    );

    const footer = container.querySelector('.custom-footer');
    expect(footer).toBeInTheDocument();
  });

  it('should not render header when no title, subtitle, or actions', () => {
    const { container } = render(<Card>Content</Card>);

    const header = container.querySelector('.border-b');
    expect(header).not.toBeInTheDocument();
  });

  it('should not render body when no children', () => {
    const { container } = render(<Card title="Title" />);

    // Solo debe existir el header, no el body
    const allPaddings = container.querySelectorAll('.px-6.py-4');
    expect(allPaddings.length).toBe(1); // Solo header
  });

  it('should not render footer when not provided', () => {
    const { container } = render(<Card>Content</Card>);

    const footer = container.querySelector('.border-t');
    expect(footer).not.toBeInTheDocument();
  });

  it('should have transition classes', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('transition-all', 'duration-200');
  });

  it('should have rounded corners', () => {
    const { container } = render(<Card>Content</Card>);

    const card = container.firstChild;
    expect(card).toHaveClass('rounded-lg');
  });
});
