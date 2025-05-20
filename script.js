document.addEventListener('DOMContentLoaded', () => {
    // --- Profile Picture Fade-In ---
    const profilePic = document.querySelector('.profile-picture');
    if (profilePic) {
        // Check if the image is already complete 
        if (profilePic.complete) {
            profilePic.classList.add('loaded');
        } else {
            profilePic.addEventListener('load', () => {
                profilePic.classList.add('loaded');
            });
        }
    }

    // --- Background Canvas Animation ---
    const canvas = document.getElementById('background-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let mouse = {
            x: undefined, y: undefined,
            prevX: undefined, prevY: undefined,
            velX: 0, velY: 0
        };
        const particleSettings = {
            count: 30, minRadius: 5, maxRadius: 25, minSpeed: 0.1, maxSpeed: 0.3,
            color: "rgba(52, 152, 219, 0.15)", mouseInfluenceFactor: 0.03,
            interactionRadius: 140, repulsionStrength: 0.8, maxCombinedSpeed: 2.5
        };
        window.addEventListener('mousemove', (event) => { mouse.x = event.clientX; mouse.y = event.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
        function resizeCanvas() { width = canvas.width = window.innerWidth; height = canvas.height = window.innerHeight; }
        class Particle {
            constructor() {
                this.x = Math.random() * width; this.y = Math.random() * height;
                this.radius = Math.random() * (particleSettings.maxRadius - particleSettings.minRadius) + particleSettings.minRadius;
                const speedMagnitude = Math.random() * (particleSettings.maxSpeed - particleSettings.minSpeed) + particleSettings.minSpeed;
                const angle = Math.random() * 2 * Math.PI;
                this.baseSpeedX = Math.cos(angle) * speedMagnitude; this.baseSpeedY = Math.sin(angle) * speedMagnitude;
                this.opacity = 0; this.fadeIn = true; this.maxOpacity = 0.5 + Math.random() * 0.5;
            }
            resetSpeed() {
                const speedMagnitude = Math.random() * (particleSettings.maxSpeed - particleSettings.minSpeed) + particleSettings.minSpeed;
                const angle = Math.random() * 2 * Math.PI;
                this.baseSpeedX = Math.cos(angle) * speedMagnitude; this.baseSpeedY = Math.sin(angle) * speedMagnitude;
            }
            update() {
                let finalSpeedX = this.baseSpeedX; let finalSpeedY = this.baseSpeedY;
                if (mouse.velX !== 0 || mouse.velY !== 0) { finalSpeedX += mouse.velX * particleSettings.mouseInfluenceFactor; finalSpeedY += mouse.velY * particleSettings.mouseInfluenceFactor; }
                if (mouse.x !== undefined && mouse.y !== undefined) {
                    const distMouseX = this.x - mouse.x; const distMouseY = this.y - mouse.y;
                    const distanceToMouse = Math.sqrt(distMouseX * distMouseX + distMouseY * distMouseY);
                    if (distanceToMouse < particleSettings.interactionRadius && distanceToMouse > 0) {
                        const angle = Math.atan2(distMouseY, distMouseX);
                        const force = (particleSettings.interactionRadius - distanceToMouse) / particleSettings.interactionRadius * particleSettings.repulsionStrength;
                        finalSpeedX += Math.cos(angle) * force; finalSpeedY += Math.sin(angle) * force;
                    }
                }
                if (particleSettings.maxCombinedSpeed) {
                    const currentSpeedMagnitude = Math.sqrt(finalSpeedX * finalSpeedX + finalSpeedY * finalSpeedY);
                    if (currentSpeedMagnitude > particleSettings.maxCombinedSpeed) {
                        finalSpeedX = (finalSpeedX / currentSpeedMagnitude) * particleSettings.maxCombinedSpeed;
                        finalSpeedY = (finalSpeedY / currentSpeedMagnitude) * particleSettings.maxCombinedSpeed;
                    }
                }
                this.x += finalSpeedX; this.y += finalSpeedY;
                if ((this.x + this.radius > width && this.baseSpeedX > 0) || (this.x - this.radius < 0 && this.baseSpeedX < 0)) { this.baseSpeedX *= -1; }
                if ((this.y + this.radius > height && this.baseSpeedY > 0) || (this.y - this.radius < 0 && this.baseSpeedY < 0)) { this.baseSpeedY *= -1; }
                this.x = Math.max(this.radius, Math.min(width - this.radius, this.x)); this.y = Math.max(this.radius, Math.min(height - this.radius, this.y));
                if (this.fadeIn) { this.opacity += 0.005; if (this.opacity >= this.maxOpacity) { this.opacity = this.maxOpacity; this.fadeIn = false; } }
                else { this.opacity -= 0.0015; if (this.opacity <= 0) { this.x = Math.random() * width; this.y = Math.random() * height; this.radius = Math.random() * (particleSettings.maxRadius - particleSettings.minRadius) + particleSettings.minRadius; this.resetSpeed(); this.opacity = 0; this.fadeIn = true; this.maxOpacity = 0.3 + Math.random() * 0.3; } }
            }
            draw() {
                ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                const baseColorRGB = particleSettings.color.substring(0, particleSettings.color.lastIndexOf(','));
                ctx.fillStyle = `${baseColorRGB}, ${this.opacity})`; ctx.fill();
            }
        }
        function initParticles() { particles = []; for (let i = 0; i < particleSettings.count; i++) { particles.push(new Particle()); } }
        function animateParticles() {
            if (mouse.x !== undefined && mouse.prevX !== undefined) { mouse.velX = mouse.x - mouse.prevX; mouse.velY = mouse.y - mouse.prevY; } else { mouse.velX = 0; mouse.velY = 0; }
            mouse.prevX = mouse.x; mouse.prevY = mouse.y;
            ctx.clearRect(0, 0, width, height); particles.forEach(particle => { particle.update(); particle.draw(); }); requestAnimationFrame(animateParticles);
        }
        resizeCanvas(); initParticles(); animateParticles();
        window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
    }

    // --- CV Section Visibility Observer ---
    const sections = document.querySelectorAll('.cv-section');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); } });
    }, observerOptions);
    sections.forEach(section => { sectionObserver.observe(section); });

    // --- Custom Smooth Scroll Function ---
    function customSmoothScrollTo(targetElement, duration) {
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        const startPosition = window.pageYOffset; const distance = targetPosition - startPosition;
        let startTime = null;
        function easeInOutQuad(t, b, c, d) { t /= d / 2; if (t < 1) return c / 2 * t * t + b; t--; return -c / 2 * (t * (t - 2) - 1) + b; }
        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime; const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run); if (timeElapsed < duration) { requestAnimationFrame(animation); }
        }
        requestAnimationFrame(animation);
    }

    // --- Navigation Link Event Listeners for Smooth Scroll ---
    document.querySelectorAll('#hero nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); const targetId = this.getAttribute('href'); const targetElement = document.querySelector(targetId);
            if (targetElement) { customSmoothScrollTo(targetElement, 1000); }
        });
    });

    // --- Scroll to Top Button Logic ---
    const scrollToTopBtn = document.getElementById("scrollToTopBtn");
    if (scrollToTopBtn) {
        window.onscroll = function() { scrollFunction(); };
        function scrollFunction() {
            let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
            let windowHeight = window.innerHeight;
            let documentHeight = Math.max( document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.body.clientHeight, document.documentElement.clientHeight );
            const showAtScrollPixels = windowHeight * 0.9, hideAtTopThresholdPixels = 100;
            if (scrollPosition > hideAtTopThresholdPixels && (scrollPosition > showAtScrollPixels || (scrollPosition + windowHeight) / documentHeight > 0.70)) {
                if (!scrollToTopBtn.classList.contains("show")) { scrollToTopBtn.classList.add("show"); }
            } else { if (scrollToTopBtn.classList.contains("show")) { scrollToTopBtn.classList.remove("show"); } }
        }
        scrollToTopBtn.addEventListener('click', function(e) {
            e.preventDefault(); const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) { customSmoothScrollTo(targetElement, 800); }
        });
    }

    // --- Project Card Expand/Collapse ---
    const projectToggleButtons = document.querySelectorAll('.project-toggle-details');
    projectToggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const projectCard = button.closest('.project-card');

            if (projectCard.classList.contains('expanded')) {
                projectCard.classList.remove('expanded');
                button.textContent = 'View More ⏬';
            } else {
                projectCard.classList.add('expanded');
                button.textContent = 'View Less ⏫';
            }
        });
    });

}); 
