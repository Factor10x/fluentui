import { getDocument } from './getDocument';

export function getRootNode(rootElement?: HTMLElement | null): Document | ShadowRoot {
  const rootNode = rootElement?.getRootNode?.() ?? getDocument(rootElement);

  return rootNode as Document | ShadowRoot;
}
