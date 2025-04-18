# ObservableJS

A JavaScript framework with built-in observability for monitoring application performance.

## Overview

ObservableJS is a reactive framework that automatically tracks performance metrics without requiring developers to add instrumentation code. It helps identify bottlenecks, performance issues, and inefficient patterns in real-time.

## Key Features

- **Built-in Observability**: Performance tracking happens automatically
- **Low Overhead**: Configurable sampling rate to minimize production impact
- **Reactive Primitives**: Observable state and computed values with dependency tracking
- **Component System**: UI components with automatic render time tracking
- **Performance Analysis**: Automatic detection of hotspots and bottlenecks
- **External Integrations**: Export metrics to tools like Prometheus and Grafana

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

## Basic Usage

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

console.log(getMetrics());
console.log(findHotspots());
```

## Component Example

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

## Performance Dashboard

ObservableJS includes a performance dashboard that visualizes metrics in real-time:

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
  // Detailed mode includes stack traces and more metrics
  isDetailedMode: process.env.NODE_ENV !== 'production',
  
  // Sample only 10% of operations in production for lower overhead
  samplingRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
  
  // Maximum history items to keep
  maxHistoryItems: 1000
});
```

## Project Structure

```
observablejs/
├── packages/
│   ├── core/ (reactive system)
│   ├── components/ (UI layer)
│   ├── devtools/ (visualization of metrics)
│   └── examples/ (demo apps)
├── docs/
└── tests/
```

## License

MIT