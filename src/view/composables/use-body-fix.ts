import { onUnmounted } from 'vue';

const BODY_LOCK_CLASS = 'body-locked';
const BODY_LOCK_PADDING_ATTR = 'data-body-lock-padding';

export function bodyLock() {
  if (typeof document === 'undefined') return;
  const { body } = document;

  if (body.classList.contains(BODY_LOCK_CLASS)) return;

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    body.setAttribute(BODY_LOCK_PADDING_ATTR, body.style.paddingRight || '');
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
  body.classList.add(BODY_LOCK_CLASS);
}

export function bodyUnlock() {
  if (typeof document === 'undefined') return;
  const { body } = document;
  body.classList.remove(BODY_LOCK_CLASS);

  if (body.hasAttribute(BODY_LOCK_PADDING_ATTR)) {
    body.style.paddingRight = body.getAttribute(BODY_LOCK_PADDING_ATTR) || '';
    body.removeAttribute(BODY_LOCK_PADDING_ATTR);
  }
}

export function useBodyFixAutoUnlock() {
  onUnmounted(() => {
    bodyUnlock();
  });
}
