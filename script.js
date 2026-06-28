// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Helper function to wrap words in spans for the Apple-style reveal
function splitWords() {
    const splitElements = document.querySelectorAll('.apple-reveal');
    splitElements.forEach(el => {
        const text = el.innerText;
        const words = text.split(' ');
        el.innerHTML = '';
        words.forEach(word => {
            const wordWrap = document.createElement('span');
            wordWrap.classList.add('word-wrap');
            const wordInner = document.createElement('span');
            wordInner.classList.add('word-inner');
            wordInner.innerText = word;
            wordWrap.appendChild(wordInner);
            el.appendChild(wordWrap);
            // Add space after word
            el.appendChild(document.createTextNode(' '));
        });
    });
}

// Helper to calculate ScrollTrigger-aware scroll positions for elements
function getScrollLookup(targets, {start, pinnedContainer, containerAnimation}) {
    let triggers = gsap.utils.toArray(targets).map(el => ScrollTrigger.create({
        trigger: el,
        start: start || "top top",
        pinnedContainer: pinnedContainer,
        containerAnimation: containerAnimation,
        refreshPriority: -10 // runs after other ScrollTriggers to capture final layout positions
    }));
    
    return (target) => {
        let t = gsap.utils.toArray(target)[0],
            i = triggers.length;
        while (i-- && triggers[i].trigger !== t) {}
        return i >= 0 ? triggers[i].start : 0;
    };
}

