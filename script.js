document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle with Spread Animation ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const icon = themeToggleBtn?.querySelector('i');
    const overlay = document.querySelector('.theme-transition-overlay');

    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    themeToggleBtn?.addEventListener('click', (e) => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Set the theme color for animation
        overlay.style.setProperty('--theme-color', newTheme === 'light' ? '#f8f9fa' : '#0a0a0f');
        
        // Trigger the animation
        overlay.classList.add('active');
        
        // Change theme quickly after animation starts
        setTimeout(() => {
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        }, 150);
        
        // Remove animation class after it completes
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 400);
    });

    function updateIcon(theme) {
        if (!icon) return;
        if (theme === 'dark') {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }

    // --- Back to Top Button ---
    const backToTopBtn = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 500) {
            backToTopBtn?.classList.add('visible');
        } else {
            backToTopBtn?.classList.remove('visible');
        }
    });

    backToTopBtn?.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // --- Expandable Project Cards ---
    const expandableCards = document.querySelectorAll('.project-card[data-expandable]');
    
    expandableCards.forEach(card => {
        const expandBtn = card.querySelector('.expand-btn');
        
        // Click on expand button
        expandBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleExpand(card);
        });
        
        // Double click on card to expand
        card.addEventListener('dblclick', (e) => {
            if (!e.target.closest('a') && !e.target.closest('.expand-btn')) {
                toggleExpand(card);
            }
        });
    });

    function toggleExpand(card) {
        const isExpanded = card.classList.contains('expanded');
        
        // Close all other cards first with smooth animation
        expandableCards.forEach(c => {
            if (c !== card && c.classList.contains('expanded')) {
                c.classList.add('collapsing');
                setTimeout(() => {
                    c.classList.remove('expanded', 'collapsing');
                }, 300);
            }
        });
        
        if (isExpanded) {
            // Collapsing - add class for smooth animation
            card.classList.add('collapsing');
            setTimeout(() => {
                card.classList.remove('expanded', 'collapsing');
            }, 300);
        } else {
            // Expanding - smooth scroll after a brief delay for animation
            card.classList.add('expanded');
            setTimeout(() => {
                const rect = card.getBoundingClientRect();
                const offsetTop = window.scrollY + rect.top - 100; // 100px from top
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }, 150);
        }
    }

    // --- Auto-retract expanded cards when scrolling away ---
    let scrollTimeout;
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const currentScrollY = window.scrollY;
            const scrollDelta = Math.abs(currentScrollY - lastScrollY);
            
            expandableCards.forEach(card => {
                if (card.classList.contains('expanded')) {
                    const rect = card.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    
                    // Only retract if card is almost completely out of view (less than 5%)
                    // AND user has scrolled significantly (more than 200px from when card was expanded)
                    const visibleTop = Math.max(0, rect.top);
                    const visibleBottom = Math.min(windowHeight, rect.bottom);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    const visiblePercent = visibleHeight / rect.height;
                    
                    // Only close if nearly invisible (5% or less visible)
                    if (visiblePercent < 0.05) {
                        card.classList.add('collapsing');
                        setTimeout(() => {
                            card.classList.remove('expanded', 'collapsing');
                        }, 300);
                    }
                }
            });
            
            lastScrollY = currentScrollY;
        }, 300);
    });

    // --- Scroll Reveal Animation with Intersection Observer ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Keep observing for re-entry effects (optional: unobserve for once)
            }
        });
    }, observerOptions);

    // Observe all fade-up elements
    const fadeElements = document.querySelectorAll('.fade-up');
    fadeElements.forEach(el => observer.observe(el));

    // --- Navbar scroll effect ---
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });

    // --- Smooth scroll for anchor links ---
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

    // --- Parallax effect for floating orbs ---
    const orbs = document.querySelectorAll('.floating-orb');
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        orbs.forEach((orb, index) => {
            const speed = 0.05 * (index + 1);
            orb.style.transform = `translateY(${scrollY * speed}px)`;
        });
    });

    // --- Magnetic effect for social buttons ---
    const magneticButtons = document.querySelectorAll('.social-btn, .email-button');
    
    magneticButtons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });

    // --- Typing effect for subtitle (optional enhancement) ---
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.style.opacity = '1';
    }

    // --- Project cards hover effect (simple, no tilt) ---
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            if (!card.classList.contains('expanded')) {
                card.style.transform = 'translateY(-8px)';
            }
        });

        card.addEventListener('mouseleave', () => {
            if (!card.classList.contains('expanded')) {
                card.style.transform = 'translateY(0)';
            }
        });
    });

    // --- Counter animation for skills/stats (if needed) ---
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // --- Add loaded class to body after everything loads ---
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Trigger hero animations
        const heroElements = document.querySelectorAll('#hero .fade-up');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('visible');
            }, index * 150);
        });
    });

    // --- Scroll indicator hide on scroll ---
    const scrollIndicator = document.querySelector('.scroll-indicator');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            scrollIndicator?.style.setProperty('opacity', '0');
        } else {
            scrollIndicator?.style.setProperty('opacity', '1');
        }
    });

    // --- Lightbox for expanded images ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-image');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    // Add click handlers to all images in expanded-media sections
    document.querySelectorAll('.expanded-media img').forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            if (lightbox && lightboxImg) {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close lightbox
    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    function closeLightbox() {
        lightbox?.classList.remove('active');
        document.body.style.overflow = '';
    }
});
