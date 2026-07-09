const fs = require('fs');

let content = fs.readFileSync('components/DustParticles.tsx', 'utf8');

// Replace the drawing logic
content = content.replace(/ctx\.beginPath\(\);[\s\S]*?ctx\.fill\(\);/m, 
        // Create soft radial bloom effect (no hard edges)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        
        // Use a regex to convert HEX to RGBA for the gradient to work smoothly with transparency
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? \\, \, \\ : '255, 255, 255';
        };
        const rgb = hexToRgb(p.color);
        const alpha = Math.max(0, Math.min(1, p.alpha * 1.2)); // Adjusted alpha
        
        gradient.addColorStop(0, \gba(\, \)\); // Bright center
        gradient.addColorStop(0.3, \gba(\, \)\); // Soft middle
        gradient.addColorStop(1, \gba(\, 0)\); // Invisible edge
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
);

// Adjust the radius to be larger but soft
content = content.replace(/radius: Math.random\(\) \* 3 \+ 1\.2/g, "radius: Math.random() * 25 + 15");
// Restore opacity
content = content.replace(/opacity-100/g, "opacity-70");

fs.writeFileSync('components/DustParticles.tsx', content);
console.log('Fixed DustParticles bloom');
