document.addEventListener('DOMContentLoaded', () => {
    // Set Current Year in Footer
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }    // Mobile Menu Toggle Logic
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuLinks = mobileMenu.querySelectorAll('a');

    const toggleMenu = () => {
        const isOpen = document.body.classList.contains('menu-open');
        if (isOpen) {
            document.body.classList.remove('menu-open');
            mobileMenu.classList.remove('active');
            // Re-enable scrolling
            document.body.style.overflow = '';
        } else {
            document.body.classList.add('menu-open');
            mobileMenu.classList.add('active');
            // Disable scrolling
            document.body.style.overflow = 'hidden';
        }
    };

    menuToggle.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (document.body.classList.contains('menu-open')) {
                toggleMenu();
            }
        });
    });

    // CTA specific "Right Choice" animation (Applies to all .hero-cta elements)
    document.querySelectorAll('.hero-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-href') || (btn.getAttribute('onclick')?.match(/#\w+/)?.[0]);

            if (targetId) {
                e.preventDefault();

                const tl = gsap.timeline();
                tl.to(btn, { scale: 0.95, duration: 0.1, ease: 'power2.in' })
                    .to(btn, {
                        scale: 1.05,
                        backgroundColor: '#e9fd8e',
                        color: '#02011a',
                        borderColor: '#e9fd8e',
                        boxShadow: '0 0 50px rgba(233, 253, 142, 0.8)',
                        duration: 0.4,
                        ease: 'back.out(2)'
                    })
                    .to(btn.querySelector('.hero-cta-text'), { textShadow: '0 0 10px rgba(2, 1, 26, 0.2)', duration: 0.2 }, '<');

                const target = document.querySelector(targetId);
                if (target) {
                    setTimeout(() => {
                        target.scrollIntoView({ behavior: 'smooth' });
                        setTimeout(() => {
                            gsap.to(btn, {
                                scale: 1,
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: '#f5f5f7',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 0 0px transparent',
                                duration: 1,
                                delay: 0.5
                            });
                        }, 1000);
                    }, 600);
                } else if (btn.getAttribute('onclick')) {
                    setTimeout(() => {
                        const action = btn.getAttribute('onclick').replace('window.location.href=', '').replace(/'/g, '');
                        window.location.href = action;
                    }, 600);
                }
            }
        });
    });

    // Intercept other CTA clicks for shine animation
    document.querySelectorAll('.ghost-button, .service-cta').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const href = btn.getAttribute('href') || btn.getAttribute('data-href');
            if (href && href !== '#') {
                e.preventDefault();
                btn.classList.add('clicked-shine');

                setTimeout(() => {
                    if (btn.getAttribute('target') === '_blank') {
                        window.open(href, '_blank');
                    } else {
                        const targetEl = document.querySelector(href);
                        if (targetEl) {
                            targetEl.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            window.location.href = href;
                        }
                    }
                    btn.classList.remove('clicked-shine');
                }, 500);
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('fade-in')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.classList.contains('reveal')) {
                    entry.target.classList.add('active');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial animations trigger for hero
    document.querySelectorAll('.fade-in, .reveal').forEach(el => {
        observer.observe(el);
    });

    // Service Card Logic
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        const header = card.querySelector('.card-header');

        // 1. Specular Mouse Glare
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
            card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
        });

        // 2. Expansion Logic
        if (header) {
            header.addEventListener('click', () => {
                const isExpanded = card.classList.contains('expanded');

                // Close all other cards
                serviceCards.forEach(c => c.classList.remove('expanded'));

                // If the clicked card wasn't expanded, expand it
                if (!isExpanded) {
                    card.classList.add('expanded');
                }
            });
        }
    });

    // CTA email link — no form handler needed, mailto: triggers native email client

    // Scroll Effects for Navigation
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Initialize theme and advanced animations on load
    setTheme(localStorage.getItem('aura-theme') || 'light');
    initQuotes();
    
    // Inject dynamic photos before initializing sliders
    if (typeof window.photoData !== 'undefined') {
        renderDynamicPhotos();
    }

    initHeroSlider();
    if (typeof gsap !== 'undefined' && typeof lottie !== 'undefined') {
        initAdvancedAnimations();
    }
    initServiceSlideshows();
    initGalleryExpander();
    initLightbox(); // Initialize the enhanced lightbox
});

