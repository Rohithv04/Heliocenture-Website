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
    // PORTFOLIO TABS, PRELOADER & REEL ENGINE
    // ==========================================
    const portfolioTabs = document.querySelectorAll('.portfolio-tab');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const portfolioLoader = document.getElementById('portfolio-loader');
    const previewVideos = document.querySelectorAll('.reel-preview-video');

    if (portfolioTabs.length > 0 && portfolioItems.length > 0) {
        let currentActiveCategory = 'logos';

        const playPreviewVideos = () => {
            previewVideos.forEach(v => {
                v.muted = true;
                const p = v.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {});
                }
            });
        };

        const pausePreviewVideos = () => {
            previewVideos.forEach(v => {
                v.pause();
            });
        };

        const showCategory = (category) => {
            currentActiveCategory = category;
            const portfolioGrid = document.getElementById('portfolio-grid');
            if (portfolioGrid) {
                if (category === 'websites') {
                    portfolioGrid.classList.add('websites-active');
                    portfolioGrid.classList.remove('videos-active');
                } else if (category === 'videos') {
                    portfolioGrid.classList.add('videos-active');
                    portfolioGrid.classList.remove('websites-active');
                } else {
                    portfolioGrid.classList.remove('websites-active');
                    portfolioGrid.classList.remove('videos-active');
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

            if (category === 'videos') {
                playPreviewVideos();
            } else {
                pausePreviewVideos();
            }
        };

        portfolioTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                portfolioTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                showCategory(tab.dataset.target);
            });
        });

        // Initialize based on URL hash (e.g. portfolio.html#videos) or default to logos
        const urlHash = window.location.hash.replace('#', '');
        const validCategories = ['logos', 'smm', 'ads', 'videos', 'websites'];
        if (urlHash && validCategories.includes(urlHash)) {
            const matchingTab = document.querySelector(`.portfolio-tab[data-target="${urlHash}"]`);
            if (matchingTab) {
                portfolioTabs.forEach(t => t.classList.remove('active'));
                matchingTab.classList.add('active');
                showCategory(urlHash);
            } else {
                showCategory('logos');
            }
        } else {
            showCategory('logos');
        }

        // ==========================================
        // FULLSCREEN REEL MODAL PLAYER CONTROLLER
        // ==========================================
        const reelsModal = document.getElementById('reels-modal');
        const reelsModalTrack = document.getElementById('reels-modal-track');
        const reelsCloseBtn = document.getElementById('reels-close-btn');
        const reelsBackdrop = document.getElementById('reels-modal-backdrop');
        const reelsCounter = document.getElementById('reels-counter');
        const reelsPrevBtn = document.getElementById('reels-prev-btn');
        const reelsNextBtn = document.getElementById('reels-next-btn');

        if (reelsModal && reelsModalTrack) {
            const modalSlides = reelsModalTrack.querySelectorAll('.reels-modal-slide');
            const totalSlides = modalSlides.length;
            let currentSlideIndex = 0;
            let globalMutedState = false; // Opens unmuted for rich reel experience!

            const formatTime = (seconds) => {
                if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
                const m = Math.floor(seconds / 60);
                const s = Math.floor(seconds % 60);
                return `${m}:${s < 10 ? '0' : ''}${s}`;
            };

            const updateSoundButtonUI = (btn, isMuted) => {
                if (!btn) return;
                const iconOn = btn.querySelector('.sound-icon-on');
                const iconOff = btn.querySelector('.sound-icon-off');
                if (iconOn && iconOff) {
                    iconOn.style.display = isMuted ? 'none' : 'block';
                    iconOff.style.display = isMuted ? 'block' : 'none';
                }
            };

            const triggerRippleFeedback = (slide, type) => {
                const feedbackEl = slide.querySelector('.reel-center-feedback');
                if (!feedbackEl) return;
                const playIcon = feedbackEl.querySelector('.feedback-play');
                const pauseIcon = feedbackEl.querySelector('.feedback-pause');
                if (playIcon && pauseIcon) {
                    playIcon.style.display = type === 'play' ? 'block' : 'none';
                    pauseIcon.style.display = type === 'pause' ? 'block' : 'none';
                }
                feedbackEl.classList.add('show-feedback');
                setTimeout(() => {
                    feedbackEl.classList.remove('show-feedback');
                }, 400);
            };

            // Setup each slide's interactive controls & timeplayer
            modalSlides.forEach((slide, idx) => {
                const video = slide.querySelector('.modal-reel-video');
                const timeElapsed = slide.querySelector('.time-elapsed');
                const timeTotal = slide.querySelector('.time-total');
                const scrubberBar = slide.querySelector('.reel-scrubber-bar');
                const scrubberProgress = slide.querySelector('.reel-scrubber-progress');
                const scrubberBuffered = slide.querySelector('.reel-scrubber-buffered');
                const miniPlayBtn = slide.querySelector('.reel-mini-play-btn');
                const soundBtn = slide.querySelector('.reel-sound-btn');

                if (!video) return;

                // Time and Scrubber updating
                const updateScrubber = () => {
                    if (video.duration) {
                        const pct = (video.currentTime / video.duration) * 100;
                        if (scrubberProgress) scrubberProgress.style.width = `${pct}%`;
                        if (timeElapsed) timeElapsed.textContent = formatTime(video.currentTime);
                    }
                };

                video.addEventListener('loadedmetadata', () => {
                    if (timeTotal) timeTotal.textContent = formatTime(video.duration);
                    updateScrubber();
                });

                video.addEventListener('timeupdate', updateScrubber);

                video.addEventListener('progress', () => {
                    if (video.buffered.length > 0 && video.duration) {
                        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
                        const pct = (bufferedEnd / video.duration) * 100;
                        if (scrubberBuffered) scrubberBuffered.style.width = `${pct}%`;
                    }
                });

                // Play / Pause toggle
                const togglePlayPause = () => {
                    if (video.paused) {
                        video.play().catch(() => {});
                        triggerRippleFeedback(slide, 'play');
                        if (miniPlayBtn) {
                            const p1 = miniPlayBtn.querySelector('.mini-pause-icon');
                            const p2 = miniPlayBtn.querySelector('.mini-play-icon');
                            if (p1 && p2) { p1.style.display = 'block'; p2.style.display = 'none'; }
                        }
                    } else {
                        video.pause();
                        triggerRippleFeedback(slide, 'pause');
                        if (miniPlayBtn) {
                            const p1 = miniPlayBtn.querySelector('.mini-pause-icon');
                            const p2 = miniPlayBtn.querySelector('.mini-play-icon');
                            if (p1 && p2) { p1.style.display = 'none'; p2.style.display = 'block'; }
                        }
                    }
                };

                video.addEventListener('click', togglePlayPause);
                if (miniPlayBtn) {
                    miniPlayBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        togglePlayPause();
                    });
                }

                // Sound Toggle
                if (soundBtn) {
                    updateSoundButtonUI(soundBtn, globalMutedState);
                    soundBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        globalMutedState = !globalMutedState;
                        video.muted = globalMutedState;
                        modalSlides.forEach(s => {
                            const btn = s.querySelector('.reel-sound-btn');
                            updateSoundButtonUI(btn, globalMutedState);
                            const v = s.querySelector('.modal-reel-video');
                            if (v) v.muted = globalMutedState;
                        });
                    });
                }

                // Interactive Seeking / Dragging on Scrubber Rail
                if (scrubberBar) {
                    let isScrubbing = false;

                    const scrubToPosition = (clientX) => {
                        const rect = scrubberBar.getBoundingClientRect();
                        const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                        if (video.duration) {
                            video.currentTime = pos * video.duration;
                            if (scrubberProgress) scrubberProgress.style.width = `${pos * 100}%`;
                            if (timeElapsed) timeElapsed.textContent = formatTime(video.currentTime);
                        }
                    };

                    scrubberBar.addEventListener('pointerdown', (e) => {
                        e.stopPropagation();
                        isScrubbing = true;
                        scrubberBar.classList.add('is-scrubbing');
                        scrubberBar.setPointerCapture(e.pointerId);
                        scrubToPosition(e.clientX);
                    });

                    scrubberBar.addEventListener('pointermove', (e) => {
                        if (isScrubbing) {
                            scrubToPosition(e.clientX);
                        }
                    });

                    const stopScrubbing = (e) => {
                        if (isScrubbing) {
                            isScrubbing = false;
                            scrubberBar.classList.remove('is-scrubbing');
                            try { scrubberBar.releasePointerCapture(e.pointerId); } catch (_) {}
                        }
                    };

                    scrubberBar.addEventListener('pointerup', stopScrubbing);
                    scrubberBar.addEventListener('pointercancel', stopScrubbing);
                }
            });

            // Activate and play slide at index
            const activateSlide = (targetIndex, smooth = true) => {
                if (targetIndex < 0) targetIndex = 0;
                if (targetIndex >= totalSlides) targetIndex = totalSlides - 1;
                currentSlideIndex = targetIndex;

                const targetSlide = modalSlides[targetIndex];
                if (!targetSlide) return;

                // Update Counter
                if (reelsCounter) {
                    reelsCounter.textContent = `${targetIndex + 1} / ${totalSlides}`;
                }

                // Scroll modal track to target slide
                targetSlide.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });

                // Manage video play/pause
                modalSlides.forEach((slide, idx) => {
                    const video = slide.querySelector('.modal-reel-video');
                    const miniPlayBtn = slide.querySelector('.reel-mini-play-btn');
                    if (!video) return;

                    if (idx === targetIndex) {
                        video.muted = globalMutedState;
                        const p = video.play();
                        if (p && typeof p.catch === 'function') p.catch(() => {});
                        if (miniPlayBtn) {
                            const p1 = miniPlayBtn.querySelector('.mini-pause-icon');
                            const p2 = miniPlayBtn.querySelector('.mini-play-icon');
                            if (p1 && p2) { p1.style.display = 'block'; p2.style.display = 'none'; }
                        }
                    } else {
                        video.pause();
                        video.currentTime = 0;
                        if (miniPlayBtn) {
                            const p1 = miniPlayBtn.querySelector('.mini-pause-icon');
                            const p2 = miniPlayBtn.querySelector('.mini-play-icon');
                            if (p1 && p2) { p1.style.display = 'none'; p2.style.display = 'block'; }
                        }
                    }
                });
            };

            // Open Modal from Grid Item
            const openModalAt = (index) => {
                pausePreviewVideos(); // Stop background preview videos
                document.body.style.overflow = 'hidden';
                reelsModal.classList.add('active');
                reelsModal.setAttribute('aria-hidden', 'false');

                // Instant jump to target slide, then play with audio
                setTimeout(() => {
                    activateSlide(index, false);
                }, 50);
            };

            // Close Modal
            const closeModal = () => {
                modalSlides.forEach(slide => {
                    const video = slide.querySelector('.modal-reel-video');
                    if (video) video.pause();
                });
                reelsModal.classList.remove('active');
                reelsModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';

                // Resume preview videos if on videos tab
                if (currentActiveCategory === 'videos') {
                    playPreviewVideos();
                }
            };

            if (reelsCloseBtn) reelsCloseBtn.addEventListener('click', closeModal);
            if (reelsBackdrop) reelsBackdrop.addEventListener('click', closeModal);

            // Up / Down Quick Nav Buttons
            if (reelsPrevBtn) {
                reelsPrevBtn.addEventListener('click', () => {
                    if (currentSlideIndex > 0) activateSlide(currentSlideIndex - 1, true);
                });
            }
            if (reelsNextBtn) {
                reelsNextBtn.addEventListener('click', () => {
                    if (currentSlideIndex < totalSlides - 1) activateSlide(currentSlideIndex + 1, true);
                });
            }

            // Keyboard shortcuts
            window.addEventListener('keydown', (e) => {
                if (!reelsModal.classList.contains('active')) return;

                if (e.key === 'Escape') {
                    closeModal();
                } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                    e.preventDefault();
                    if (currentSlideIndex < totalSlides - 1) activateSlide(currentSlideIndex + 1, true);
                } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                    e.preventDefault();
                    if (currentSlideIndex > 0) activateSlide(currentSlideIndex - 1, true);
                } else if (e.key === ' ' || e.key === 'k') {
                    e.preventDefault();
                    const activeVideo = modalSlides[currentSlideIndex]?.querySelector('.modal-reel-video');
                    if (activeVideo) {
                        if (activeVideo.paused) activeVideo.play().catch(() => {});
                        else activeVideo.pause();
                    }
                } else if (e.key === 'm' || e.key === 'M') {
                    e.preventDefault();
                    globalMutedState = !globalMutedState;
                    modalSlides.forEach(s => {
                        const v = s.querySelector('.modal-reel-video');
                        if (v) v.muted = globalMutedState;
                        const btn = s.querySelector('.reel-sound-btn');
                        updateSoundButtonUI(btn, globalMutedState);
                    });
                }
            });

            // Snap-scroll tracking inside the modal (detect active slide as user scrolls/swipes)
            let scrollDebounceTimer = null;
            reelsModalTrack.addEventListener('scroll', () => {
                if (!reelsModal.classList.contains('active')) return;

                clearTimeout(scrollDebounceTimer);
                scrollDebounceTimer = setTimeout(() => {
                    const trackRect = reelsModalTrack.getBoundingClientRect();
                    const trackCenter = trackRect.top + trackRect.height / 2;

                    let closestSlide = 0;
                    let closestDist = Infinity;

                    modalSlides.forEach((slide, idx) => {
                        const rect = slide.getBoundingClientRect();
                        const slideCenter = rect.top + rect.height / 2;
                        const dist = Math.abs(trackCenter - slideCenter);
                        if (dist < closestDist) {
                            closestDist = dist;
                            closestSlide = idx;
                        }
                    });

                    if (closestSlide !== currentSlideIndex) {
                        activateSlide(closestSlide, false);
                    }
                }, 120);
            }, { passive: true });

            // Attach click handler to all grid reel cards
            const reelCards = document.querySelectorAll('.reel-portfolio-item');
            reelCards.forEach((card) => {
                card.addEventListener('click', () => {
                    const idx = parseInt(card.dataset.index, 10) || 0;
                    openModalAt(idx);
                });
            });
        }
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
