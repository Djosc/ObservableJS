# ObservableJS

A JavaScript framework with built-in observability for monitoring application performance.

## Overview

ObservableJS is a reactive framework that automatically tracks performance metrics without requiring developers to add instrumentation code. It helps identify bottlenecks, performance issues, and inefficient patterns in real-time, making it easier to optimize your application.

## Features

- **Zero-Configuration Monitoring**: Get detailed performance metrics without writing any instrumentation code
- **Reactive State Management**: Observable state and computed values with automatic dependency tracking
- **Performance Analysis**: Automatic detection of hotspots, bottlenecks, and inefficient patterns
- **Component System**: UI components with built-in render time and update frequency tracking
- **Developer Dashboard**: Visual interface for monitoring performance metrics in real-time
- **Low Overhead**: Configurable sampling rate to minimize production impact
- **External Integrations**: Export metrics to Prometheus, Grafana, and other monitoring tools

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/observablejs.git
cd observablejs

# Install dependencies
npm install

# Build the packages
npm run build
```

## Project Structure

```
observablejs/
├── packages/
│   ├── core/          # Reactive system with observability
│   ├── components/    # UI component system with performance tracking
│   ├── devtools/      # Visualization and analysis tools
│   └── examples/      # Demo applications
├── scripts/           # Development utilities
└── docs/              # Documentation (coming soon)
```

## Basic Usage

### Reactive State

```javascript
import { createObservable, computed, startMonitoring } from 'observablejs';

// Start monitoring with default settings
startMonitoring();

// Create reactive state
const count = createObservable(0);
const multiplier = createObservable(2);

// Create computed values with automatic dependency tracking
const doubled = computed(() => count.value * multiplier.value, [count, multiplier]);

// Subscribe to changes
doubled.subscribe(value => {
  console.log(`The doubled value is now: ${value}`);
});

// Update values - subscriptions update automatically
count.value = 5; // Logs: The doubled value is now: 10
multiplier.value = 3; // Logs: The doubled value is now: 15

// Get performance metrics
import { getMetrics, findHotspots } from 'observablejs';

console.log(getMetrics()); // View all collected metrics
console.log(findHotspots()); // Identify performance issues
```

### UI Components

```javascript
import { Component, mount } from 'observablejs/components';
import { createObservable } from 'observablejs';

// Create state
const count = createObservable(0);

// Create a component
class CounterComponent extends Component {
  constructor() {
    super();
    
    // Subscribe to observable changes
    this.subscribe(count, newValue => {
      this.setState({ count: newValue });
    });
  }
  
  render() {
    super.render(); // Required to track metrics
    
    if (this._element) {
      this._element.innerHTML = `
        <div>
          <p>Count: ${count.value}</p>
          <button id="increment">Increment</button>
        </div>
      `;
      
      // Add event handlers
      this._element.querySelector('#increment').addEventListener('click', () => {
        count.value++;
      });
    }
    
    return Promise.resolve();
  }
}

// Mount the component
const counter = new CounterComponent();
mount(counter, '#app');
```

### Performance Dashboard

```javascript
import { createDashboard } from 'observablejs/devtools';

// Create and open the dashboard
const dashboard = createDashboard();
dashboard.open();
```

## Configuration

```javascript
import { configure } from 'observablejs';

configure({
  // Enable detailed mode in development
  isDetailedMode: process.env.NODE_ENV !== 'production',
  
  // Sample only 10% of operations in production for lower overhead
  samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  
  // Maximum history items to keep
  maxHistoryItems: 1000,
  
  // Maximum performance issues to track
  maxIssues: 100,
  
  // Maximum errors to track
  maxErrors: 50
});
```

## Running Examples

```bash
# Start the example application
npm run start:examples
```

This will open a browser window with a counter example that demonstrates the core features of ObservableJS.

## Development

```bash
# Run development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT