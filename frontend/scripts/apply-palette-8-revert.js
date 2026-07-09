const fs = require('fs');

// 1. Update DustParticles.tsx
let dust = fs.readFileSync('components/DustParticles.tsx', 'utf8');
dust = dust.replace(/const COLORS = \[.*?\];/g, 'const COLORS = ["#FF2E93", "#D9006C", "#6B0036", "#2B0021", "#10000C"];');
fs.writeFileSync('components/DustParticles.tsx', dust);

// 2. Update globals.css
let css = fs.readFileSync('app/globals.css', 'utf8');

css = css.replace(/--color-background: #[0-9a-fA-F]{6};/g, '--color-background: #10000C;'); 
css = css.replace(/--color-surface: #[0-9a-fA-F]{6};/g, '--color-surface: #2B0021;');

css = css.replace(/--color-accent-blue: #[0-9a-fA-F]{6};/g, '--color-accent-blue: #FF2E93;'); 
css = css.replace(/--color-blue-300: #[0-9a-fA-F]{6};/g, '--color-blue-300: #ff85c0;');
css = css.replace(/--color-blue-400: #[0-9a-fA-F]{6};/g, '--color-blue-400: #ff59aa;');
css = css.replace(/--color-blue-500: #[0-9a-fA-F]{6};/g, '--color-blue-500: #FF2E93;'); // C1
css = css.replace(/--color-blue-600: #[0-9a-fA-F]{6};/g, '--color-blue-600: #D9006C;'); // C2
css = css.replace(/--color-blue-700: #[0-9a-fA-F]{6};/g, '--color-blue-700: #99004d;');

css = css.replace(/--color-accent-purple: #[0-9a-fA-F]{6};/g, '--color-accent-purple: #6B0036;'); 
css = css.replace(/--color-purple-300: #[0-9a-fA-F]{6};/g, '--color-purple-300: #e60074;');
css = css.replace(/--color-purple-400: #[0-9a-fA-F]{6};/g, '--color-purple-400: #b3005a;');
css = css.replace(/--color-purple-500: #[0-9a-fA-F]{6};/g, '--color-purple-500: #6B0036;'); // C3
css = css.replace(/--color-purple-600: #[0-9a-fA-F]{6};/g, '--color-purple-600: #400020;'); 
css = css.replace(/--color-purple-700: #[0-9a-fA-F]{6};/g, '--color-purple-700: #1a000d;');

css = css.replace(/--color-accent-cyan: #[0-9a-fA-F]{6};/g, '--color-accent-cyan: #2B0021;'); 
css = css.replace(/--color-cyan-300: #[0-9a-fA-F]{6};/g, '--color-cyan-300: #7a005e;');
css = css.replace(/--color-cyan-400: #[0-9a-fA-F]{6};/g, '--color-cyan-400: #52003f;');
css = css.replace(/--color-cyan-500: #[0-9a-fA-F]{6};/g, '--color-cyan-500: #2B0021;'); // C4
css = css.replace(/--color-cyan-600: #[0-9a-fA-F]{6};/g, '--color-cyan-600: #170012;'); 
css = css.replace(/--color-cyan-700: #[0-9a-fA-F]{6};/g, '--color-cyan-700: #050004;');

fs.writeFileSync('app/globals.css', css);

// 3. Update BackgroundBloom.tsx
let bloom = fs.readFileSync('components/BackgroundBloom.tsx', 'utf8');

bloom = bloom.replace(/rgba\(56, 189, 248,/g, 'rgba(255, 46, 147,');
bloom = bloom.replace(/rgba\(2, 132, 199,/g, 'rgba(217, 0, 108,');
bloom = bloom.replace(/rgba\(3, 105, 161,/g, 'rgba(107, 0, 54,');
bloom = bloom.replace(/rgba\(12, 74, 110,/g, 'rgba(43, 0, 33,');
bloom = bloom.replace(/rgba\(4, 21, 40,/g, 'rgba(16, 0, 12,');

fs.writeFileSync('components/BackgroundBloom.tsx', bloom);
console.log('Reverted to Quantum Violet');
