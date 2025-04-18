/**
 * ObservableJS Counter Example
 * 
 * A simple counter application that demonstrates the core features
 * of the ObservableJS framework.
 */

import { 
    createObservable, 
    computed, 
    startMonitoring,
    getMetrics,
    findHotspots
  } from '@observablejs/core';
  
  import {
    Component,
    mount
  } from '@observablejs/components';
  
  // Initialize observability with development settings
  const stopMonitoring = startMonitoring(1000); // Check metrics every 1s
  
  // Create observable state
  const count = createObservable(0);
  const multiplier = createObservable(2);
  
  // Create computed values
  const doubled = computed(() => count.value * multiplier.value, [count, multiplier]);
  const isEven = computed(() => count.value % 2 === 0, [count]);
  
  // Create a dashboard component to display metrics
  class MetricsDashboard extends Component {
    constructor() {
      super();
      this.state = {
        metrics: getMetrics(),
        hotspots: findHotspots()
      };
      
      // Update metrics every 2 seconds
      this._metricsInterval = setInterval(() => {
        this.setState({
          metrics: getMetrics(),
          hotspots: findHotspots()
        });
      }, 2000);
    }
    
    render() {
      super.render();
      
      if (this._element) {
        const { metrics, hotspots } = this.state;
        
        this._element.innerHTML = `
          <div class="dashboard">
            <h3>Performance Metrics</h3>
            <div class="metrics">
              <p>Total Reads: ${metrics.global.totalReads}</p>
              <p>Total Writes: ${metrics.global.totalWrites}</p>
              <p>Total Renders: ${metrics.global.totalRenders}</p>
              <p>Slow Renders: ${metrics.global.slowRenders}</p>
            </div>
            
            <h3>Hotspots</h3>
            <div class="hotspots">
              <h4>Hot Components (${hotspots.hotComponents.length})</h4>
              <ul>
                ${hotspots.hotComponents.map(comp => `
                  <li>${comp.component}: ${comp.renders} renders, avg ${comp.averageRenderTime.toFixed(2)}ms</li>
                `).join('')}
              </ul>
              
              <h4>Hot Observables (${hotspots.hotObservables.length})</h4>
              <ul>
                ${hotspots.hotObservables.map(obs => `
                  <li>ID ${obs.id}: ${obs.writes} writes, ${obs.reads} reads</li>
                `).join('')}
              </ul>
            </div>
          </div>
        `;
      }
      
      return Promise.resolve();
    }
    
    // Clean up when unmounted
    unmount() {
      if (this._metricsInterval) {
        clearInterval(this._metricsInterval);
      }
      super.unmount();
    }
  }
  
  // Create the counter component
  class CounterComponent extends Component {
    constructor() {
      super();
      
      // Subscribe to observable changes
      this.subscribe(count, newCount => {
        this.setState({ count: newCount });
      });
      
      this.subscribe(doubled, newDoubled => {
        this.setState({ doubled: newDoubled });
      });
      
      this.subscribe(isEven, newIsEven => {
        this.setState({ isEven: newIsEven });
      });
    }
    
    render() {
      super.render();
      
      if (this._element) {
        // Sometimes add an artificial delay to demonstrate slow renders
        if (count.value > 0 && count.value % 10 === 0) {
          const start = performance.now();
          while (performance.now() - start < 20) {
            // Simulate a slow operation
          }
        }
        
        this._element.innerHTML = `
          <div class="counter ${isEven.value ? 'even' : 'odd'}">
            <h2>Counter Example</h2>
            
            <div class="value">
              <p>Count: <span>${count.value}</span></p>
              <p>Doubled: <span>${doubled.value}</span></p>
              <p>Is Even: <span>${isEven.value ? 'Yes' : 'No'}</span></p>
            </div>
            
            <div class="controls">
              <button id="decrement">-</button>
              <button id="increment">+</button>
            </div>
            
            <div class="multiplier">
              <label>
                Multiplier:
                <select id="multiplier">
                  <option value="2" ${multiplier.value === 2 ? 'selected' : ''}>2</option>
                  <option value="3" ${multiplier.value === 3 ? 'selected' : ''}>3</option>
                  <option value="5" ${multiplier.value === 5 ? 'selected' : ''}>5</option>
                  <option value="10" ${multiplier.value === 10 ? 'selected' : ''}>10</option>
                </select>
              </label>
            </div>
            
            <button id="stress-test">Stress Test (100 updates)</button>
          </div>
        `;
        
        // Add event handlers
        this._element.querySelector('#increment').addEventListener('click', () => {
          count.value++;
        });
        
        this._element.querySelector('#decrement').addEventListener('click', () => {
          count.value--;
        });
        
        this._element.querySelector('#multiplier').addEventListener('change', (e) => {
          multiplier.value = Number(e.target.value);
        });
        
        this._element.querySelector('#stress-test').addEventListener('click', () => {
          // Perform many updates in quick succession to test performance
          for (let i = 0; i < 100; i++) {
            setTimeout(() => {
              count.value++;
            }, i * 10);
          }
        });
      }
      
      return Promise.resolve();
    }
  }
  
  // Initialize the application when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    // Create and mount the counter component
    const counter = new CounterComponent();
    mount(counter, '#counter-app');
    
    // Create and mount the metrics dashboard
    const dashboard = new MetricsDashboard();
    mount(dashboard, '#metrics-dashboard');
    
    // Expose to window for debugging
    window.observableApp = {
      count,
      multiplier,
      doubled,
      isEven,
      getMetrics,
      findHotspots
    };
    
    console.log('Application initialized. Access state via window.observableApp');
  });
  
  // Clean up when the window is closed
  window.addEventListener('beforeunload', () => {
    stopMonitoring();
  });