// =============================================
// Enhanced Lightbox Logic
// =============================================
let currentLightboxImages = [];
let currentLightboxIndex = 0;

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');

    if (!lightbox || !lightboxImg) return;

    const closeLightbox = () => {
        lightbox.style.display = 'none';
        document.body.style.overflow = ''; // Restore scroll
    };

    const updateLightbox = () => {
        if (currentLightboxImages.length > 0) {
            // Remove animation class to reset it
            lightboxImg.style.animation = 'none';
            lightboxImg.offsetHeight; // Trigger reflow
            
            lightboxImg.src = currentLightboxImages[currentLightboxIndex];
            lightboxImg.style.animation = 'breathOfLife 8s ease-in-out infinite';
            
            // Show/hide arrows if only one image
            const display = currentLightboxImages.length > 1 ? 'flex' : 'none';
            if (prevBtn) prevBtn.style.display = display;
            if (nextBtn) nextBtn.style.display = display;
        }
    };

    window.openLightbox = (images, index) => {
        currentLightboxImages = images;
        currentLightboxIndex = index;
        updateLightbox();
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scroll
    };

    if (closeBtn) closeBtn.onclick = closeLightbox;
    
    lightbox.onclick = (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox')) {
            closeLightbox();
        }
    };

    if (prevBtn) {
        prevBtn.onclick = (e) => {
            e.stopPropagation();
            currentLightboxIndex = (currentLightboxIndex - 1 + currentLightboxImages.length) % currentLightboxImages.length;
            updateLightbox();
        };
    }

    if (nextBtn) {
        nextBtn.onclick = (e) => {
            e.stopPropagation();
            currentLightboxIndex = (currentLightboxIndex + 1) % currentLightboxImages.length;
            updateLightbox();
        };
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display === 'flex') {
            if (e.key === 'ArrowLeft' && currentLightboxImages.length > 1) prevBtn.click();
            if (e.key === 'ArrowRight' && currentLightboxImages.length > 1) nextBtn.click();
            if (e.key === 'Escape') closeLightbox();
        }
    });
}

// =============================================
// Dynamic Photo Injection
// =============================================
function renderDynamicPhotos() {
    const data = window.photoData;
    if (!data) return;

    // 1. Home Slider
    const heroSlider = document.querySelector('.hero-bg-slider');
    if (heroSlider && data.home) {
        heroSlider.innerHTML = ''; // Clear existing
        data.home.forEach((src, index) => {
            const slide = document.createElement('div');
            slide.className = `slide ${index === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `url('${src}')`;
            slide.style.cursor = 'zoom-in';
            slide.addEventListener('click', () => {
                if (window.openLightbox) {
                    window.openLightbox(data.home, index);
                }
            });
            heroSlider.appendChild(slide);
        });
        const overlay = document.createElement('div');
        overlay.className = 'hero-overlay';
        heroSlider.appendChild(overlay);
    }

    // 2. Service Slideshows
    const configs = [
        { id: 'slideshowDesign', images: data.design, alt: 'Design' },
        { id: 'slideshowConstruction', images: data.construction, alt: 'Construction' },
        { id: 'slideshowMaintenance', images: data.maintenance, alt: 'Maintenance' }
    ];

    configs.forEach(config => {
        const wrapper = document.getElementById(config.id);
        if (wrapper && config.images) {
            wrapper.innerHTML = ''; // Clear existing
            config.images.forEach((src, index) => {
                const img = document.createElement('img');
                img.src = src;
                img.alt = `${config.alt} ${index + 1}`;
                img.className = `slide ${index === 0 ? 'active' : ''}`;
                img.loading = 'lazy'; // Performance optimization
                wrapper.appendChild(img);
            });
        }
    });

    // 3. Random Gallery Previews
    const previewGrid = document.querySelector('.preview-grid');
    if (previewGrid && data.design && data.construction && data.maintenance) {
        previewGrid.innerHTML = ''; // Clear existing
        const allPhotos = [...data.design, ...data.construction, ...data.maintenance];
        
        // Pick 3 unique random photos
        const shuffled = allPhotos.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        selected.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item glass-card';
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Gallery Preview ${index + 1}`;
            img.className = 'gallery-img';
            img.style.cursor = 'zoom-in';
            
            img.addEventListener('click', () => {
                if (window.openLightbox) {
                    window.openLightbox(selected, index);
                }
            });

            item.appendChild(img);
            previewGrid.appendChild(item);
        });
    }
}

