/**
 * Configuration for a single button in the button group
 */
export interface ButtonConfig {
  id: string; // Unique identifier for the button
  label: string; // Button text (can contain HTML)
  action: () => void; // Function called on click
  disabled?: boolean; // Button disabled state (optional)
  class?: string; // Additional CSS classes (optional)
  mode?: 'row' | 'column'; // Local mode override (optional)
  title?: string; // Tooltip text (optional)
  divider?: boolean; // Display divider after button (optional)
  active?: boolean; // Button active state (optional)
}

/**
 * Props for ui-button-group component
 */
export interface Props {
  buttons: ButtonConfig[]; // Array of button configurations (required)
  mode?: 'row' | 'column'; // Display mode: 'row' or 'column' (default: 'row')
  border?: boolean; // Display outer border (default: true)
  radius?: number; // Border radius in pixels (default: 4)
  theme?: string; // Color theme identifier (default: 'light'). Can be 'light', 'dark', or custom theme ID
  size?: 'sm' | 'md' | 'lg'; // Button size: 'sm', 'md', or 'lg' (default: 'md')
  ariaLabel?: string; // Accessible label for the button group (optional)
}
