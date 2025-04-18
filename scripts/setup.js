/**
 * Setup script for ObservableJS
 * 
 * Creates the necessary directory structure and initial files
 * for development without requiring a build step.
 */

const fs = require('fs');
const path = require('path');

// Ensure directories exist
const directories = [
  'packages/core/dist',
  'packages/components/dist',
  'packages/devtools/dist',
  'scripts'
];

// Create directories if they don't exist
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create dist files that simply re-export from src
const packages = ['core', 'components', 'devtools'];

packages.forEach(pkg => {
  const distFile = path.join('packages', pkg, 'dist', 'index.js');
  const distEsmFile = path.join('packages', pkg, 'dist', 'index.esm.js');
  
  console.log(`Creating dist file: ${distFile}`);
  fs.writeFileSync(distFile, `export * from '../src/index.js';\n`);
  
  console.log(`Creating dist file: ${distEsmFile}`);
  fs.writeFileSync(distEsmFile, `export * from '../src/index.js';\n`);
});

// Update package dependencies if needed
const updatePackageDependencies = () => {
  packages.forEach(pkg => {
    const packageJsonPath = path.join('packages', pkg, 'package.json');
    
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Update scripts to simplify build process
      packageJson.scripts = {
        ...packageJson.scripts,
        build: "echo \"Using direct file linking instead of building with Rollup.\""
      };
      
      // Write the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log(`Updated package.json for ${pkg}`);
    }
  });
};

updatePackageDependencies();

console.log('Setup complete! You can now run the examples with:');
console.log('npm run dev');