// =============================================
// Hero Background Slider
// =============================================
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-bg-slider .slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds per slide

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, slideInterval);
}

// =============================================
// Advanced Animations (GSAP, Canvas, Lottie)
// =============================================
function initAdvancedAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // 0. Hero & Background Fade Out
    gsap.to(['.hero-content', '.hero-bg-slider'], {
        opacity: 0,
        y: -100,
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });

    // 1. Services Title Fade In
    gsap.fromTo('.services-intro-section',
        { opacity: 0, y: 50 },
        {
            opacity: 1,
            y: 0,
            scrollTrigger: {
                trigger: '.services-intro-section',
                start: 'top 90%',
                end: 'top 20%',
                scrub: true
            }
        }
    );

    // 2. Parallax for Services Background
    gsap.to('.services-section', {
        backgroundPositionY: '100%',
        ease: 'none',
        scrollTrigger: {
            trigger: '.services-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    // Unified Section Fade-in (handled by IntersectionObserver for simplicity and performance)
    // We can also add a subtle GSAP flourish here if needed, but the user requested "not separate transitions"

    // 1. Heading Reveals (Blueprint Style) - Applies to Services, Gallery, Testimonials
    const headingBlocks = gsap.utils.toArray('.services-heading-block');
    headingBlocks.forEach((block) => {
        ScrollTrigger.create({
            trigger: block,
            start: 'top 85%',
            onEnter: () => {
                block.classList.add('visible');
                const title = block.querySelector('.services-title');
                if (title) {
                    gsap.from(title, {
                        y: 40,
                        opacity: 0,
                        duration: 1.5,
                        ease: 'power4.out'
                    });
                }
            }
        });
    });

    // Gallery Items Staggered Reveal
    gsap.from('.gallery-item', {
        scrollTrigger: {
            trigger: '.gallery-grid',
            start: 'top 80%',
        },
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power2.out'
    });

    // Service rows will now use the standard professional fade-in transition
    const serviceRows = gsap.utils.toArray('.service-row');
    serviceRows.forEach((row) => {
        gsap.from(row, {
            scrollTrigger: {
                trigger: row,
                start: 'top 90%',
                toggleActions: 'play none none reverse'
            },
            opacity: 0,
            y: 30,
            duration: 1.2,
            ease: 'power2.out'
        });
    });

    // 3. Lottie Framework
    const lottieContainer = document.getElementById('lottieContainer');
    if (lottieContainer) {
        const anim = lottie.loadAnimation({
            container: lottieContainer,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            path: 'data-animation.json'
        });

        anim.addEventListener('DOMLoaded', () => {
            ScrollTrigger.create({
                trigger: '#contact',
                start: 'top 80%',
                end: 'bottom center',
                scrub: true,
                onUpdate: self => {
                    anim.goToAndStop(self.progress * (anim.totalFrames - 1), true);
                }
            });
        });
    }

    // 5. HTML5 Canvas Particle System (Server Rack assembly on scroll)
    initCanvasParticles();
}

function initCanvasParticles() {
    // ==========================================
    // GLOBAL BACKGROUND CANVAS — LOTUS DOT SYSTEM
    // ==========================================
    const bgCanvas = document.getElementById('particleCanvas');
    if (!bgCanvas) return;
    const bgCtx = bgCanvas.getContext('2d');
    let bgWidth, bgHeight;
    let dots = [];
    const DOT_COUNT = 5;

    // Mouse tracking for dot interaction
    const mouse = { x: -1000, y: -1000, isOverCard: false };

    function initDots() {
        dots = [];
        for (let i = 0; i < DOT_COUNT; i++) {
            dots.push({
                x: Math.random() * bgWidth,
                y: Math.random() * bgHeight,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 4 + 6, // Slightly larger for flowers
                baseSpeed: Math.random() * 0.5 + 0.2,
                packedTicks: 0,
                explosionRevertTimer: 0,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02
            });
        }
    }

    function drawLotusFlower(ctx, x, y, size, packedTicks, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Scale factor
        const s = (size / 10) * (1 + Math.min(0.4, packedTicks / 150));
        ctx.scale(s, s);

        // Petal drawing helper
        function drawPetal(angle, length, width, color) {
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-width, -length / 2, -width / 2, -length, 0, -length);
            ctx.bezierCurveTo(width / 2, -length, width, -length / 2, 0, 0);
            ctx.fill();
            ctx.restore();
        }

        // 1. Teal base leaves
        const leafBlue = '#2d8e9e';
        drawPetal(Math.PI / 1.8, 14, 5, leafBlue);
        drawPetal(-Math.PI / 1.8, 14, 5, leafBlue);

        // 2. Blue petals (layered)
        const lotusBlue = '#4a9ff5'; // Vibrant blue
        const lotusIndigo = '#6366f1'; // Deeper indigo for depth

        // Back petals
        drawPetal(Math.PI / 3.5, 12, 6, lotusIndigo);
        drawPetal(-Math.PI / 3.5, 12, 6, lotusIndigo);

        // Mid petals
        drawPetal(Math.PI / 6, 16, 7, lotusBlue);
        drawPetal(-Math.PI / 6, 16, 7, lotusBlue);

        // Center main petal
        drawPetal(0, 20, 8, lotusBlue);

        ctx.restore();
    }

    function updateMouseContext(e) {
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);

        if (x !== undefined && y !== undefined) {
            mouse.x = x;
            mouse.y = y;

            const target = document.elementFromPoint(x, y);
            mouse.isOverCard = !!(target && target.closest('.service-card, .hero-card, .cta-terminal, .learn-card, .floating-notepad, .glass-nav'));
        }
    }

    window.addEventListener('mousemove', updateMouseContext);
    window.addEventListener('touchmove', updateMouseContext, { passive: true });
    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
        mouse.isOverCard = false;
    });

    function triggerDotExplosion(cX, cY) {
        dots.forEach(p => {
            const dx = p.x - cX;
            const dy = p.y - cY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const forceRadius = 400;

            if (dist < forceRadius) {
                const force = (forceRadius - dist) / forceRadius;
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force * 35;
                p.vy += Math.sin(angle) * force * 35;
                p.explosionRevertTimer = 80;
            }
        });
    }



    window.addEventListener('pointerdown', (e) => {
        if (e.target.closest('button, a, textarea, input, .card-canvas, .floating-notepad')) return;
        triggerDotExplosion(e.clientX, e.clientY);
    });

    function resizeGlobal() {
        bgWidth = bgCanvas.width = window.innerWidth;
        bgHeight = bgCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeGlobal);
    resizeGlobal();
    initDots();



    function animateGlobal() {
        bgCtx.clearRect(0, 0, bgWidth, bgHeight);
        const now = Date.now();

        // Update and draw floating lotus dots
        const isLight = document.body.getAttribute('data-theme') === 'light';
        const accentColor = getComputedStyle(document.body).getPropertyValue('--accent-color').trim() || '#e9fd8e';

        dots.forEach(p => {
            const dx = mouse.x - p.x;
            const dy = mouse.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Luminosity/Glow logic
            if (p.explosionRevertTimer > 0) {
                p.explosionRevertTimer--;
                p.packedTicks = 0;
            } else if (!mouse.isOverCard && dist < 120) {
                p.packedTicks = (p.packedTicks || 0) + 1;
            } else {
                p.packedTicks = Math.max(0, (p.packedTicks || 0) - 1);
            }

            bgCtx.save();
            bgCtx.globalAlpha = isLight ? 0.4 : 0.8;
            bgCtx.fillStyle = accentColor;
            bgCtx.shadowColor = accentColor;

            const glowBonus = Math.min(50, (p.packedTicks || 0) / 3);
            bgCtx.shadowBlur = (isLight ? 5 : 12) + glowBonus;

            const friction = mouse.isOverCard ? 0.985 : 0.96;
            p.vx *= friction;
            p.vy *= friction;

            p.x += p.vx + (Math.sin(now / 1000 + p.size) * p.baseSpeed);
            p.y += p.vy + (Math.cos(now / 1000 + p.size) * p.baseSpeed);
            p.rotation += p.rotationSpeed;

            if (p.x < 0) p.x = bgWidth;
            if (p.x > bgWidth) p.x = 0;
            if (p.y < 0) p.y = bgHeight;
            if (p.y > bgHeight) p.y = 0;

            drawLotusFlower(bgCtx, p.x, p.y, p.size, p.packedTicks, p.rotation);
            bgCtx.restore();
        });

        requestAnimationFrame(animateGlobal);
    }

    resizeGlobal();
    animateGlobal();


    // Local card simulations removed for new detailing pricing layout
}




