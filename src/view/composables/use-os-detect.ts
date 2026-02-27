import { ref } from 'vue';

function detectIsiOS(): boolean {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const isIOSUA =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    typeof (window as any).MSStream === 'undefined';
  const hasMultiTouch =
    'ontouchstart' in window ||
    (typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 1);
  return Boolean(isIOSUA && hasMultiTouch);
}

function detectIsMacOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.userAgent);
}

function detectIsAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android/.test(navigator.userAgent);
}

function detectIsWindows(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Win32|Win64|Windows|WinCE/.test(navigator.userAgent);
}

function detectIsLinux(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Linux/.test(navigator.userAgent) && !detectIsAndroid();
}

// SSR-safe: инициализируем false, обновляем на клиенте
export const isiOS = ref(false);
export const isMacOS = ref(false);
export const isAndroid = ref(false);
export const isWindows = ref(false);
export const isLinux = ref(false);

export const isMobileDevice = ref(false);
export const isDesktopDevice = ref(false);

let _detected = false;

export function initOsDetect() {
  if (_detected) return;
  _detected = true;

  isiOS.value = detectIsiOS();
  isMacOS.value = detectIsMacOS();
  isAndroid.value = detectIsAndroid();
  isWindows.value = detectIsWindows();
  isLinux.value = detectIsLinux();

  isMobileDevice.value = isiOS.value || isAndroid.value;
  isDesktopDevice.value = isMacOS.value || isWindows.value || isLinux.value;
}
