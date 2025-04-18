/**
 * Computed - Create derived values with dependency tracking
 * 
 * Automatically updates when dependencies change and tracks
 * performance metrics for the computation.
 */

import { Observable } from './observable.js';
import { ObservabilitySystem } from './observability.js';

/**
 * Create a computed (derived) observable value
 * @param {Function} computeFn - Function that computes the derived value
 * @param {Array<Observable>} deps - Dependencies that trigger recomputation
 * @param {Object} options - Additional options
 * @returns {Observable} An observable with the computed value
 */
function computed(computeFn, deps = [], options = {}) {
  if (typeof computeFn !== 'function') {
    throw new Error('First argument must be a function');
  }
  
  if (!Array.isArray(deps)) {
    throw new Error('Dependencies must be an array');
  }
  
  const {
    lazy = false,  // If true, only compute on first read
    name = 'computed' // Name for debugging
  } = options;
  
  // Create a result observable
  const result = new Observable(undefined);
  result._computeName = name;
  
  // Track additional metrics for computed values
  result._computeMetrics = {
    totalComputations: 0,
    lastComputeTime: 0,
    averageComputeTime: 0,
    errors: 0
  };
  
  // Function to perform the computation
  const performComputation = () => {
    const computeStart = performance.now();
    result._computeMetrics.totalComputations++;
    
    try {
      // Perform the actual computation
      const newValue = computeFn();
      result.value = newValue;
      
      const computeEnd = performance.now();
      const thisComputeTime = computeEnd - computeStart;
      
      // Update compute metrics
      result._computeMetrics.lastComputeTime = thisComputeTime;
      result._computeMetrics.averageComputeTime = 
        (result._computeMetrics.averageComputeTime * (result._computeMetrics.totalComputations - 1) + thisComputeTime) / 
        result._computeMetrics.totalComputations;
      
      result._metrics.computeTime += thisComputeTime;
      ObservabilitySystem.recordMetric('derivedComputeTime', thisComputeTime);
      
      // Detect slow computations
      if (thisComputeTime > 10) { // More than 10ms is considered slow
        ObservabilitySystem.reportPerformanceIssue({
          type: 'slowComputation',
          name: result._computeName,
          computeTime: thisComputeTime,
          value: JSON.stringify(newValue).substring(0, 50) // Truncated preview
        });
      }
      
      return newValue;
    } catch (error) {
      result._computeMetrics.errors++;
      ObservabilitySystem.recordError('computeError', error, { 
        name: result._computeName,
        dependencies: deps.length
      });
      console.error(`Error in computed value "${name}":`, error);
      throw error;
    }
  };
  
  // Override getMetrics to include compute-specific metrics
  const originalGetMetrics = result.getMetrics;
  result.getMetrics = function() {
    return {
      ...originalGetMetrics.call(this),
      isComputed: true,
      name: this._computeName,
      compute: { ...this._computeMetrics }
    };
  };
  
  // Initial computation (unless lazy)
  if (!lazy) {
    try {
      const startTime = performance.now();
      performComputation();
      const endTime = performance.now();
      ObservabilitySystem.recordMetric('initialComputeTime', endTime - startTime);
    } catch (error) {
      // Initial computation failed, but we'll try again on dependencies change
      console.warn(`Initial computation of "${name}" failed:`, error);
    }
  }
  
  // Set up dependency tracking for automatic updates
  const unsubscribers = deps.map(dep => {
    if (!dep || typeof dep.subscribe !== 'function') {
      console.warn('Invalid dependency provided to computed value:', dep);
      return () => {};
    }
    
    return dep.subscribe(() => {
      try {
        performComputation();
      } catch (error) {
        // Already logged in performComputation
      }
    });
  });
  
  // Method to manually recompute
  result.recompute = performComputation;
  
  // Method to clean up subscriptions
  result.dispose = () => {
    unsubscribers.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
  };
  
  return result;
}

export { computed };