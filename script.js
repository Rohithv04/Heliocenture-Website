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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    // Group elements by section to stagger their fade-ins
    const sections = document.querySelectorAll('.section, .hero, .guarantee-grid, .clients-floater');
    sections.forEach(section => {
        const fadeElements = section.querySelectorAll('.fade-up');
        fadeElements.forEach((el, index) => {
            // Apply stagger delay dynamically if not already set
            if (!el.style.transitionDelay) {
                el.style.transitionDelay = `${index * 100}ms`;
            }
            fadeObserver.observe(el);
        });
    });

    // ==========================================
    // PREMIUM HERO SECTION ANIMATIONS (GSAP)
    // ==========================================
    const heroNew = document.querySelector('.hero-new');
    const icons = document.querySelectorAll('.social-icon-wrapper');
    
    if (heroNew && icons.length > 0) {
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
            // Get wrapper center position relative to the hero container
            const iconLeft = icon.offsetLeft + icon.offsetWidth / 2;
            const iconTop = icon.offsetTop + icon.offsetHeight / 2;
            
            // Calculate displacement vector from the center
            const deltaX = iconLeft - heroCenterX;
            const deltaY = iconTop - heroCenterY;
            
            // Blast out from center to absolute layouts
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
            if (window.innerWidth <= 991) return;
            
            // Normalize mouse coordinates between -1 and 1
            mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            mouseY = (e.clientY / window.innerHeight) * 2 - 1;

            // Trigger temporary glitched trail on mouse speed/direction
            if (isBlasted && lastMouseX !== null && lastMouseY !== null) {
                const deltaX = e.clientX - lastMouseX;
                const deltaY = e.clientY - lastMouseY;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                         // Only trigger if mouse moves faster than threshold to look professional
                if (distance > 4) {
                    const shiftX = Math.max(-28, Math.min(deltaX * 0.8, 28));
                    const shiftY = Math.max(-28, Math.min(deltaY * 0.8, 28));
                    
                    icons.forEach((icon) => {
                        const orangeLayer = icon.querySelector('.glitch-orange');
                        
                        if (orangeLayer) {
                            gsap.killTweensOf(orangeLayer);
                            
                            // Displace layer as a trail opposite to cursor direction
                            gsap.set(orangeLayer, {
                                x: -shiftX,
                                y: -shiftY,
                                opacity: 0.75,
                                scale: 1.06
                            });
                            
                            // Return to normal and fade out smoothly
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
        });
 
        // 3D Parallax Loop
        gsap.ticker.add(() => {
            if (window.innerWidth <= 991 || !isBlasted) return;
            
            icons.forEach((icon, index) => {
                const depth = parseFloat(icon.getAttribute('data-depth')) || 0.5;
                const side = icon.getAttribute('data-side') || 'left';
                const directionMultiplier = side === 'left' ? 1 : -1;
                
                // Add a mild floating offset (sine wave over time, offset per icon index)
                const time = Date.now() * 0.0015;
                const floatX = Math.sin(time + index) * 12 * depth;
                const floatY = Math.cos(time * 0.8 + index) * 18 * depth;
                const floatRotate = Math.sin(time * 0.5 + index) * 3;
                
                const targetX = (mouseX * 90 * depth * directionMultiplier) + floatX;
                const targetY = (mouseY * 90 * depth * directionMultiplier) + floatY;
                const targetRotate = (mouseX * 24 * depth * directionMultiplier) + floatRotate;
                
                // Translate & rotate wrapper
                gsap.to(icon, {
                    x: targetX,
                    y: targetY,
                    rotation: targetRotate,
                    duration: 0.8,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });
 
                // Holographic card tilt
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
    // STICKY STACKING CARDS — Scroll-Linked Depth
    // ==========================================
    const stackingCards = document.querySelectorAll('.stacking-card');

    if (stackingCards.length > 0) {
        // Prevent horizontal overflow without using overflow-x:hidden on body
        // (which kills position:sticky). Instead, clip at the root level.
        document.documentElement.style.overflowX = 'clip';

        const handleStackingScroll = () => {
            stackingCards.forEach((card, index) => {
                // Only animate cards that have a card stacking on top of them
                if (index >= stackingCards.length - 1) return;

                const nextCard = stackingCards[index + 1];
                const cardRect = card.getBoundingClientRect();
                const nextRect = nextCard.getBoundingClientRect();

                // The vh gap between adjacent sticky tops (e.g., 12vh - 10vh = 2vh)
                const vhGap = 2 * (window.innerHeight / 100);

                // Distance from the top of this card to the top of the next card
                const distance = nextRect.top - cardRect.top;

                // Max distance is approximately the card height (before overlap starts)
                const maxDist = cardRect.height;

                // Clamp distance between the vh gap (fully overlapped) and maxDist (no overlap)
                const clampedDist = Math.max(vhGap, Math.min(distance, maxDist));

                // Progress: 0 = no overlap, 1 = fully stacked
                const progress = 1 - (clampedDist - vhGap) / (maxDist - vhGap);

                // Scale: 1.0 → 0.95 as it gets covered
                const scale = 1 - (0.05 * progress);
                // Opacity: 1.0 → 0.8 as it gets covered
                const opacity = 1 - (0.2 * progress);
                // Shadow intensifies on the covering card
                const shadowProgress = Math.min(progress * 2, 1);

                card.style.transform = `scale(${scale})`;
                card.style.transformOrigin = 'top center';
                card.style.opacity = opacity;

                // Add a deeper shadow to the next card as it slides over
                nextCard.querySelector('.stacking-card-inner').style.boxShadow =
                    `0 ${4 + 16 * shadowProgress}px ${24 + 24 * shadowProgress}px rgba(0, 0, 0, ${0.06 + 0.08 * shadowProgress})`;
            });
        };

        window.addEventListener('scroll', handleStackingScroll, { passive: true });
        // Initial call to set correct state if user refreshes mid-page
        handleStackingScroll();
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
                    setTimeout(() => item.classList.add('visible'), 50);
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

});
