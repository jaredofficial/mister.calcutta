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

document.addEventListener("DOMContentLoaded", () => {

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

    // --- Hero Section Animations ---
    const heroTl = gsap.timeline();

    // Text reveal for Hero Title
    heroTl.from(".hero-title .word-inner", {
        yPercent: 120,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
        delay: 0.2
    })
        // Subtitle reveal
        .from(".hero-subtitle .word-inner", {
            yPercent: 120,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            stagger: 0.05
        }, "-=0.8")
        // Fade up tags
        .from(".hero-tags", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6")
        // Fade in Hero Image
        .from(".hero-image", {
            x: 100,
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        }, "-=1")
        // Taxi drives in from left
        .from(".hero-taxi", {
            xPercent: -150, // Starts off-screen left
            opacity: 0,
            duration: 1.8,
            ease: "power3.out"
        }, "-=1.2")
        // Fade in Glass Panel
        .from(".hero-glass-panel", {
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: "power2.out"
        }, "-=2");

    // Parallax effect on Hero Image
    gsap.to(".parallax-img", {
        yPercent: 20,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

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
                    duration: 2.5,
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
    gsap.from(".stat-item", {
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

    // --- Who I Am Section ---
    gsap.from(".who-i-am-glass", {
        scrollTrigger: {
            trigger: ".who-i-am",
            start: "top 80%",
        },
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power2.out"
    });

    gsap.from(".fade-up-stagger > p", {
        scrollTrigger: {
            trigger: ".who-i-am .fade-up-stagger",
            start: "top 75%",
        },
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
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

});
