/**
 * Observability System - Central monitoring hub
 * 
 * Collects and analyzes performance metrics from all parts of the application.
 * Provides tools for identifying performance bottlenecks and visualizing metrics.
 */

// Unique ID generator
let nextId = 1;
function generateId(prefix = 'obs') {
  return `${prefix}_${nextId++}`;
}

/**
 * The central observability system that collects and analyzes metrics
 */
const ObservabilitySystem = {
  _observables: new Map(),
  _components: new Map(),
  _metrics: {
    global: {
      totalReads: 0,
      totalWrites: 0,
      totalRenders: 0,
      slowRenders: 0,
      memoryUsage: [],
      performanceIssues: [],
      errors: []
    },
    detailed: {}
  },
  
  // Configuration
  isDetailedMode: false, // Toggle for production vs development
  samplingRate: 1, // 1 = track everything, 0.1 = track 10% of operations
  maxHistoryItems: 1000, // Maximum number of history items to keep
  maxIssues: 100, // Maximum number of performance issues to track
  maxErrors: 50, // Maximum number of errors to track
  
  /**
   * Register an observable with the system
   * @param {Object} observable - The observable to register
   * @returns {string} ID for the observable
   */
  register(observable) {
    const id = generateId('obs');
    this._observables.set(id, observable);
    return id;
  },
  
  /**
   * Register a component with the system
   * @param {Object} component - The component to register
   * @returns {string} ID for the component
   */
  registerComponent(component) {
    const id = generateId('comp');
    this._components.set(id, component);
    return id;
  },
  
  /**
   * Record a metric value
   * @param {string} name - Metric name
   * @param {number} value - Metric value
   * @param {Object} tags - Additional tags for the metric
   */
  recordMetric(name, value, tags = {}) {
    // Sample based on sampling rate to reduce overhead
    if (Math.random() > this.samplingRate) return;
    
    if (!this._metrics.detailed[name]) {
      this._metrics.detailed[name] = [];
    }
    
    this._metrics.detailed[name].push({
      value,
      timestamp: Date.now(),
      ...tags
    });
    
    // Trim metrics if they get too large
    if (this._metrics.detailed[name].length > this.maxHistoryItems) {
      this._metrics.detailed[name] = this._metrics.detailed[name].slice(-this.maxHistoryItems);
    }
  },
  
  /**
   * Record an error
   * @param {string} type - Error type
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  recordError(type, error, context = {}) {
    this._metrics.global.errors.push({
      type,
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now()
    });
    
    // Trim errors if they get too large
    if (this._metrics.global.errors.length > this.maxErrors) {
      this._metrics.global.errors = this._metrics.global.errors.slice(-this.maxErrors);
    }
  },
  
  /**
   * Report a performance issue
   * @param {Object} issue - Performance issue details
   */
  reportPerformanceIssue(issue) {
    const fullIssue = {
      ...issue,
      timestamp: Date.now()
    };
    
    this._metrics.global.performanceIssues.push(fullIssue);
    
    // Trim issues if they get too large
    if (this._metrics.global.performanceIssues.length > this.maxIssues) {
      this._metrics.global.performanceIssues = this._metrics.global.performanceIssues.slice(-this.maxIssues);
    }
    
    // Log warning if in development mode
    if (this.isDetailedMode) {
      console.warn('Performance issue detected:', fullIssue);
    }
  },
  
  /**
   * Start collecting periodic metrics
   * @param {number} interval - Collection interval in ms
   */
  startPeriodicCollection(interval = 5000) {
    // Only start if we're in a browser environment
    if (typeof window === 'undefined') return;
    
    // Collect memory usage periodically
    const timerId = setInterval(() => {
      // Collect memory metrics if available
      if (window.performance && performance.memory) {
        this._metrics.global.memoryUsage.push({
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          timestamp: Date.now()
        });
        
        // Trim memory metrics if they get too large
        if (this._metrics.global.memoryUsage.length > this.maxHistoryItems) {
          this._metrics.global.memoryUsage = this._metrics.global.memoryUsage.slice(-this.maxHistoryItems);
        }
      }
      
      // Update global counters
      this.updateGlobalCounters();
    }, interval);
    
    return () => clearInterval(timerId);
  },
  
  /**
   * Update the global counter metrics
   */
  updateGlobalCounters() {
    let totalReads = 0;
    let totalWrites = 0;
    let totalRenders = 0;
    
    this._observables.forEach(obs => {
      try {
        const metrics = obs.getMetrics();
        totalReads += metrics.reads || 0;
        totalWrites += metrics.writes || 0;
      } catch (error) {
        this.recordError('metricsError', error);
      }
    });
    
    this._components.forEach(comp => {
      try {
        const metrics = comp.getMetrics();
        totalRenders += metrics.renders || 0;
      } catch (error) {
        this.recordError('metricsError', error);
      }
    });
    
    this._metrics.global.totalReads = totalReads;
    this._metrics.global.totalWrites = totalWrites;
    this._metrics.global.totalRenders = totalRenders;
  },
  
  /**
   * Get all collected metrics
   * @param {boolean} includeDetailed - Include detailed metrics
   * @returns {Object} Metrics data
   */
  getMetrics(includeDetailed = false) {
    // Update global counters before returning
    this.updateGlobalCounters();
    
    return {
      global: { ...this._metrics.global },
      detailed: (includeDetailed || this.isDetailedMode) ? { ...this._metrics.detailed } : null
    };
  },
  
  /**
   * Identify performance hotspots
   * @returns {Object} Analysis of performance hotspots
   */
  findHotspots() {
    // Identify components that render too frequently
    const hotComponents = [];
    this._components.forEach((comp, id) => {
      try {
        const metrics = comp.getMetrics();
        if (metrics.renders > 10 && metrics.lastRenderTime > 10) {
          hotComponents.push({
            id,
            component: comp.constructor.name,
            renders: metrics.renders,
            averageRenderTime: metrics.renderTime / metrics.renders,
            lastRenderTime: metrics.lastRenderTime
          });
        }
      } catch (error) {
        this.recordError('hotspotAnalysisError', error);
      }
    });
    
    // Identify observables that change too frequently
    const hotObservables = [];
    this._observables.forEach((obs, id) => {
      try {
        const metrics = obs.getMetrics();
        if (metrics.writes > 20) {
          hotObservables.push({
            id,
            writes: metrics.writes,
            reads: metrics.reads,
            subscribers: metrics.subscriptions,
            // Show a preview of the value for debugging
            value: typeof metrics.value === 'string' ? metrics.value : JSON.stringify(metrics.value).substring(0, 50)
          });
        }
      } catch (error) {
        this.recordError('hotspotAnalysisError', error);
      }
    });
    
    return {
      hotComponents: hotComponents
        .sort((a, b) => (b.renders * b.averageRenderTime) - (a.renders * a.averageRenderTime))
        .slice(0, 5),
      hotObservables: hotObservables
        .sort((a, b) => b.writes - a.writes)
        .slice(0, 5)
    };
  },
  
  /**
   * Export metrics in Prometheus format
   * @returns {string} Metrics in Prometheus format
   */
  exportToPrometheus() {
    // Update global counters before exporting
    this.updateGlobalCounters();
    
    const metrics = this._metrics.global;
    return `
# HELP js_total_reads Total number of observable reads
# TYPE js_total_reads counter
js_total_reads ${metrics.totalReads}

# HELP js_total_writes Total number of observable writes
# TYPE js_total_writes counter
js_total_writes ${metrics.totalWrites}

# HELP js_total_renders Total number of component renders
# TYPE js_total_renders counter
js_total_renders ${metrics.totalRenders}

# HELP js_slow_renders Total number of slow component renders
# TYPE js_slow_renders counter
js_slow_renders ${metrics.slowRenders}

# HELP js_performance_issues Total number of performance issues
# TYPE js_performance_issues counter
js_performance_issues ${metrics.performanceIssues.length}

# HELP js_errors Total number of errors
# TYPE js_errors counter
js_errors ${metrics.errors.length}
    `.trim();
  },
  
  /**
   * Reset all collected metrics
   */
  resetMetrics() {
    this._metrics = {
      global: {
        totalReads: 0,
        totalWrites: 0,
        totalRenders: 0,
        slowRenders: 0,
        memoryUsage: [],
        performanceIssues: [],
        errors: []
      },
      detailed: {}
    };
    
    console.log('Metrics have been reset');
  },
  
  /**
   * Configure the observability system
   * @param {Object} options - Configuration options
   */
  configure(options = {}) {
    if (options.isDetailedMode !== undefined) {
      this.isDetailedMode = !!options.isDetailedMode;
    }
    
    if (typeof options.samplingRate === 'number') {
      this.samplingRate = Math.max(0, Math.min(1, options.samplingRate));
    }
    
    if (typeof options.maxHistoryItems === 'number') {
      this.maxHistoryItems = Math.max(10, options.maxHistoryItems);
    }
    
    if (typeof options.maxIssues === 'number') {
      this.maxIssues = Math.max(10, options.maxIssues);
    }
    
    if (typeof options.maxErrors === 'number') {
      this.maxErrors = Math.max(10, options.maxErrors);
    }
    
    console.log('Observability system configured:', {
      isDetailedMode: this.isDetailedMode,
      samplingRate: this.samplingRate,
      maxHistoryItems: this.maxHistoryItems,
      maxIssues: this.maxIssues,
      maxErrors: this.maxErrors
    });
  }
};

export { ObservabilitySystem };