/// Toggle between light and dark theme
function toggleTheme() {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    setTheme(next);
}

/// Apply a named theme to the page and persist it
function setTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('aura-theme', themeName);

    // Update icons for the theme toggle button
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');
    if (sunIcon && moonIcon) {
        if (themeName === 'light') {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Turn off glow if switching to light mode
    if (themeName === 'light') {
        document.body.classList.remove('bg-glow');
    }

    // Mark active theme button (if any old ones exist)
    document.querySelectorAll('.theme-btn').forEach(btn => {
        const action = btn.getAttribute('onclick');
        if (action) {
            const isActive = action.includes(`'${themeName}'`);
            btn.classList.toggle('active', isActive);
        }
    });
}

/// Randomize the philosopher quote at the bottom of the page
function initQuotes() {
    const quotes = [
        { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
        { text: "Everything has beauty, but not everyone sees it.", author: "Confucius" },
        { text: "The unexamined life is not worth living.", author: "Socrates" },
        { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
        { text: "Happiness depends upon ourselves.", author: "Aristotle" },
        { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
        { text: "The secret of happiness is not found in seeking more, but in developing the capacity to enjoy less.", author: "Socrates" },
        { text: "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.", author: "Jean-Paul Sartre" },
        { text: "The mind is furnished with ideas by experience alone.", author: "John Locke" },
        { text: "Act only according to that maxim whereby you can will that it should become a universal law.", author: "Immanuel Kant" },
        { text: "Life must be understood backward. But it must be lived forward.", author: "Søren Kierkegaard" },
        { text: "The greater the difficulty, the more glory in surmounting it.", author: "Epicurus" }
    ];

    const quoteText = document.getElementById('quoteText');
    const quoteAuthor = document.getElementById('quoteAuthor');

    if (quoteText && quoteAuthor) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        const selected = quotes[randomIndex];
        quoteText.textContent = selected.text;
        quoteAuthor.textContent = `— ${selected.author}`;
    }
}

/// Initialize service card slideshows with automatic crossfade, manual navigation, and lightbox
function initServiceSlideshows() {
    const containers = document.querySelectorAll('.slideshow-container');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.querySelector('.lightbox-close');

    // Lightbox close functionality
    if (lightboxClose && lightbox) {
        lightboxClose.onclick = () => lightbox.style.display = 'none';
        lightbox.onclick = (e) => {
            if (e.target !== lightboxImg) {
                lightbox.style.display = 'none';
            }
        };
    }

    containers.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        if (slides.length <= 1) return;

        let currentSlide = 0;
        let slideInterval;

        const showSlide = (index) => {
            slides[currentSlide].classList.remove('active');
            currentSlide = (index + slides.length) % slides.length;
            slides[currentSlide].classList.add('active');
        };

        const nextSlide = () => showSlide(currentSlide + 1);
        const prevSlide = () => showSlide(currentSlide - 1);

        const startSlideshow = () => {
            stopSlideshow();
            slideInterval = setInterval(nextSlide, 5000);
        };

        const stopSlideshow = () => {
            if (slideInterval) clearInterval(slideInterval);
        };

        // Arrows navigation
        const prevBtn = container.querySelector('.prev-arrow');
        const nextBtn = container.querySelector('.next-arrow');

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                prevSlide();
                startSlideshow(); // Reset timer after manual interaction
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                nextSlide();
                startSlideshow(); // Reset timer after manual interaction
            });
        }

        // Lightbox image expansion
        slides.forEach((slide, index) => {
            slide.addEventListener('click', () => {
                const imgSources = Array.from(slides).map(s => s.src);
                if (window.openLightbox) {
                    window.openLightbox(imgSources, index);
                }
            });
        });

        // Start automatic rotation
        startSlideshow();
    });
}

