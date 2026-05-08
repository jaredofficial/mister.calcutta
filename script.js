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

    // --- Navbar ScrollSpy Logic ---
    const sections = document.querySelectorAll("section");
    const navItems = document.querySelectorAll(".nav-item");

    window.addEventListener("scroll", () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Activate when the section is at least 1/3rd into the viewport
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                const id = section.getAttribute("id");
                if (id) {
                    current = id;
                }
            }
        });

        navItems.forEach(item => {
            item.classList.remove("active");
            if (item.getAttribute("href") === `#${current}`) {
                item.classList.add("active");
            }
        });
    });

    // --- Hero Section Animations ---
    const heroTl = gsap.timeline();

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
