import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EditorToolbar from '../EditorToolbar';

describe('EditorToolbar', () => {
  const mockHandlers = {
    onFormat: vi.fn(),
    onMinify: vi.fn(),
    onValidate: vi.fn(),
    onSearch: vi.fn(),
    onSettings: vi.fn(),
    onSave: vi.fn(),
    onOpen: vi.fn(),
    onCopy: vi.fn(),
    onCut: vi.fn(),
    onPaste: vi.fn(),
    onUndo: vi.fn(),
    onRedo: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all toolbar buttons', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="light"
      />
    );

    // File operations
    expect(screen.getByTitle('Open file (Ctrl+O)')).toBeInTheDocument();
    expect(screen.getByTitle('Save file (Ctrl+S)')).toBeInTheDocument();

    // Edit operations
    expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeInTheDocument();
    expect(screen.getByTitle('Redo (Ctrl+Y)')).toBeInTheDocument();

    // Clipboard operations
    expect(screen.getByTitle('Cut (Ctrl+X)')).toBeInTheDocument();
    expect(screen.getByTitle('Copy (Ctrl+C)')).toBeInTheDocument();
    expect(screen.getByTitle('Paste (Ctrl+V)')).toBeInTheDocument();

    // JSON operations
    expect(screen.getByTitle('Format JSON (Alt+Shift+F)')).toBeInTheDocument();
    expect(screen.getByTitle('Minify JSON')).toBeInTheDocument();
    expect(screen.getByTitle('Validate JSON')).toBeInTheDocument();

    // Utility operations
    expect(screen.getByTitle('Find and Replace (Ctrl+F)')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('should call handlers when buttons are clicked', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="light"
      />
    );

    fireEvent.click(screen.getByTitle('Open file (Ctrl+O)'));
    expect(mockHandlers.onOpen).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Save file (Ctrl+S)'));
    expect(mockHandlers.onSave).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Undo (Ctrl+Z)'));
    expect(mockHandlers.onUndo).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Redo (Ctrl+Y)'));
    expect(mockHandlers.onRedo).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Cut (Ctrl+X)'));
    expect(mockHandlers.onCut).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Copy (Ctrl+C)'));
    expect(mockHandlers.onCopy).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Paste (Ctrl+V)'));
    expect(mockHandlers.onPaste).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Format JSON (Alt+Shift+F)'));
    expect(mockHandlers.onFormat).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Minify JSON'));
    expect(mockHandlers.onMinify).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Validate JSON'));
    expect(mockHandlers.onValidate).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Find and Replace (Ctrl+F)'));
    expect(mockHandlers.onSearch).toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Settings'));
    expect(mockHandlers.onSettings).toHaveBeenCalled();
  });

  it('should disable undo button when canUndo is false', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={false}
        canRedo={true}
        isValid={true}
        theme="light"
      />
    );

    const undoButton = screen.getByTitle('Undo (Ctrl+Z)');
    expect(undoButton).toBeDisabled();
    expect(undoButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should disable redo button when canRedo is false', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={false}
        isValid={true}
        theme="light"
      />
    );

    const redoButton = screen.getByTitle('Redo (Ctrl+Y)');
    expect(redoButton).toBeDisabled();
    expect(redoButton).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should show validation indicator when JSON is invalid', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={false}
        theme="light"
      />
    );

    const validateButton = screen.getByTitle('Validate JSON');
    // Should have a red dot indicator for invalid JSON
    const indicator = validateButton.querySelector('.bg-red-500');
    expect(indicator).toBeInTheDocument();
  });

  it('should not show validation indicator when JSON is valid', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="light"
      />
    );

    const validateButton = screen.getByTitle('Validate JSON');
    // Should not have a red dot indicator for valid JSON
    const indicator = validateButton.querySelector('.bg-red-500');
    expect(indicator).not.toBeInTheDocument();
  });

  it('should disable all buttons when disabled prop is true', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="light"
        disabled={true}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  it('should apply dark theme styles', () => {
    const { container } = render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="dark"
      />
    );

    const toolbar = container.firstChild as HTMLElement;
    expect(toolbar).toHaveClass('bg-gray-800', 'border-gray-700');
  });

  it('should apply light theme styles', () => {
    const { container } = render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="light"
      />
    );

    const toolbar = container.firstChild as HTMLElement;
    expect(toolbar).toHaveClass('bg-white', 'border-gray-200');
  });

  it('should not call handlers when buttons are disabled', () => {
    render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={false}
        canRedo={false}
        isValid={true}
        theme="light"
      />
    );

    fireEvent.click(screen.getByTitle('Undo (Ctrl+Z)'));
    expect(mockHandlers.onUndo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle('Redo (Ctrl+Y)'));
    expect(mockHandlers.onRedo).not.toHaveBeenCalled();
  });

  it('should show separators between button groups', () => {
    const { container } = render(
      <EditorToolbar
        {...mockHandlers}
        canUndo={true}
        canRedo={true}
        isValid={true}
        theme="light"
      />
    );

    // Should have separator divs
    const separators = container.querySelectorAll('.w-px.h-6');
    expect(separators.length).toBeGreaterThan(0);
  });
});