// =============================================
// Gallery Expander & Filtering
// =============================================
function initGalleryExpander() {
    const dropdownBtn = document.getElementById('galleryDropdownBtn');
    const dropdownMenu = document.getElementById('galleryDropdownMenu');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const fullGrid = document.getElementById('fullGalleryGrid');
    const previewGrid = document.querySelector('.preview-grid');

    if (!dropdownBtn || !fullGrid) return;

    // Make preview images clickable
    if (previewGrid) {
        const previewImgs = previewGrid.querySelectorAll('.gallery-img');
        const previewSources = Array.from(previewImgs).map(img => img.src);
        previewImgs.forEach((img, index) => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', () => {
                if (window.openLightbox) {
                    window.openLightbox(previewSources, index);
                }
            });
        });
    }

    dropdownBtn.addEventListener('click', () => {
        const isGridVisible = !fullGrid.classList.contains('hidden');
        
        // If grid is already open, and we click the button, let's toggle it closed
        if (isGridVisible) {
            fullGrid.classList.add('hidden');
            previewGrid.classList.remove('hidden');
            dropdownBtn.querySelector('span').textContent = 'View All Categories';
            dropdownBtn.classList.remove('active');
            dropdownMenu.classList.add('hidden');
            return;
        }

        const isHidden = dropdownMenu.classList.toggle('hidden');
        dropdownBtn.classList.toggle('active', !isHidden);
        
        if (!isHidden && fullGrid.innerHTML === '') {
            renderGallery('all');
            fullGrid.classList.remove('hidden');
            previewGrid.classList.add('hidden');
            dropdownBtn.querySelector('span').textContent = 'All Projects';
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            
            // Update UI
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            dropdownMenu.classList.add('hidden');
            dropdownBtn.classList.remove('active');
            dropdownBtn.querySelector('span').textContent = btn.textContent;

            // Render
            renderGallery(filter);
            fullGrid.classList.remove('hidden');
            previewGrid.classList.add('hidden');

            // Scroll slightly to grid if it was hidden
            fullGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    function renderGallery(category) {
        const data = window.photoData;
        if (!data) return;

        let photos = [];
        if (category === 'all') {
            photos = [...data.design, ...data.construction, ...data.maintenance];
        } else {
            photos = data[category] || [];
        }

        fullGrid.innerHTML = '';
        const allSources = photos; // photos is already an array of sources
        photos.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item glass-card fade-in visible';
            
            const img = document.createElement('img');
            img.src = src;
            img.alt = `Gallery Project ${index + 1}`;
            img.className = 'gallery-img';
            img.loading = 'lazy';
            
            img.addEventListener('click', () => {
                if (window.openLightbox) {
                    window.openLightbox(allSources, index);
                }
            });

            item.appendChild(img);
            fullGrid.appendChild(item);
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
            dropdownBtn.classList.remove('active');
        }
    });
}

