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

    // Initial Hero Load Sequence (if above fold)
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero .fade-up');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 100);
        });
    }, 100);

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
            let loadedCount = 0;
            let imagesToLoad = [];

            portfolioItems.forEach(item => {
                if (item.dataset.category === category) {
                    const img = item.querySelector('img');
                    if (!img.complete) {
                        imagesToLoad.push(img);
                    }
                }
            });

            const displayItems = () => {
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

            if (imagesToLoad.length > 0) {
                if (portfolioLoader) portfolioLoader.style.display = 'flex';
                portfolioItems.forEach(item => {
                    item.classList.remove('visible');
                    item.classList.remove('show');
                });

                let loaded = 0;
                imagesToLoad.forEach(img => {
                    img.onload = img.onerror = () => {
                        loaded++;
                        if (loaded === imagesToLoad.length) {
                            displayItems();
                        }
                    };
                });
            } else {
                displayItems();
            }
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