document.addEventListener("DOMContentLoaded", async () => {

    // --- Dynamic CMS Copy Fetch ---
    try {
        const contentRes = await fetch('content.json');
        const content = await contentRes.json();
        
        // Populate static text and stats
        const cmsElements = document.querySelectorAll('[data-cms-key]');
        cmsElements.forEach(el => {
            const key = el.getAttribute('data-cms-key');
            const value = key.split('.').reduce((acc, part) => acc && acc[part], content);
            if (value !== undefined) {
                if (key.startsWith('stats.')) {
                    el.setAttribute('data-target', value);
                    el.innerText = '0';
                } else {
                    el.innerHTML = value;
                }
            }
        });
        if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
        }
    } catch (err) {
        console.error("Failed to load CMS content:", err);
    }

    // 1. Prepare DOM for animations
    splitWords();

    // --- Scroll to Top Logic ---
    const scrollToTopBtn = document.getElementById("scrollToTop");

    window.addEventListener("scroll", () => {
        if (window.scrollY > 500) {
            scrollToTopBtn.classList.add("visible");
        } else {
            scrollToTopBtn.classList.remove("visible");
        }
    });

    scrollToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // --- Navbar ScrollSpy Logic (ScrollTrigger-Aware) ---
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-item");

    sections.forEach(section => {
        const id = section.getAttribute("id");
        if (id) {
            const navItem = document.querySelector(`.nav-item[href="#${id}"]`);
            ScrollTrigger.create({
                trigger: section,
                start: "top center", // active when top of section crosses the center of viewport
                end: "bottom center", // inactive when bottom of section crosses the center of viewport
                onToggle: self => {
                    if (self.isActive) {
                        navItems.forEach(item => item.classList.remove("active"));
                        if (navItem) {
                            navItem.classList.add("active");
                        }
                    }
                }
            });
        }
    });

    // --- Smooth Scroll Override for all Hash Links ---
    // Moved to the bottom of DOMContentLoaded to ensure all GSAP animations and ScrollTriggers are fully initialized first.

    // --- Hero Section Animations ---
    const heroTl = gsap.timeline({ paused: true });

    // Text reveal for Hero Title
    heroTl.from(".hero-tags-top", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        delay: 0.2
    })
    .from(".hero-name-aka", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.4")
    .from(".hero-title .word-inner", {
        yPercent: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1
    }, "-=0.4")
    .from(".hero-quote .word-inner", {
        yPercent: 120,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        stagger: 0.05
    }, "-=0.8")
    .from(".hero-cta-container .btn", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.6")
    /* 
    .from(".hero-image", {
        x: 50,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out"
    }, "-=1.2")
    */
    .from(".hero-social-box", {
        y: 20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=1");

    // Parallax effect on Hero Image
    /* Disabled parallax on hero image to ensure it stays pinned to bottom 
    gsap.to(".parallax-img", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    }); 
    */

    gsap.to(".parallax-img-slow", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    gsap.to(".parallax-img-fast", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
            trigger: ".who-i-am",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // --- Stats Counter Animation ---
    const counters = document.querySelectorAll('.counter');

    ScrollTrigger.create({
        trigger: ".stats",
        start: "top 80%",
        onEnter: () => {
            counters.forEach(counter => {
                const target = parseFloat(counter.getAttribute('data-target'));
                const decimals = counter.getAttribute('data-decimals') ? parseInt(counter.getAttribute('data-decimals')) : 2;

                gsap.to(counter, {
                    innerHTML: target,
                    duration: 4.5,
                    ease: "power3.out",
                    snap: { innerHTML: 0.01 },
                    onUpdate: function () {
                        let val = Number(this.targets()[0].innerHTML);
                        this.targets()[0].innerHTML = val.toFixed(decimals);
                    }
                });
            });
        },
        once: true
    });

    // Fade up stat items
    gsap.from(".stat-item-screenshot", {
        scrollTrigger: {
            trigger: ".stats",
            start: "top 80%",
        },
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
    });

    // Fade in the glass container
    gsap.from(".stats-glass", {
        scrollTrigger: {
            trigger: ".stats",
            start: "top 80%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power2.out"
    });

    // --- Who I Am / Timeline Scroll Interaction ---
    const timelineItems = gsap.utils.toArray('.timeline-item');
    
    // Animate the fill line
    gsap.to('.timeline-line-fill', {
        height: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: ".timeline-wrapper",
            start: "top center",
            end: "bottom center",
            scrub: true
        }
    });

    // Highlight timeline items as they are reached
    timelineItems.forEach((item, i) => {
        ScrollTrigger.create({
            trigger: item,
            start: "top center+=50", // Trigger slightly before it hits center
            toggleClass: "active"
        });
    });

    gsap.from(".who-paragraphs > p", {
        scrollTrigger: {
            trigger: ".who-paragraphs",
            start: "top 75%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
    });

    // --- Horizontal Scroll (What I Do) ---
    let mm = gsap.matchMedia();

    mm.add("(min-width: 992px)", () => {
        let horizontalSection = document.querySelector('.horizontal-scroll-section');
        let horizontalTrack = document.querySelector('.horizontal-track');
        let horizontalCards = gsap.utils.toArray('.horizontal-card');

        if(horizontalSection && horizontalTrack && horizontalCards.length) {
            let getScrollAmount = () => -(horizontalTrack.scrollWidth - window.innerWidth);

            gsap.to(horizontalTrack, {
                x: getScrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: horizontalSection,
                    pin: true,
                    start: "top top",
                    end: () => `+=${horizontalTrack.scrollWidth - window.innerWidth}`,
                    scrub: 1,
                    invalidateOnRefresh: true,
                    snap: {
                        snapTo: 1 / (horizontalCards.length - 1),
                        duration: {min: 0.2, max: 0.6},
                        delay: 0.1,
                        ease: "power1.inOut"
                    }
                }
            });
        }
    });

    // --- Mobile Exclusive Entrance Animations ---
    mm.add("(max-width: 991px)", () => {
        // Scroll-trigger entrance for What I Do cards
        gsap.utils.toArray('.horizontal-card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 92%",
                    toggleActions: "play none none none"
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });


        // Scroll-trigger entrance for Blog cards
        gsap.utils.toArray('.blog-card').forEach(card => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 95%",
                    toggleActions: "play none none none"
                },
                y: 25,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out"
            });
        });

        // Stagger entrance for Timeline items on mobile
        gsap.utils.toArray('.timeline-item').forEach(item => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 92%",
                    toggleActions: "play none none none"
                },
                x: -20,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out"
            });
        });
    });

    // --- Generic Fade Ups ---
    const fadeUps = document.querySelectorAll('.fade-up:not(.apple-reveal)');
    fadeUps.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // --- Sticker Scroll Parallax ---
    const stickers = document.querySelectorAll('.sticker');
    stickers.forEach((sticker, i) => {
        const speed = (i % 2 === 0) ? 50 : -50; // Alternate floating speed and direction
        gsap.to(sticker, {
            y: speed,
            ease: "none",
            scrollTrigger: {
                trigger: sticker.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });

    // --- Navbar Entrance Slide & Stagger Animation ---
    gsap.from(".navbar", {
        y: -50,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        delay: 0.2
    });
    gsap.from(".nav-item", {
        opacity: 0,
        y: -10,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.5
    });

    // Generic Apple Reveals
    const appleReveals = document.querySelectorAll('h2.apple-reveal');
    appleReveals.forEach(el => {
        gsap.from(el.querySelectorAll('.word-inner'), {
            scrollTrigger: {
                trigger: el,
                start: "top 85%",
            },
            yPercent: 120,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.05
        });
    });

    // --- Gallery Lazy Loading via IntersectionObserver ---
    const gallerySection = document.getElementById("gallery");
    if (gallerySection && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const lazyImages = gallerySection.querySelectorAll("img[data-src]");
                    lazyImages.forEach(img => {
                        img.src = img.getAttribute("data-src");
                        img.removeAttribute("data-src");
                    });
                    observer.disconnect();
                }
            });
        }, {
            rootMargin: "0px 0px 400px 0px"
        });
        observer.observe(gallerySection);
    } else {
        // Fallback for browsers without IntersectionObserver
        const lazyImages = document.querySelectorAll("img[data-src]");
        lazyImages.forEach(img => {
            img.src = img.getAttribute("data-src");
            img.removeAttribute("data-src");
        });
    }

    // --- Gallery Lightbox Logic ---
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxTitle = document.getElementById("lightboxTitle");
    const lightboxDesc = document.getElementById("lightboxDesc");
    const lightboxClose = document.querySelector(".lightbox-close");
    const galleryImages = document.querySelectorAll(".gallery-image");

    if (lightbox && galleryImages.length) {
        // Collect unique image sources to filter out duplicates in carousels
        const uniqueImages = [];
        const seenSources = new Set();
        galleryImages.forEach(img => {
            const src = img.getAttribute("data-src") || img.getAttribute("src");
            if (src && !src.startsWith("data:") && !seenSources.has(src)) {
                seenSources.add(src);
                uniqueImages.push(src);
            }
        });

        let currentImgIndex = 0;

        const updateLightboxContent = (index) => {
            const src = uniqueImages[index];
            lightboxImg.setAttribute("src", src);
            const caption = document.querySelector(".lightbox-caption");
            if (caption) {
                caption.style.display = "none";
            }
        };

        galleryImages.forEach(img => {
            img.addEventListener("click", () => {
                const src = img.getAttribute("data-src") || img.getAttribute("src");
                currentImgIndex = uniqueImages.indexOf(src);
                updateLightboxContent(currentImgIndex);

                lightbox.classList.add("active");
                document.body.style.overflow = "hidden"; // Disable body scroll
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove("active");
            document.body.style.overflow = ""; // Re-enable body scroll
        };

        lightboxClose.addEventListener("click", closeLightbox);
        
        // Navigation buttons click listeners
        const lightboxPrev = document.querySelector(".lightbox-prev");
        const lightboxNext = document.querySelector(".lightbox-next");

        if (lightboxPrev && lightboxNext) {
            lightboxPrev.addEventListener("click", (e) => {
                e.stopPropagation(); // Avoid triggering close on lightbox backdrop
                currentImgIndex = (currentImgIndex - 1 + uniqueImages.length) % uniqueImages.length;
                updateLightboxContent(currentImgIndex);
            });

            lightboxNext.addEventListener("click", (e) => {
                e.stopPropagation(); // Avoid triggering close on lightbox backdrop
                currentImgIndex = (currentImgIndex + 1) % uniqueImages.length;
                updateLightboxContent(currentImgIndex);
            });
        }

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Keydown listener for Arrow keys and Escape
        document.addEventListener("keydown", (e) => {
            if (lightbox.classList.contains("active")) {
                if (e.key === "ArrowLeft") {
                    currentImgIndex = (currentImgIndex - 1 + uniqueImages.length) % uniqueImages.length;
                    updateLightboxContent(currentImgIndex);
                } else if (e.key === "ArrowRight") {
                    currentImgIndex = (currentImgIndex + 1) % uniqueImages.length;
                    updateLightboxContent(currentImgIndex);
                } else if (e.key === "Escape") {
                    closeLightbox();
                }
            }
        });
    }

    // --- Blogs Carousel Navigation ---
    const blogsContainer = document.querySelector('.blogs-carousel-container');
    const blogsPrevBtn = document.querySelector('.blogs-nav-btn.prev-btn');
    const blogsNextBtn = document.querySelector('.blogs-nav-btn.next-btn');

    if (blogsContainer && blogsPrevBtn && blogsNextBtn) {
        const getScrollAmount = () => {
            const firstCard = blogsContainer.querySelector('.blog-card');
            if (firstCard) {
                const style = window.getComputedStyle(blogsContainer.querySelector('.blogs-track'));
                const gap = parseFloat(style.gap) || 32;
                return firstCard.offsetWidth + gap;
            }
            return 400; // Fallback
        };

        blogsPrevBtn.addEventListener('click', () => {
            blogsContainer.scrollBy({
                left: -getScrollAmount(),
                behavior: 'smooth'
            });
        });

        blogsNextBtn.addEventListener('click', () => {
            blogsContainer.scrollBy({
                left: getScrollAmount(),
                behavior: 'smooth'
            });
        });

        const toggleButtons = () => {
            const scrollLeft = blogsContainer.scrollLeft;
            const maxScroll = blogsContainer.scrollWidth - blogsContainer.clientWidth;
            
            if (scrollLeft <= 5) {
                blogsPrevBtn.classList.add('disabled');
            } else {
                blogsPrevBtn.classList.remove('disabled');
            }
            
            if (scrollLeft >= maxScroll - 5) {
                blogsNextBtn.classList.add('disabled');
            } else {
                blogsNextBtn.classList.remove('disabled');
            }
        };

        blogsContainer.addEventListener('scroll', toggleButtons);
        window.addEventListener('resize', toggleButtons);
        // Run once on load
        setTimeout(toggleButtons, 150);
    }

    // --- Smooth Scroll Override for all Hash Links ---
    // Initialize the lookup and click handlers at the end of DOMContentLoaded to ensure all other ScrollTriggers are fully initialized.
    const allHashLinks = document.querySelectorAll('a[href^="#"]');
    
    // Collect all unique target selectors from hash links
    const targetSelectors = new Set();
    allHashLinks.forEach(link => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#") && href !== "#") {
            targetSelectors.add(href);
        }
    });
    
    const targetsArray = Array.from(targetSelectors).filter(selector => document.querySelector(selector));
    
    // Initialize ScrollTrigger-aware scroll position lookup
    const getPosition = getScrollLookup(targetsArray, {
        start: "top top"
    });
    
    allHashLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            const href = this.getAttribute("href");
            if (href && href.startsWith("#") && href !== "#") {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    // Force a recalculation of all ScrollTrigger trigger values right before lookup
                    if (window.ScrollTrigger) {
                        ScrollTrigger.refresh();
                    }
                    const navbar = document.querySelector('.navbar');
                    const offset = navbar ? navbar.getBoundingClientRect().bottom + 45 : 160;
                    
                    let targetScroll = getPosition(targetElement);
                    if (href === "#hero") {
                        targetScroll = 0;
                    } else if (window.innerWidth >= 992 && (href === "#who-i-am" || href === "#what-i-do" || href === "#work-with-me" || href === "#reels" || href === "#blogs")) {
                        // For main sections on desktop, they have CSS padding/spacing built-in to clear the navbar
                        targetScroll = Math.max(0, targetScroll);
                    } else {
                        targetScroll = Math.max(0, targetScroll - offset);
                    }
                    
                    window.scrollTo({
                        top: targetScroll,
                        behavior: "smooth"
                    });
                }
            }
        });
    });
    // --- Mobile Hamburger Menu & Dropdown Animations ---
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item, .mobile-menu-cta');
    
    if (mobileMenuToggle && mobileMenu) {
        // Create GSAP Timeline for Menu Entrance
        const menuTl = gsap.timeline({ paused: true });
        menuTl.to(mobileMenu, {
            autoAlpha: 1,
            duration: 0.3,
            ease: "power2.out"
        })
        .to(mobileMenuItems, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            stagger: 0.05,
            ease: "power3.out"
        }, "-=0.1")
        .to('.mobile-menu-socials', {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out"
        }, "-=0.2");

        function openMenu() {
            mobileMenuToggle.classList.add('active');
            mobileMenu.classList.add('active');
            document.body.style.overflow = 'hidden';
            menuTl.play();
        }

        function closeMenu() {
            mobileMenuToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
            menuTl.reverse();
        }

        mobileMenuToggle.addEventListener('click', () => {
            if (mobileMenu.classList.contains('active')) {
                closeMenu();
            } else {
                openMenu();
            }
        });

        // Close menu when clicking on overlay links
        mobileMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                closeMenu();
            });
        });

        // Close menu on window resize if transitioned to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 992 && mobileMenu.classList.contains('active')) {
                closeMenu();
            }
        });
    }

    // --- Page Loader & Reveal Logic ---
    const pageLoader = document.getElementById('pageLoader');
    const loaderProgressBar = document.getElementById('loaderProgressBar');
    
    // Disable scrolling during load
    document.body.style.overflow = 'hidden';
    
    // Simulate loading progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        if (progress < 85) {
            progress += Math.random() * 12;
            if (progress > 85) progress = 85;
            if (loaderProgressBar) {
                loaderProgressBar.style.width = progress + '%';
            }
        }
    }, 100);

    function finishLoading() {
        clearInterval(progressInterval);
        if (loaderProgressBar) {
            loaderProgressBar.style.width = '100%';
        }
        setTimeout(() => {
            if (pageLoader) {
                pageLoader.style.opacity = '0';
                pageLoader.style.visibility = 'hidden';
            }
            document.body.style.overflow = '';
            
            // Start the paused Hero animation timeline
            if (typeof heroTl !== 'undefined') {
                heroTl.play();
            }
        }, 500);
    }

    if (document.readyState === 'complete') {
        finishLoading();
    } else {
        window.addEventListener('load', finishLoading);
    }

    // --- Scroll Progress Indicator ---
    const scrollProgressBar = document.getElementById('scrollProgressBar');
    if (scrollProgressBar) {
        const updateProgressBar = () => {
            const scrollTop = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight > 0) {
                const progress = (scrollTop / scrollHeight) * 100;
                scrollProgressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
            } else {
                scrollProgressBar.style.width = '0%';
            }
        };
        window.addEventListener('scroll', updateProgressBar, { passive: true });
        window.addEventListener('resize', updateProgressBar);
        // Run once initial
        updateProgressBar();
    }

    // --- Dynamic Video Sound Toggle Injection ---
    const videos = document.querySelectorAll('.cinematic-video, .reel-video');
    videos.forEach(video => {
        const container = video.parentElement;
        if (container) {
            // Make sure container is positioned relatively to hold absolute speaker icon
            if (window.getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'video-sound-toggle';
            toggleBtn.setAttribute('aria-label', 'Toggle Sound');
            toggleBtn.innerHTML = `
                <svg class="sound-icon sound-off" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
                <svg class="sound-icon sound-on" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            `;
            container.appendChild(toggleBtn);
            
            const toggleMute = (e) => {
                e.stopPropagation();
                e.preventDefault();
                video.muted = !video.muted;
                const soundOff = toggleBtn.querySelector('.sound-off');
                const soundOn = toggleBtn.querySelector('.sound-on');
                
                if (video.muted) {
                    soundOff.style.display = 'block';
                    soundOn.style.display = 'none';
                    toggleBtn.classList.remove('unmuted');
                } else {
                    soundOff.style.display = 'none';
                    soundOn.style.display = 'block';
                    toggleBtn.classList.add('unmuted');
                    
                    // Mute all other videos
                    videos.forEach(otherVideo => {
                        if (otherVideo !== video) {
                            otherVideo.muted = true;
                            const otherToggle = otherVideo.parentElement.querySelector('.video-sound-toggle');
                            if (otherToggle) {
                                otherToggle.querySelector('.sound-off').style.display = 'block';
                                otherToggle.querySelector('.sound-on').style.display = 'none';
                                otherToggle.classList.remove('unmuted');
                            }
                        }
                    });
                }
            };
            
            toggleBtn.addEventListener('click', toggleMute);
            video.addEventListener('click', toggleMute);
        }
    });

    // --- Mobile Footer Accordion ---
    const footerHeaders = document.querySelectorAll('.footer-col h4');
    footerHeaders.forEach(header => {
        header.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                const parent = header.parentElement;
                parent.classList.toggle('active');
            }
        });
    });

});