/// Set the music button to a given state: 'play', 'pause', or 'replay'
function setMusicIcon(state) {
    document.getElementById('musicPlayIcon').style.display   = state === 'play'   ? '' : 'none';
    document.getElementById('musicPauseIcon').style.display  = state === 'pause'  ? '' : 'none';
    document.getElementById('musicReplayIcon').style.display = state === 'replay' ? '' : 'none';

    const btn = document.getElementById('musicToggleBtn');
    btn.classList.toggle('playing', state === 'pause');
    btn.title = state === 'replay' ? 'Replay' : state === 'pause' ? 'Pause' : 'Play';
}

/// Single handler for the music button — play, pause, or replay depending on state
function handleMusicBtn() {
    const audio = document.getElementById('bgMusic');

    if (audio.ended || (audio.paused && audio.currentTime === 0 && document.getElementById('musicReplayIcon').style.display !== 'none')) {
        // Replay
        audio.currentTime = 0;
        audio.play()
            .then(() => setMusicIcon('pause'))
            .catch(err => {
                console.error("Replay failed:", err);
                alert("Click anywhere on the page first to allow music playback!");
            });
    } else if (audio.paused) {
        audio.play()
            .then(() => setMusicIcon('pause'))
            .catch(err => {
                console.error("Audio playback failed:", err);
                alert("Click anywhere on the page first to allow music playback!");
            });
    } else {
        audio.pause();
        setMusicIcon('play');
    }
}

/// Wire up the ended event once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const audio = document.getElementById('bgMusic');
    if (audio) {
        audio.addEventListener('ended', () => setMusicIcon('replay'));
    }
});
