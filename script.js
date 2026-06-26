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
    
    document.body.prepend(bgContainer);

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
            // Immediately reveal if already in viewport on load
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
            const botName = hash.substring(1); // extract 'snax' or 'musico'
            const targetBtn = document.querySelector(`.switcher-btn[data-bot="${botName}"]`);
            if (targetBtn) {
                targetBtn.click();
            }
        }
    };

    // Run on load and listen to changes
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
