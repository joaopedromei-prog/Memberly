import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// Motion props to strip from rendered elements
const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap',
  'whileInView', 'viewport', 'layoutId', 'variants', 'whileFocus', 'whileDrag',
  'drag', 'dragConstraints', 'onDragStart', 'onDragEnd', 'layout',
]);

function stripMotionProps(props: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(props)) {
    if (!MOTION_PROPS.has(key)) {
      clean[key] = props[key];
    }
  }
  return clean;
}

// Mock motion/react — render as plain elements in tests
vi.mock('motion/react', () => {
  const handler: ProxyHandler<object> = {
    get(_target, prop: string) {
      const MotionComponent = (props: Record<string, unknown>) =>
        React.createElement(prop, stripMotionProps(props));
      MotionComponent.displayName = `motion.${prop}`;
      return MotionComponent;
    },
  };
  const motion = new Proxy({}, handler);
  const AnimatePresence = ({ children }: { children: React.ReactNode }) => children;
  AnimatePresence.displayName = 'AnimatePresence';
  const useReducedMotion = () => false;
  return { motion, AnimatePresence, useReducedMotion };
});

// Mock window.matchMedia for jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
