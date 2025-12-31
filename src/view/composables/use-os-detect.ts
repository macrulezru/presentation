import { ref } from 'vue';

let cachedIsiOS: boolean | undefined = undefined;
let cachedIsMacOS: boolean | undefined = undefined;
let cachedIsAndroid: boolean | undefined = undefined;
let cachedIsWindows: boolean | undefined = undefined;
let cachedIsLinux: boolean | undefined = undefined;

function detectIsiOS(): boolean {
  if (typeof cachedIsiOS === 'boolean') return cachedIsiOS;
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const isIOSUA =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    typeof (window as any).MSStream === 'undefined';
  // Дополнительная проверка multitouch
  const hasMultiTouch =
    'ontouchstart' in window ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  cachedIsiOS = Boolean(isIOSUA && hasMultiTouch);
  return cachedIsiOS;
}

function detectIsMacOS(): boolean {
  if (typeof cachedIsMacOS === 'boolean') return cachedIsMacOS;
  if (typeof navigator === 'undefined') return false;
  cachedIsMacOS = /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
  return cachedIsMacOS;
}

function detectIsAndroid(): boolean {
  if (typeof cachedIsAndroid === 'boolean') return cachedIsAndroid;
  if (typeof navigator === 'undefined') return false;
  cachedIsAndroid = /Android/.test(navigator.userAgent);
  return cachedIsAndroid;
}

function detectIsWindows(): boolean {
  if (typeof cachedIsWindows === 'boolean') return cachedIsWindows;
  if (typeof navigator === 'undefined') return false;
  cachedIsWindows = /Win32|Win64|Windows|WinCE/.test(navigator.userAgent);
  return cachedIsWindows;
}

function detectIsLinux(): boolean {
  if (typeof cachedIsLinux === 'boolean') return cachedIsLinux;
  if (typeof navigator === 'undefined') return false;
  // Linux, но не Android
  cachedIsLinux = /Linux/.test(navigator.userAgent) && !detectIsAndroid();
  return cachedIsLinux;
}

export const isiOS = ref(detectIsiOS());
export const isMacOS = ref(detectIsMacOS());
export const isAndroid = ref(detectIsAndroid());
export const isWindows = ref(detectIsWindows());
export const isLinux = ref(detectIsLinux());

export const isMobileDevice = ref(isiOS.value || isAndroid.value);
export const isDesktopDevice = ref(isMacOS.value || isWindows.value || isLinux.value);
