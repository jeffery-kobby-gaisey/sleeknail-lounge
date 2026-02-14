/* ============================================
   Sleeknail Lounge — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Navbar Scroll ----------
    const navbar = document.getElementById('navbar');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    // ---------- Back to Top ----------
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ---------- Mobile Menu ----------
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ---------- Active Nav Link on Scroll ----------
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinksAll.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    window.addEventListener('scroll', updateActiveNav);

    // ---------- Counter Animation ----------
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    let countersStarted = false;

    function animateCounters() {
        if (countersStarted) return;
        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats) return;

        const rect = heroStats.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            countersStarted = true;
            statNumbers.forEach(el => {
                const target = parseInt(el.dataset.count);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current).toLocaleString();
                }, 16);
            });
        }
    }
    window.addEventListener('scroll', animateCounters);
    animateCounters();

    // ---------- Fade In on Scroll ----------
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in, .stagger-children').forEach(el => {
        observer.observe(el);
    });

    // Add animation classes to sections dynamically
    document.querySelectorAll('.service-card, .team-card, .pricing-category, .gallery-item').forEach((el, i) => {
        el.classList.add('fade-in');
        el.style.transitionDelay = `${(i % 3) * 0.1}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.about-content, .contact-form-wrapper').forEach(el => {
        el.classList.add('fade-in-right');
        observer.observe(el);
    });

    document.querySelectorAll('.about-images, .contact-info').forEach(el => {
        el.classList.add('fade-in-left');
        observer.observe(el);
    });

    // ---------- Gallery Filter ----------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            galleryItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = '';
                    item.classList.remove('hidden');
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 400);
                }
            });
        });
    });

    // ---------- Testimonials Slider ----------
    const track = document.getElementById('testimonialTrack');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.getElementById('prevTestimonial');
    const nextBtn = document.getElementById('nextTestimonial');

    if (track && dotsContainer) {
        const cards = track.querySelectorAll('.testimonial-card');
        let current = 0;

        // Create dots
        cards.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('testimonial-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goTo(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.testimonial-dot');

        function goTo(index) {
            current = index;
            track.style.transform = `translateX(-${current * 100}%)`;
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === current);
            });
        }

        prevBtn?.addEventListener('click', () => {
            goTo(current === 0 ? cards.length - 1 : current - 1);
        });

        nextBtn?.addEventListener('click', () => {
            goTo(current === cards.length - 1 ? 0 : current + 1);
        });

        // Auto-play
        let autoPlay = setInterval(() => {
            goTo(current === cards.length - 1 ? 0 : current + 1);
        }, 5000);

        // Pause on hover
        track.addEventListener('mouseenter', () => clearInterval(autoPlay));
        track.addEventListener('mouseleave', () => {
            autoPlay = setInterval(() => {
                goTo(current === cards.length - 1 ? 0 : current + 1);
            }, 5000);
        });
    }

    // ---------- Contact Form ----------
    const contactForm = document.getElementById('contactForm');
    contactForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
        contactForm.reset();
    });

    // ---------- Toast Notification ----------
    window.showToast = function(message, type = 'success') {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // ---------- Smooth scroll for anchor links ----------
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

});
