document.addEventListener('DOMContentLoaded', () => {
    // Inject Parallax Background Elements dynamically across all pages
    const bgContainer = document.createElement('div');
    bgContainer.className = 'parallax-wrapper';
    
    const bgPattern = document.createElement('div');
    bgPattern.className = 'bg-pattern';
    bgContainer.appendChild(bgPattern);

    const bgTextContainer = document.createElement('div');
    bgTextContainer.className = 'bg-text-container';
    
    // Dynamically calculate document height to inject repeating watermarks so they repeat all the way down
    const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
    );
    
    // Place one watermark approximately every 900px of height, minimum of 3 watermarks
    const numWatermarks = Math.max(3, Math.ceil(docHeight / 900));
    
    let watermarksHTML = '';
    for (let i = 0; i < numWatermarks; i++) {
        watermarksHTML += `<div class="bg-text">SMX</div>`;
    }
    bgTextContainer.innerHTML = watermarksHTML;
    bgContainer.appendChild(bgTextContainer);
    
    // ============================================================================
    // DYNAMIC BUTTERFLY ENGINE INTEGRATION
    // ============================================================================
    const canvas = document.createElement('canvas');
    canvas.id = 'butterflyCanvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '0'; // Behind content but sits on top of dot pattern/texts
    bgContainer.appendChild(canvas);

    document.body.prepend(bgContainer);

    const ctx = canvas.getContext('2d');
    let butterflies = [];
    const maxButterflies = 45; // Subtle, optimized particle limit for websites
    let activeBotContext = 'smx'; // Holds 'smx', 'snax', or 'musico' to adjust color palettes dynamically

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colorPalette = [
        '#D4869A', // Soft Dusty Pink (Snax)
        '#7AA0C2', // Soft Slate Blue (Musico)
        '#EAA7B8', // Light Pink
        '#8EAFC8', // Slate Blue Light
        '#CBB2D7', // Lavender
        '#FFDFD3'  // Pastel Peach
    ];

    class Butterfly {
        constructor(x, y, isBurst = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 0.08 + 0.08; // Delicate, subtle sizes
            
            // Assign colors matching the active bot context
            if (activeBotContext === 'snax') {
                const snaxColors = ['#D4869A', '#EAA7B8', '#FFDFD3'];
                this.color = snaxColors[Math.floor(Math.random() * snaxColors.length)];
            } else if (activeBotContext === 'musico') {
                const musicoColors = ['#7AA0C2', '#8EAFC8', '#CBB2D7'];
                this.color = musicoColors[Math.floor(Math.random() * musicoColors.length)];
            } else {
                this.color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            }
            
            // Speeds
            const speedMultiplier = isBurst ? 2.2 : 0.9;
            this.angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(this.angle) * (Math.random() * speedMultiplier + 0.3);
            this.vy = Math.sin(this.angle) * (Math.random() * speedMultiplier + 0.3) - 0.2; // Smooth lift
            
            this.wingAngle = Math.random() * Math.PI * 2;
            this.flapSpeed = Math.random() * 0.07 + 0.07;
            
            this.alpha = 1;
            this.life = 1.0;
            this.decay = Math.random() * 0.005 + 0.004; // Smooth decay
            this.noiseOffset = Math.random() * 1000;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            this.noiseOffset += 0.015;
            this.vx += Math.sin(this.noiseOffset) * 0.05;
            this.vy += Math.cos(this.noiseOffset) * 0.025;
            
            this.angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
            this.wingAngle += this.flapSpeed;
            
            this.life -= this.decay;
            this.alpha = Math.max(0, this.life);
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.scale(this.size, this.size);
            ctx.globalAlpha = this.alpha;
            
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            
            const w = 0.1 + 0.9 * Math.abs(Math.sin(this.wingAngle));
            
            // Wings (Left)
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(-10 * w, -12, 12 * w, 15, -Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(-6 * w, 5, 8 * w, 10, -Math.PI / 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Wings (Right)
            ctx.beginPath();
            ctx.ellipse(10 * w, -12, 12 * w, 15, Math.PI / 4, 0, Math.PI * 2);
            ctx.ellipse(6 * w, 5, 8 * w, 10, Math.PI / 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Body
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#FAFAFA';
            ctx.beginPath();
            ctx.ellipse(0, 0, 2.5, 14, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Antennae
            ctx.strokeStyle = 'rgba(250, 250, 250, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-1, -14);
            ctx.quadraticCurveTo(-6, -20, -10, -23);
            ctx.moveTo(1, -14);
            ctx.quadraticCurveTo(6, -20, 10, -23);
            ctx.stroke();
            
            ctx.restore();
        }
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.hypot(x2 - x1, y2 - y1);
    }

    let mouse = { x: null, y: null, lastX: null, lastY: null, active: false };

    const handleMove = (clientX, clientY) => {
        mouse.x = clientX;
        mouse.y = clientY;
        mouse.active = true;
        
        if (mouse.lastX === null || mouse.lastY === null) {
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
        }
        
        const dist = getDistance(mouse.x, mouse.y, mouse.lastX, mouse.lastY);
        
        if (dist > 35 && butterflies.length < maxButterflies) {
            butterflies.push(new Butterfly(mouse.x, mouse.y));
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
        }
    };

    window.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
        if (e.touches && e.touches.length > 0) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    const handleRelease = () => {
        mouse.active = false;
        mouse.lastX = null;
        mouse.lastY = null;
    };

    window.addEventListener('mouseleave', handleRelease);
    window.addEventListener('touchend', handleRelease);
    window.addEventListener('touchcancel', handleRelease);

    window.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
            mouse.active = true;
            mouse.lastX = e.touches[0].clientX;
            mouse.lastY = e.touches[0].clientY;
        }
    }, { passive: true });

    window.addEventListener('click', (e) => {
        // Enforce maximum particle cap on clicks
        if (butterflies.length >= maxButterflies) return;
        
        // Ignore clicks on links, buttons, and switcher elements to prevent interference
        const target = e.target;
        if (target.closest('a') || target.closest('button') || target.closest('.switcher-btn') || target.closest('.nav-btn')) {
            return;
        }

        // Limit the burst size to prevent exceeding the performance cap
        const remainingSpace = maxButterflies - butterflies.length;
        const burstCount = Math.min(6, remainingSpace);
        
        for (let i = 0; i < burstCount; i++) {
            butterflies.push(new Butterfly(e.clientX, e.clientY, true));
        }
    });

    // Gentle ambient auto-spawning
    setInterval(() => {
        if (!mouse.active && butterflies.length < maxButterflies - 5) {
            const edgeX = Math.random() * canvas.width;
            const edgeY = canvas.height + 20;
            const b = new Butterfly(edgeX, edgeY);
            b.vy = -Math.random() * 0.7 - 0.3;
            butterflies.push(b);
        }
    }, 1800);

    function animate() {
        ctx.fillStyle = 'rgba(250, 250, 250, 0.05)'; // Clear overlay matches --bg-color subtly
        
        // Match transparent clear rect to background color
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        // Since --bg-color is #FAFAFA, use transparent light gray
        ctx.fillStyle = 'rgba(250, 250, 250, 0.06)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let i = butterflies.length - 1; i >= 0; i--) {
            const b = butterflies[i];
            b.update();
            b.draw();
            
            if (b.alpha <= 0.01) {
                butterflies.splice(i, 1);
            }
        }
        requestAnimationFrame(animate);
    }
    animate();

    // ============================================================================
    // CORE PAGE EFFECTS (SCROLLS, REVEALS, SWITCHERS)
    // ============================================================================

    // Parallax scroll effect
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        
        const pattern = document.querySelector('.bg-pattern');
        const textContainer = document.querySelector('.bg-text-container');
        
        if (pattern) {
            pattern.style.transform = `translateY(${scrolled * 0.15}px)`;
        }
        if (textContainer) {
            textContainer.style.transform = `translateY(${scrolled * -0.25}px) rotate(-5deg)`;
        }
    });

    // Scroll Reveal Animations
    const revealElements = document.querySelectorAll('.reveal');
    
    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            root: null,
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }

    // Bot switcher logic (SNAX vs MUSICO)
    const switcherBtns = document.querySelectorAll('.switcher-btn');
    const botViews = document.querySelectorAll('.bot-view');

    if (switcherBtns.length > 0) {
        switcherBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetBot = btn.getAttribute('data-bot');
                
                // Toggle active classes on switcher buttons
                switcherBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Toggle active classes on views
                botViews.forEach(view => {
                    if (view.id === `${targetBot}-view`) {
                        view.classList.add('active');
                    } else {
                        view.classList.remove('active');
                    }
                });

                // Update active bot particle context
                activeBotContext = targetBot;

                // Update background watermarks to reflect selected bot
                const bgTexts = document.querySelectorAll('.bg-text');
                bgTexts.forEach(txt => {
                    txt.textContent = targetBot.toUpperCase();
                });

                // Re-run Intersection Observer checks for newly visible elements
                const newlyVisibleReveals = document.querySelectorAll(`#${targetBot}-view .reveal`);
                newlyVisibleReveals.forEach(el => {
                    const rect = el.getBoundingClientRect();
                    if (rect.top < window.innerHeight) {
                        el.classList.add('active');
                    }
                });
            });
        });
    }

    // Check URL hash for bot selection on load (e.g. #snax or #musico)
    const handleHashSelector = () => {
        const hash = window.location.hash.toLowerCase();
        if (hash === '#snax' || hash === '#musico') {
            const botName = hash.substring(1);
            const targetBtn = document.querySelector(`.switcher-btn[data-bot="${botName}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    };

    handleHashSelector();
    window.addEventListener('hashchange', handleHashSelector);

    // Smooth scrolling for anchor links (excluding bot switcher hashes)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        const href = anchor.getAttribute('href');
        if (href === '#snax' || href === '#musico') return;
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
