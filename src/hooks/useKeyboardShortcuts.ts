import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  target?: HTMLElement | Document;
}

const useKeyboardShortcuts = (
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) => {
  const { enabled = true, target = document } = options;
  const shortcutsRef = useRef(shortcuts);

  // Update shortcuts ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback(
    (event: Event) => {
      const keyboardEvent = event as KeyboardEvent;
      if (!enabled) return;

      const matchingShortcut = shortcutsRef.current.find((shortcut) => {
        const keyMatch =
          shortcut.key.toLowerCase() === keyboardEvent.key.toLowerCase() ||
          shortcut.key.toLowerCase() === keyboardEvent.code.toLowerCase();

        const ctrlMatch = (shortcut.ctrlKey ?? false) === keyboardEvent.ctrlKey;
        const shiftMatch =
          (shortcut.shiftKey ?? false) === keyboardEvent.shiftKey;
        const altMatch = (shortcut.altKey ?? false) === keyboardEvent.altKey;
        const metaMatch = (shortcut.metaKey ?? false) === keyboardEvent.metaKey;

        return keyMatch && ctrlMatch && shiftMatch && altMatch && metaMatch;
      });

      if (matchingShortcut) {
        if (matchingShortcut.preventDefault !== false) {
          event.preventDefault();
          event.stopPropagation();
        }
        matchingShortcut.action();
      }
    },
    [enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const targetElement = target as EventTarget;
    targetElement.addEventListener('keydown', handleKeyDown);

    return () => {
      targetElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled, target]);

  const getShortcutsList = useCallback(() => {
    return shortcuts.map((shortcut) => ({
      keys: [
        shortcut.ctrlKey && 'Ctrl',
        shortcut.metaKey && 'Cmd',
        shortcut.shiftKey && 'Shift',
        shortcut.altKey && 'Alt',
        shortcut.key,
      ]
        .filter(Boolean)
        .join(' + '),
      description: shortcut.description,
    }));
  }, [shortcuts]);

  return {
    getShortcutsList,
  };
};

export default useKeyboardShortcuts;
