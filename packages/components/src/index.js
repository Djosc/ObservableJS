/**
 * ObservableJS Components
 * 
 * UI components with built-in performance tracking for the ObservableJS framework.
 * 
 * @module observablejs/components
 * @version 0.1.0
 */

import { Component } from './component.js';
// Import renderer once implemented
// import { Renderer } from './renderer.js';

/**
 * Create a new component instance
 * @param {Object} options - Component options
 * @returns {Component} - Component instance
 */
function createComponent(options = {}) {
  return new Component(options);
}

/**
 * Mount a component to a DOM element
 * @param {Component} component - Component to mount
 * @param {HTMLElement|string} element - DOM element or selector
 * @returns {Promise<Component>} - Mounted component
 */
async function mount(component, element) {
  if (!(component instanceof Component)) {
    throw new Error('First argument must be a Component instance');
  }
  
  // Handle string selectors
  if (typeof element === 'string') {
    const domElement = document.querySelector(element);
    if (!domElement) {
      throw new Error(`Element not found: ${element}`);
    }
    element = domElement;
  }
  
  return component.mount(element);
}

/**
 * Create and immediately mount a component
 * @param {Object} options - Component options
 * @param {HTMLElement|string} element - DOM element or selector
 * @returns {Promise<Component>} - Mounted component
 */
async function render(options, element) {
  const component = createComponent(options);
  return mount(component, element);
}

// Export everything
export {
  // Core classes
  Component,
  // Renderer, // Uncomment when implemented
  
  // Helper functions
  createComponent,
  mount,
  render
};

// Export a default configuration
export default {
  Component,
  // Renderer, // Uncomment when implemented
  createComponent,
  mount,
  render
};