import { getDocument } from './getDocument';

export function getActiveElement(document?: Document | ShadowRoot): Element | null {
  document ??= getDocument();

  if (document?.activeElement) {
    return document.activeElement.shadowRoot
      ? getActiveElement(document.activeElement.shadowRoot)
      : document.activeElement;
  }

  return null;
}
