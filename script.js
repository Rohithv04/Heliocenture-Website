document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileOverlay = document.querySelector('.mobile-overlay');

    if (menuToggle && mobileOverlay) {
        const closeBtn = mobileOverlay.querySelector('.close-mobile-menu');

        menuToggle.addEventListener('click', () => {
            mobileOverlay.classList.toggle('active');
            menuToggle.innerHTML = mobileOverlay.classList.contains('active') ? '✕' : '☰';
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                mobileOverlay.classList.remove('active');
                menuToggle.innerHTML = '☰';
            });
        }

        const mobileLinks = mobileOverlay.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileOverlay.classList.remove('active');
                menuToggle.innerHTML = '☰';
            });
        });
    }

    // Intersection Observer for Fade Elements
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.05, rootMargin: '0px 0px 80px 0px' });

    // Group elements by section to stagger their fade-ins with capped delays
    const sections = document.querySelectorAll('.section, .hero, .guarantee-grid, .clients-floater');
    sections.forEach(section => {
        const fadeElements = section.querySelectorAll('.fade-up');
        fadeElements.forEach((el, index) => {
            if (!el.style.transitionDelay) {
                el.style.transitionDelay = `${Math.min(index * 60, 240)}ms`;
            }
            fadeObserver.observe(el);
        });
    });

    // ==========================================
    // PREMIUM HERO SECTION ANIMATIONS (GSAP)
    // ==========================================
    const heroNew = document.querySelector('.hero-new');
    const icons = document.querySelectorAll('.social-icon-wrapper');
    
    if (heroNew && icons.length > 0 && typeof gsap !== 'undefined') {
        // Track whether hero is visible to pause background tickers
        let isHeroInView = true;
        const heroObserver = new IntersectionObserver((entries) => {
            isHeroInView = entries[0].isIntersecting;
        }, { threshold: 0 });
        heroObserver.observe(heroNew);

        // Stagger fade-in the text and CTA buttons
        gsap.to('.fade-up-hero', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            stagger: 0.15,
            ease: 'power3.out'
        });

        // Calculate center of hero and blast social icon wraps
        const heroRect = heroNew.getBoundingClientRect();
        const heroCenterX = heroRect.width / 2;
        const heroCenterY = heroRect.height / 2;
        
        let completedCount = 0;
        let isBlasted = false;

        icons.forEach((icon) => {
            const iconLeft = icon.offsetLeft + icon.offsetWidth / 2;
            const iconTop = icon.offsetTop + icon.offsetHeight / 2;
            
            const deltaX = iconLeft - heroCenterX;
            const deltaY = iconTop - heroCenterY;
            
            gsap.fromTo(icon, 
                {
                    x: -deltaX,
                    y: -deltaY,
                    scale: 0,
                    opacity: 0,
                    rotation: Math.random() * 90 - 45
                },
                {
                    x: 0,
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    rotation: Math.random() * 20 - 10,
                    duration: 1.8,
                    ease: 'power4.out',
                    delay: 0.4 + Math.random() * 0.3,
                    onComplete: () => {
                        completedCount++;
                        if (completedCount === icons.length) {
                            isBlasted = true;
                        }
                    }
                }
            );
        });

        // Mouse Parallax & Dynamic Glitch Trail variables
        let mouseX = 0;
        let mouseY = 0;
        let lastMouseX = null;
        let lastMouseY = null;

        window.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 991 || !isHeroInView) return;
            
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;

            if (isBlasted && lastMouseX !== null && lastMouseY !== null) {
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                if (distance > 4) {
                    const shiftX = Math.max(-28, Math.min(deltaX * 0.8, 28));
                    const shiftY = Math.max(-28, Math.min(deltaY * 0.8, 28));
                    
                    icons.forEach((icon) => {
                        const orangeLayer = icon.querySelector('.glitch-orange');
                        if (orangeLayer) {
                            gsap.killTweensOf(orangeLayer);
                            gsap.set(orangeLayer, {
                                x: -shiftX,
                                y: -shiftY,
                                opacity: 0.75,
                                scale: 1.06
                            });
                            gsap.to(orangeLayer, {
                                x: 0,
                                y: 0,
                                opacity: 0,
                                scale: 1,
                                duration: 0.4,
                                ease: 'power2.out'
                            });
                        }
                    });
                }
            }
            
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
        }, { passive: true });

        // 3D Parallax Loop — Pauses when hero is scrolled off-screen
        gsap.ticker.add(() => {
            if (window.innerWidth <= 991 || !isBlasted || !isHeroInView) return;
            
            const time = Date.now() * 0.0015;

            icons.forEach((icon, index) => {
                const depth = parseFloat(icon.getAttribute('data-depth')) || 0.5;
                const side = icon.getAttribute('data-side') || 'left';
                const directionMultiplier = side === 'left' ? 1 : -1;
                
                const floatX = Math.sin(time + index) * 12 * depth;
                const floatY = Math.cos(time * 0.8 + index) * 18 * depth;
                const floatRotate = Math.sin(time * 0.5 + index) * 3;
                
                const targetX = (mouseX * 90 * depth * directionMultiplier) + floatX;
                const targetY = (mouseY * 90 * depth * directionMultiplier) + floatY;
                const targetRotate = (mouseX * 24 * depth * directionMultiplier) + floatRotate;
                
                gsap.to(icon, {
                    x: targetX,
                    y: targetY,
                    rotation: targetRotate,
                    duration: 0.8,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });

                const card = icon.querySelector('.social-icon-card');
                if (card) {
                    const tiltX = -mouseY * 22;
                    const tiltY = mouseX * 22;
                    gsap.to(card, {
                        rotateX: tiltX,
                        rotateY: tiltY,
                        duration: 0.6,
                        ease: 'power1.out',
                        overwrite: 'auto'
                    });
                }
            });
        });
    }

    // ==========================================
    // STICKY STACKING CARDS — Optimized Scroll Pipeline
    // ==========================================
    const stackingCards = document.querySelectorAll('.stacking-card');

    if (stackingCards.length > 0) {
        document.documentElement.style.overflowX = 'clip';

        const cardsData = Array.from(stackingCards).map(card => {
            card.style.transformOrigin = 'top center';
            return {
                card,
                inner: card.querySelector('.stacking-card-inner'),
                lastScale: null,
                lastOpacity: null
            };
        });

        // Only compute card stacking geometry when the section is in/near the viewport
        let isStackingInView = false;
        const stackingTrack = document.querySelector('.stacking-track') || stackingCards[0].parentElement;
        if (stackingTrack) {
            const trackObserver = new IntersectionObserver((entries) => {
                isStackingInView = entries[0].isIntersecting;
                if (isStackingInView) scheduleStackingUpdate();
            }, { rootMargin: '300px 0px' });
            trackObserver.observe(stackingTrack);
        }

        let ticking = false;
        const handleStackingScroll = () => {
            if (!isStackingInView) return;

            // Phase 1: BATCH ALL DOM READS FIRST (prevents forced layout thrashing)
            const vhGap = 2 * (window.innerHeight / 100);
            const rects = cardsData.map(c => c.card.getBoundingClientRect());

            // Phase 2: BATCH ALL DOM WRITES (smooth compositor execution)
            for (let i = 0; i < cardsData.length - 1; i++) {
                const cardRect = rects[i];
                const nextRect = rects[i + 1];
                const distance = nextRect.top - cardRect.top;
                const maxDist = cardRect.height;
                const clampedDist = Math.max(vhGap, Math.min(distance, maxDist));
                const progress = 1 - (clampedDist - vhGap) / (maxDist - vhGap);

                const scale = Math.round((1 - (0.05 * progress)) * 1000) / 1000;
                const opacity = Math.round((1 - (0.2 * progress)) * 100) / 100;

                const c = cardsData[i];
                if (c.lastScale !== scale || c.lastOpacity !== opacity) {
                    c.card.style.transform = `scale3d(${scale}, ${scale}, 1)`;
                    c.card.style.opacity = opacity;
                    c.lastScale = scale;
                    c.lastOpacity = opacity;
                }
            }
        };

        const scheduleStackingUpdate = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    handleStackingScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scheduleStackingUpdate, { passive: true });
        scheduleStackingUpdate();
    }

    // ==========================================
    // PORTFOLIO TABS & PRELOADER
    // ==========================================
    const portfolioTabs = document.querySelectorAll('.portfolio-tab');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioLoader = document.getElementById('portfolio-loader');

    if (portfolioTabs.length > 0 && portfolioItems.length > 0) {
        const showCategory = (category) => {
            const portfolioGrid = document.getElementById('portfolio-grid');
            if (portfolioGrid) {
                if (category === 'websites') {
                    portfolioGrid.classList.add('websites-active');
                } else {
                    portfolioGrid.classList.remove('websites-active');
                }
            }

            if (portfolioLoader) portfolioLoader.style.display = 'none';

            portfolioItems.forEach(item => {
                if (item.dataset.category === category) {
                    item.classList.add('show');
                    requestAnimationFrame(() => item.classList.add('visible'));
                } else {
                    item.classList.remove('visible');
                    item.classList.remove('show');
                }
            });
        };

        portfolioTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                portfolioTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                showCategory(tab.dataset.target);
            });
        });

        // Initialize first tab
        showCategory('logos');
    }

    // ==========================================
    // SILKY IN-PAGE ANCHOR NAVIGATION
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#' || !href) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
