/**
 * Observable - Core reactive primitive with built-in instrumentation
 * 
 * Creates a reactive value that notifies subscribers when changed
 * and automatically collects performance metrics.
 */

// Import the central observability system
import { ObservabilitySystem } from './observability.js';

class Observable {
  /**
   * Create a new observable value
   * @param {any} initialValue - The initial value
   */
  constructor(initialValue) {
    this._value = initialValue;
    this._subscribers = new Set();
    this._metrics = {
      reads: 0,
      writes: 0,
      subscriptions: 0,
      computeTime: 0,
      lastAccessed: Date.now(),
      history: []
    };
    
    // Register this observable with the global metrics collector
    this._id = ObservabilitySystem.register(this);
  }
  
  /**
   * Get the current value
   * @returns {any} The current value
   */
  get value() {
    // Instrument the read operation
    const startTime = performance.now();
    this._metrics.reads++;
    this._metrics.lastAccessed = Date.now();
    
    // Record the stack trace to understand where this read is happening
    if (ObservabilitySystem.isDetailedMode) {
      const stack = new Error().stack;
      this._metrics.history.push({
        type: 'read',
        timestamp: Date.now(),
        stack: stack
      });
    }
    
    const value = this._value;
    const endTime = performance.now();
    ObservabilitySystem.recordMetric('readTime', endTime - startTime);
    
    return value;
  }
  
  /**
   * Set a new value and notify subscribers
   * @param {any} newValue - The new value
   */
  set value(newValue) {
    const startTime = performance.now();
    this._metrics.writes++;
    
    // Record the stack trace to understand where this write is happening
    if (ObservabilitySystem.isDetailedMode) {
      const stack = new Error().stack;
      this._metrics.history.push({
        type: 'write',
        timestamp: Date.now(),
        oldValue: this._value,
        newValue: newValue,
        stack: stack
      });
    }
    
    // Only notify if the value has actually changed
    // This prevents unnecessary updates
    if (!Object.is(this._value, newValue)) {
      this._value = newValue;
      
      // Notify subscribers
      const updateStartTime = performance.now();
      this._subscribers.forEach(subscriber => {
        try {
          subscriber(newValue);
        } catch (error) {
          console.error('Error in subscriber:', error);
          ObservabilitySystem.recordError('subscriberError', error);
        }
      });
      const updateEndTime = performance.now();
      
      ObservabilitySystem.recordMetric('updateTime', updateEndTime - updateStartTime);
      ObservabilitySystem.recordMetric('subscriberCount', this._subscribers.size);
    }
    
    const endTime = performance.now();
    ObservabilitySystem.recordMetric('writeTime', endTime - startTime);
  }
  
  /**
   * Subscribe to value changes
   * @param {function} callback - Function to call when value changes
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Subscriber must be a function');
    }
    
    this._metrics.subscriptions++;
    this._subscribers.add(callback);
    
    // Return unsubscribe function
    return () => {
      this._subscribers.delete(callback);
      this._metrics.subscriptions--;
    };
  }
  
  /**
   * Get performance metrics for this observable
   * @returns {Object} Metrics data
   */
  getMetrics() {
    return { 
      id: this._id,
      value: JSON.stringify(this._value).substring(0, 100), // Truncate for large values
      ...this._metrics 
    };
  }
  
  /**
   * Explicitly set value without triggering reactivity
   * For initialization or resetting purposes
   * @param {any} value - The new value to set
   */
  silentSet(value) {
    this._value = value;
  }
}

export { Observable };