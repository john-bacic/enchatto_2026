import { vi } from "vitest";

// A stand-in for a browser, for a test that mounts a page with react-dom/client and lets it live: a document
// React can build the page in, run its effects in and draw it again in, which the test can read and tap. Nothing
// is laid out, painted, loaded or played, and it holds only what the room page asks of a browser while it shows a
// conversation. `installBrowser` puts it in place with vi.stubGlobal, so vi.unstubAllGlobals takes it away again.
// A test file that uses it runs in vitest's node environment (`// @vitest-environment node` on its first line).

/** An event as the page is handed it: what React's listeners and the page's own read of one */
interface SimEvent {
  type: string;
  target: Sim;
  defaultPrevented: boolean;
  preventDefault(): void;
  stopPropagation(): void;
  // What an event of its kind carries besides: a key press its key
  [field: string]: unknown;
}

type Listener = (event: SimEvent) => void;

/** A style object: `style.color = …` for a property, setProperty for a custom one (`--chat-scale`) */
function makeStyle(): Record<string, unknown> {
  const style: Record<string, unknown> = {};
  Object.defineProperty(style, "setProperty", { value: (name: string, value: string) => void (style[name] = value) });
  return style;
}

/** A node of the document: an element, a text, or the document itself */
export class Sim {
  nodeType: number;
  nodeName: string;
  namespaceURI: string | null;
  ownerDocument: SimDocument | null;
  parentNode: Sim | null = null;
  childNodes: Sim[] = [];
  nodeValue: string | null = null;
  attributes: Record<string, string> = {};
  style = makeStyle();
  private listeners: { type: string; listener: Listener; capture: boolean }[] = [];
  // React and the page keep what they like on a node as plain properties (value, checked, onclick, scrollHeight)
  [key: string]: unknown;

  constructor(nodeType: number, name: string, ownerDocument: SimDocument | null, namespaceURI = "http://www.w3.org/1999/xhtml") {
    this.nodeType = nodeType;
    this.nodeName = nodeType === 1 ? name.toUpperCase() : name;
    this.namespaceURI = nodeType === 1 ? namespaceURI : null;
    this.ownerDocument = ownerDocument;
  }

  get tagName() { return this.nodeType === 1 ? this.nodeName : undefined; }
  get firstChild() { return this.childNodes[0] ?? null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] ?? null; }
  /** An input's kind, which React reads as a property */
  get type() { return this.attributes.type; }
  /** A select's options, which React reads to mark the chosen one */
  get options() { return this.all((n) => n.nodeName === "OPTION"); }

  get textContent(): string {
    return this.nodeType === 3 ? (this.nodeValue ?? "") : this.childNodes.map((n) => n.textContent).join("");
  }
  set textContent(text: string) {
    for (const child of this.childNodes) child.parentNode = null;
    this.childNodes = [];
    if (text) this.appendChild(this.ownerDocument!.createTextNode(text));
  }

  appendChild(child: Sim) { return this.insertBefore(child, null); }
  insertBefore(child: Sim, before: Sim | null) {
    child.parentNode?.removeChild(child);
    child.parentNode = this;
    const at = before ? this.childNodes.indexOf(before) : -1;
    this.childNodes.splice(at < 0 ? this.childNodes.length : at, 0, child);
    return child;
  }
  removeChild(child: Sim) {
    this.childNodes = this.childNodes.filter((n) => n !== child);
    child.parentNode = null;
    return child;
  }

  setAttribute(name: string, value: string) { this.attributes[name] = String(value); }
  removeAttribute(name: string) { delete this.attributes[name]; }

  addEventListener(type: string, listener: Listener, options?: boolean | { capture?: boolean }) {
    this.removeEventListener(type, listener, options);
    this.listeners.push({ type, listener, capture: isCapture(options) });
  }
  removeEventListener(type: string, listener: Listener, options?: boolean | { capture?: boolean }) {
    const capture = isCapture(options);
    this.listeners = this.listeners.filter((l) => !(l.type === type && l.listener === listener && l.capture === capture));
  }

  // What the page asks of an element, with nothing behind it
  focus() {}
  blur() {}
  scrollIntoView() {}
  querySelector() { return null; }

  // ─── For a test ────────────────────────────────────────────────────────────

  /** Every element under this one that passes `test`, in the document's order */
  all(test: (node: Sim) => boolean): Sim[] {
    const found: Sim[] = [];
    const walk = (node: Sim) => {
      for (const child of node.childNodes) {
        if (child.nodeType === 1 && test(child)) found.push(child);
        walk(child);
      }
    };
    walk(this);
    return found;
  }
  /** Whether the element's class attribute names `name` */
  hasClass(name: string) { return (this.attributes.class ?? "").split(" ").includes(name); }
  /** Every element under this one with the class `name` */
  byClass(name: string) { return this.all((n) => n.hasClass(name)); }

  /**
   * Hands the page an event on this node as a browser does: down the document to it, then back up. React listens
   * where it mounted the page, and on the body for what a sheet put there. `fields` is what the event carries
   * besides: `{ key: "Enter" }` for that key going down.
   */
  fire(type: string, fields: Record<string, unknown> = {}) {
    const path: Sim[] = [];
    for (let node: Sim | null = this; node; node = node.parentNode) path.push(node);
    let stopped = false;
    const event: SimEvent = {
      ...fields,
      type,
      target: this,
      defaultPrevented: false,
      preventDefault: () => void (event.defaultPrevented = true),
      stopPropagation: () => void (stopped = true),
    };
    const heard = (node: Sim, capture: boolean) => {
      for (const l of [...node.listeners]) if (!stopped && l.type === type && l.capture === capture) l.listener(event);
    };
    for (const node of [...path].reverse()) heard(node, true);
    for (const node of path) heard(node, false);
  }
}

