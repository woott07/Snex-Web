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
        watermarksHTML += `<div class="bg-text">SNAX</div>`;
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
            // Pattern moves slightly with scroll
            pattern.style.transform = `translateY(${scrolled * 0.15}px)`;
        }
        if (textContainer) {
            // Huge text container moves in opposite direction
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

    // Tab switching logic for Commands Section
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Show corresponding content
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
