/**
 * ObservableJS Core
 * 
 * A reactive JavaScript framework with built-in observability
 * for monitoring application performance.
 * 
 * @module observablejs/core
 * @version 0.1.0
 */

import { Observable } from './observable.js';
import { computed } from './computed.js';
import { ObservabilitySystem } from './observability.js';

/**
 * Create a new reactive value
 * @param {any} initialValue - Initial value
 * @returns {Observable} - Observable instance
 */
function createObservable(initialValue) {
  return new Observable(initialValue);
}

/**
 * Configure the observability system
 * @param {Object} options - Configuration options
 */
function configure(options = {}) {
  ObservabilitySystem.configure(options);
}

/**
 * Start collecting periodic metrics
 * @param {number} interval - Collection interval in ms
 * @returns {Function} - Function to stop collection
 */
function startMonitoring(interval = 5000) {
  return ObservabilitySystem.startPeriodicCollection(interval);
}

/**
 * Get current performance metrics
 * @param {boolean} detailed - Include detailed metrics
 * @returns {Object} - Metrics data
 */
function getMetrics(detailed = false) {
  return ObservabilitySystem.getMetrics(detailed);
}

/**
 * Find performance hotspots
 * @returns {Object} - Analysis of performance hotspots
 */
function findHotspots() {
  return ObservabilitySystem.findHotspots();
}

/**
 * Reset all metrics
 */
function resetMetrics() {
  ObservabilitySystem.resetMetrics();
}

/**
 * Export metrics in Prometheus format
 * @returns {string} - Metrics in Prometheus format
 */
function exportMetrics() {
  return ObservabilitySystem.exportToPrometheus();
}

// Export everything
export {
  // Core classes
  Observable,
  computed,
  ObservabilitySystem,
  
  // Helper functions
  createObservable,
  configure,
  startMonitoring,
  getMetrics,
  findHotspots,
  resetMetrics,
  exportMetrics
};

// Export a default configuration
export default {
  Observable,
  computed,
  ObservabilitySystem,
  createObservable,
  configure,
  startMonitoring,
  getMetrics,
  findHotspots,
  resetMetrics,
  exportMetrics,
  
  // Initialize with sensible defaults
  init(options = {}) {
    const defaultOptions = {
      isDetailedMode: process.env.NODE_ENV !== 'production',
      samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1
    };
    
    configure({ ...defaultOptions, ...options });
    return startMonitoring();
  }
};