const isCapture = (options?: boolean | { capture?: boolean }) => (typeof options === "boolean" ? options : !!options?.capture);

export class SimDocument extends Sim {
  documentElement: Sim;
  body: Sim;
  hidden = false;
  // React asks the document whether this browser sends "input" for a keystroke, and listens for it if so
  oninput = null;

  constructor() {
    super(9, "#document", null);
    this.documentElement = this.appendChild(this.createElement("html"));
    this.body = this.documentElement.appendChild(this.createElement("body"));
  }
  createElement(tag: string) { return new Sim(1, tag, this); }
  createElementNS(namespace: string, tag: string) { return new Sim(1, tag, this, namespace); }
  createTextNode(text: string) {
    const node = new Sim(3, "#text", this);
    node.nodeValue = text;
    return node;
  }
}

/** A voice clip's player. It starts and stops at once, as a clip that had loaded would, and plays nothing */
class SimAudio {
  paused = true;
  currentTime = 0;
  duration = NaN;
  onplay: (() => void) | null = null;
  onpause: (() => void) | null = null;
  play() {
    this.paused = false;
    this.onplay?.();
    return Promise.resolve();
  }
  pause() {
    if (this.paused) return;
    this.paused = true;
    this.onpause?.();
  }
  removeAttribute() {}
}

class SimStorage {
  private kept = new Map<string, string>();
  getItem(key: string) { return this.kept.get(key) ?? null; }
  setItem(key: string, value: string) { this.kept.set(key, String(value)); }
}

export interface SimBrowser {
  document: SimDocument;
  /** Whether the network is up. The page hears of a change through `fireOnWindow` */
  navigator: { onLine: boolean };
  /** Hands the page an event on the window: "online", "offline" */
  fireOnWindow(type: string): void;
}

/**
 * Puts a browser in place: an empty document, storage that holds nothing, the network up. Call it before
 * react-dom is imported, which looks for a document when it loads.
 */
export function installBrowser(): SimBrowser {
  const document = new SimDocument();
  // The window's own listeners (online, offline, pagehide) are kept on a node that stands nowhere
  const windowEvents = new Sim(1, "window", null);
  const navigator = { onLine: true, userAgent: "vitest" };
  const globals: Record<string, unknown> = {
    window: globalThis,
    document,
    navigator,
    localStorage: new SimStorage(),
    sessionStorage: new SimStorage(),
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    removeEventListener: windowEvents.removeEventListener.bind(windowEvents),
    // React asks whether the focused element is a frame
    HTMLIFrameElement: class {},
    ResizeObserver: class {
      observe() {}
      disconnect() {}
    },
    requestAnimationFrame: (callback: () => void) => setTimeout(callback, 16),
    cancelAnimationFrame: (id: ReturnType<typeof setTimeout>) => clearTimeout(id),
    Audio: SimAudio,
    // React.act flushes what a test starts only where this says a test is running
    IS_REACT_ACT_ENVIRONMENT: true,
  };
  for (const [name, value] of Object.entries(globals)) vi.stubGlobal(name, value);
  return { document, navigator, fireOnWindow: (type) => windowEvents.fire(type) };
}
