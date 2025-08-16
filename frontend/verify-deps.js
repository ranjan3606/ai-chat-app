
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Dependencies...\n');

const requiredDeps = [
  '@react-native-async-storage/async-storage',
  'firebase',
  'socket.io-client',
  'react-native-safe-area-context',
  'react-native-screens',
  '@react-navigation/native',
  '@react-navigation/stack'
];

const nodeModulesPath = path.join(__dirname, 'node_modules');

let allGood = true;

requiredDeps.forEach(dep => {
  const depPath = path.join(nodeModulesPath, dep);
  const exists = fs.existsSync(depPath);
  
  if (exists) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MISSING`);
    allGood = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allGood) {
  console.log('🎉 All dependencies are properly installed!');
  console.log('✅ Ready to run: npx expo start --clear');
} else {
  console.log('❌ Some dependencies are missing!');
  console.log('🔧 Run: npm install');
}

console.log('='.repeat(50));
