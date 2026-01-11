import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  describe('Variants', () => {
    it('should render spinner variant by default', () => {
      const { container } = render(<LoadingSpinner />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('animate-spin');
    });

    it('should render dots variant', () => {
      const { container } = render(<LoadingSpinner variant="dots" />);

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots).toHaveLength(3);
    });

    it('should render pulse variant', () => {
      const { container } = render(<LoadingSpinner variant="pulse" />);

      const pulse = container.querySelector('.animate-pulse');
      expect(pulse).toBeInTheDocument();
    });

    it('should render ring variant', () => {
      const { container } = render(<LoadingSpinner variant="ring" />);

      const rings = container.querySelectorAll('.rounded-full');
      expect(rings.length).toBeGreaterThan(0);
    });
  });

  describe('Sizes', () => {
    it('should apply small size', () => {
      const { container } = render(<LoadingSpinner size="sm" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-4', 'h-4');
    });

    it('should apply medium size by default', () => {
      const { container } = render(<LoadingSpinner />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-8', 'h-8');
    });

    it('should apply large size', () => {
      const { container } = render(<LoadingSpinner size="lg" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-12', 'h-12');
    });

    it('should apply extra large size', () => {
      const { container } = render(<LoadingSpinner size="xl" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('w-16', 'h-16');
    });
  });

  describe('Text', () => {
    it('should render text when provided', () => {
      render(<LoadingSpinner text="Loading..." />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should not render text when not provided', () => {
      const { container } = render(<LoadingSpinner />);

      const text = container.querySelector('p');
      expect(text).not.toBeInTheDocument();
    });

    it('should apply correct text size for small spinner', () => {
      render(<LoadingSpinner size="sm" text="Loading..." />);

      const text = screen.getByText('Loading...');
      expect(text).toHaveClass('text-xs');
    });

    it('should apply correct text size for large spinner', () => {
      render(<LoadingSpinner size="lg" text="Loading..." />);

      const text = screen.getByText('Loading...');
      expect(text).toHaveClass('text-base');
    });
  });

  describe('Color', () => {
    it('should apply default color', () => {
      const { container } = render(<LoadingSpinner />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-primary');
    });

    it('should apply custom color', () => {
      const { container } = render(<LoadingSpinner color="text-blue-500" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveClass('text-blue-500');
    });

    it('should apply custom color to dots variant', () => {
      const { container } = render(<LoadingSpinner variant="dots" color="text-red-500" />);

      const dots = container.querySelectorAll('.bg-red-500');
      expect(dots.length).toBeGreaterThan(0);
    });
  });

  describe('Full Screen Mode', () => {
    it('should render fullscreen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should apply overlay in fullscreen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen overlay />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('backdrop-blur-sm');
    });

    it('should not apply overlay by default in fullscreen mode', () => {
      const { container } = render(<LoadingSpinner fullScreen />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('bg-white', 'dark:bg-gray-900');
    });
  });

  describe('Normal Mode', () => {
    it('should render normal mode by default', () => {
      const { container } = render(<LoadingSpinner />);

      const wrapper = container.firstChild;
      expect(wrapper).not.toHaveClass('fixed', 'inset-0');
      expect(wrapper).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have padding in normal mode', () => {
      const { container } = render(<LoadingSpinner />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('p-4');
    });
  });

  describe('Animation', () => {
    it('should have animation delay for dots variant', () => {
      const { container } = render(<LoadingSpinner variant="dots" />);

      const dots = container.querySelectorAll('.animate-bounce');
      expect(dots[0]).toHaveStyle({ animationDelay: '0s' });
      expect(dots[1]).toHaveStyle({ animationDelay: '0.15s' });
      expect(dots[2]).toHaveStyle({ animationDelay: '0.3s' });
    });
  });
});
