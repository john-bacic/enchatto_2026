"use client";

import { Component, type ReactNode } from "react";

/**
 * Draws `fallback` in place of its children from the moment one of them throws while it is drawn, for as long as
 * the page stands. The room page puts it around the message list that reads a room's reactions in one query:
 * convex/react throws a query the server refused where it is asked, and the conversation then stands as
 * `fallback`, the list whose bubbles each ask for their own message's reactions.
 */
export class ReactionsFallback extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
