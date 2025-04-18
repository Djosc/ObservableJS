/**
 * Component - Base class for UI components with built-in performance tracking
 * 
 * Automatically measures render times and update frequencies
 * to help identify performance bottlenecks.
 */

import { ObservabilitySystem } from '@observablejs/core';

class Component {
  /**
   * Create a new component
   * @param {Object} props - Component properties
   */
  constructor(props = {}) {
    this.props = { ...props };
    this.state = {};
    this._renderId = 0;
    this._mounted = false;
    this._element = null;
    this._subscriptions = [];
    
    this._metrics = {
      renders: 0,
      renderTime: 0,
      lastRenderTime: 0,
      updates: 0,
      updateTime: 0,
      createdAt: Date.now(),
      mountedAt: null
    };
    
    // Register with observability system
    this._id = ObservabilitySystem.registerComponent(this);
  }
  
  /**
   * Update component state and trigger re-render
   * @param {Object} newState - Partial state to update
   * @returns {Promise} - Resolves after render completes
   */
  setState(newState) {
    const updateStart = performance.now();
    this._metrics.updates++;
    
    // Merge new state with existing state
    this.state = { ...this.state, ...newState };
    
    // Schedule re-render
    const renderPromise = this.render();
    
    const updateEnd = performance.now();
    this._metrics.updateTime += (updateEnd - updateStart);
    ObservabilitySystem.recordMetric('componentUpdateTime', updateEnd - updateStart, {
      component: this.constructor.name,
      id: this._id
    });
    
    return renderPromise;
  }
  
  /**
   * Render the component
   * @returns {Promise} - Resolves after render completes
   */
  async render() {
    const renderStart = performance.now();
    this._renderId++;
    this._metrics.renders++;
    
    try {
      // Component-specific render logic would be implemented by subclasses
      // This is just the base tracking functionality
      
      const renderEnd = performance.now();
      const thisRenderTime = renderEnd - renderStart;
      this._metrics.renderTime += thisRenderTime;
      this._metrics.lastRenderTime = thisRenderTime;
      
      ObservabilitySystem.recordMetric('componentRenderTime', thisRenderTime, {
        component: this.constructor.name,
        renderId: this._renderId,
        id: this._id
      });
      
      // Report slow renders
      if (thisRenderTime > 16) { // Longer than one frame (60fps)
        ObservabilitySystem.reportPerformanceIssue({
          type: 'slowRender',
          component: this.constructor.name,
          renderTime: thisRenderTime,
          renderId: this._renderId,
          id: this._id
        });
        
        ObservabilitySystem._metrics.global.slowRenders++;
      }
      
      return Promise.resolve(null);
    } catch (error) {
      ObservabilitySystem.recordError('renderError', error, {
        component: this.constructor.name,
        id: this._id
      });
      console.error(`Error rendering component ${this.constructor.name}:`, error);
      return Promise.reject(error);
    }
  }
  
  /**
   * Mount component to DOM
   * @param {HTMLElement} element - Element to mount to
   * @returns {Promise} - Resolves after mount completes
   */
  async mount(element) {
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error('Mount requires a valid HTML element');
    }
    
    const mountStart = performance.now();
    this._element = element;
    
    try {
      await this.render();
      this._mounted = true;
      this._metrics.mountedAt = Date.now();
      
      const mountEnd = performance.now();
      ObservabilitySystem.recordMetric('componentMountTime', mountEnd - mountStart, {
        component: this.constructor.name,
        id: this._id
      });
      
      return this;
    } catch (error) {
      ObservabilitySystem.recordError('mountError', error, {
        component: this.constructor.name,
        id: this._id
      });
      console.error(`Error mounting component ${this.constructor.name}:`, error);
      throw error;
    }
  }
  
  /**
   * Unmount and clean up component
   */
  unmount() {
    if (!this._mounted) return;
    
    // Clean up subscriptions
    this._subscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('Error unsubscribing:', error);
        }
      }
    });
    
    this._subscriptions = [];
    this._mounted = false;
    
    // Clear DOM references
    if (this._element) {
      this._element.innerHTML = '';
      this._element = null;
    }
  }
  
  /**
   * Subscribe to an observable and automatically clean up on unmount
   * @param {Observable} observable - Observable to subscribe to
   * @param {Function} callback - Subscription callback
   * @returns {Function} - Unsubscribe function
   */
  subscribe(observable, callback) {
    if (!observable || typeof observable.subscribe !== 'function') {
      console.warn('Invalid observable provided to subscribe');
      return () => {};
    }
    
    const unsubscribe = observable.subscribe(callback);
    this._subscriptions.push(unsubscribe);
    return unsubscribe;
  }
  
  /**
   * Get performance metrics for this component
   * @returns {Object} - Metrics data
   */
  getMetrics() {
    return {
      id: this._id,
      component: this.constructor.name,
      mounted: this._mounted,
      ...this._metrics
    };
  }
}

export { Component };