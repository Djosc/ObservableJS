/**
 * ObservableJS DevTools
 * 
 * Visualization and analysis tools for ObservableJS performance metrics
 * 
 * @module observablejs/devtools
 * @version 0.1.0
 */

import { ObservabilitySystem } from '@observablejs/core';

/**
 * Dashboard component for visualizing performance metrics
 */
class Dashboard {
  constructor(options = {}) {
    this.options = {
      containerId: 'observablejs-dashboard',
      updateInterval: 2000,
      showHotspots: true,
      showMetrics: true,
      ...options
    };
    
    this._container = null;
    this._updateInterval = null;
  }
  
  /**
   * Create and open the dashboard
   * @returns {Dashboard} The dashboard instance
   */
  open() {
    // Create dashboard container if it doesn't exist
    if (!document.getElementById(this.options.containerId)) {
      const container = document.createElement('div');
      container.id = this.options.containerId;
      container.className = 'observablejs-dashboard';
      container.style.cssText = `
        position: fixed;
        bottom: 0;
        right: 0;
        width: 400px;
        height: 500px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px 0 0 0;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        overflow: auto;
        z-index: 10000;
        font-family: sans-serif;
        padding: 15px;
      `;
      document.body.appendChild(container);
      this._container = container;
    } else {
      this._container = document.getElementById(this.options.containerId);
    }
    
    // Start periodic updates
    this._startUpdates();
    
    return this;
  }
  
  /**
   * Close the dashboard
   */
  close() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
    
    if (this._container) {
      this._container.remove();
      this._container = null;
    }
  }
  
  /**
   * Start periodic updates of the dashboard
   * @private
   */
  _startUpdates() {
    // Initial update
    this._updateDashboard();
    
    // Set up interval for periodic updates
    this._updateInterval = setInterval(() => {
      this._updateDashboard();
    }, this.options.updateInterval);
  }
  
  /**
   * Update the dashboard with the latest metrics
   * @private
   */
  _updateDashboard() {
    if (!this._container) return;
    
    const metrics = ObservabilitySystem.getMetrics();
    const hotspots = ObservabilitySystem.findHotspots();
    
    // Create HTML for the dashboard
    let html = `
      <h2>ObservableJS Dashboard</h2>
      <div class="dashboard-controls">
        <button id="refresh-dashboard">Refresh</button>
        <button id="reset-metrics">Reset Metrics</button>
      </div>
    `;
    
    // Add metrics section if enabled
    if (this.options.showMetrics) {
      html += `
        <div class="metrics-section">
          <h3>Global Metrics</h3>
          <table class="metrics-table">
            <tr>
              <td>Reads:</td>
              <td>${metrics.global.totalReads}</td>
            </tr>
            <tr>
              <td>Writes:</td>
              <td>${metrics.global.totalWrites}</td>
            </tr>
            <tr>
              <td>Renders:</td>
              <td>${metrics.global.totalRenders}</td>
            </tr>
            <tr>
              <td>Slow Renders:</td>
              <td>${metrics.global.slowRenders}</td>
            </tr>
            <tr>
              <td>Performance Issues:</td>
              <td>${metrics.global.performanceIssues.length}</td>
            </tr>
            <tr>
              <td>Errors:</td>
              <td>${metrics.global.errors.length}</td>
            </tr>
          </table>
        </div>
      `;
    }
    
    // Add hotspots section if enabled
    if (this.options.showHotspots) {
      html += `
        <div class="hotspots-section">
          <h3>Hotspots</h3>
          
          <h4>Hot Components (${hotspots.hotComponents.length})</h4>
          ${hotspots.hotComponents.length > 0 ? `
            <table class="hotspots-table">
              <tr>
                <th>Component</th>
                <th>Renders</th>
                <th>Avg Time</th>
              </tr>
              ${hotspots.hotComponents.map(comp => `
                <tr>
                  <td>${comp.component}</td>
                  <td>${comp.renders}</td>
                  <td>${comp.averageRenderTime.toFixed(2)}ms</td>
                </tr>
              `).join('')}
            </table>
          ` : '<p>No component hotspots detected</p>'}
          
          <h4>Hot Observables (${hotspots.hotObservables.length})</h4>
          ${hotspots.hotObservables.length > 0 ? `
            <table class="hotspots-table">
              <tr>
                <th>ID</th>
                <th>Writes</th>
                <th>Reads</th>
                <th>Value</th>
              </tr>
              ${hotspots.hotObservables.map(obs => `
                <tr>
                  <td>${obs.id}</td>
                  <td>${obs.writes}</td>
                  <td>${obs.reads}</td>
                  <td>${obs.value}</td>
                </tr>
              `).join('')}
            </table>
          ` : '<p>No observable hotspots detected</p>'}
        </div>
      `;
    }
    
    // Display recent performance issues
    if (metrics.global.performanceIssues.length > 0) {
      const recentIssues = metrics.global.performanceIssues
        .slice(-5)
        .reverse();
      
      html += `
        <div class="issues-section">
          <h3>Recent Issues</h3>
          <ul>
            ${recentIssues.map(issue => `
              <li>
                <strong>${issue.type}</strong>: 
                ${issue.component ? `${issue.component} ` : ''}
                ${issue.renderTime ? `(${issue.renderTime.toFixed(2)}ms)` : ''}
                ${issue.computeTime ? `(${issue.computeTime.toFixed(2)}ms)` : ''}
                ${new Date(issue.timestamp).toLocaleTimeString()}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }
    
    // Set the HTML content
    this._container.innerHTML = html;
    
    // Add event listeners
    document.getElementById('refresh-dashboard').addEventListener('click', () => {
      this._updateDashboard();
    });
    
    document.getElementById('reset-metrics').addEventListener('click', () => {
      ObservabilitySystem.resetMetrics();
      this._updateDashboard();
    });
  }
}

/**
 * Create a new dashboard instance
 * @param {Object} options - Dashboard options
 * @returns {Dashboard} The dashboard instance
 */
function createDashboard(options = {}) {
  return new Dashboard(options);
}

export {
  Dashboard,
  createDashboard
};

export default {
  Dashboard,
  createDashboard
};