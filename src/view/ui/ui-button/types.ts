/**
 * Props for ui-button component
 */
export interface Props {
  label?: string; // Button text (optional if using slot)
  disabled?: boolean; // Button disabled state (optional, default: false)
  title?: string; // Tooltip text (optional)
  active?: boolean; // Button active state (optional, default: false)
  focused?: boolean; // Button focused state (optional, default: false)
  size?: 'sm' | 'md' | 'lg'; // Button size (optional, default: 'md')
  ariaDisabled?: boolean; // ARIA disabled state (optional)
}

/**
 * Emits for ui-button component
 */
export interface Emits {
  (e: 'click', event: MouseEvent): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'keydown', event: KeyboardEvent): void;
}
