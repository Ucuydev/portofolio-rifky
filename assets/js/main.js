/* ============================================
   MAIN.JS — Rifky Portfolio
   Sticky navbar, scroll animations, portfolio
   filter, contact form validation, mobile menu
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveMenu();
  initMobileMenu();
  initScrollAnimations();
  initPortfolioFilter();
  initContactForm();
  initFeaturedCarousel();
});

/* ============================================
   1. STICKY NAVBAR + BLUR
   ============================================ */

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 50;

  function handleScroll() {
    if (window.scrollY > SCROLL_THRESHOLD) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // Throttle scroll event
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Run once on load
  handleScroll();
}

/* ============================================
   2. ACTIVE MENU STATE
   ============================================ */

function initActiveMenu() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Desktop nav links
  const navLinks = document.querySelectorAll('.navbar__link, .navbar__link--home');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Mobile nav links
  const mobileLinks = document.querySelectorAll('.navbar__mobile-link');
  mobileLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ============================================
   3. MOBILE MENU (Hamburger)
   ============================================ */

function initMobileMenu() {
  const toggle = document.querySelector('.navbar__toggle');
  const mobileMenu = document.querySelector('.navbar__mobile');
  const mobileLinks = document.querySelectorAll('.navbar__mobile-link');

  if (!toggle || !mobileMenu) return;

  function closeMenu() {
    toggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openMenu() {
    toggle.classList.add('open');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  toggle.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu when clicking a link
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
      closeMenu();
    }
  });
}

/* ============================================
   4. SCROLL ANIMATIONS (IntersectionObserver)
   ============================================ */

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .text-reveal');

  if (!animatedElements.length) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    animatedElements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  animatedElements.forEach(el => observer.observe(el));
}

/* ============================================
   5. PORTFOLIO FILTER
   ============================================ */

function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  if (!filterBtns.length || !projectCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');

        if (category === 'all' || cardCategory === category) {
          card.style.display = '';
          // Re-trigger animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 400ms ease-in-out, transform 400ms ease-in-out';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ============================================
   6. CONTACT FORM VALIDATION
   ============================================ */

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = {
    name: {
      element: form.querySelector('#contact-name'),
      error: form.querySelector('#error-name'),
      validate: (val) => val.trim().length >= 2
    },
    email: {
      element: form.querySelector('#contact-email'),
      error: form.querySelector('#error-email'),
      validate: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    subject: {
      element: form.querySelector('#contact-subject'),
      error: form.querySelector('#error-subject'),
      validate: (val) => val.trim().length >= 3
    },
    message: {
      element: form.querySelector('#contact-message'),
      error: form.querySelector('#error-message'),
      validate: (val) => val.trim().length >= 10
    }
  };

  const successMsg = form.querySelector('#form-success');

  // Real-time validation on blur
  Object.values(fields).forEach(field => {
    if (!field.element) return;
    field.element.addEventListener('blur', () => {
      validateField(field);
    });
    field.element.addEventListener('input', () => {
      if (field.element.classList.contains('error')) {
        validateField(field);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    Object.values(fields).forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    if (isValid) {
      // Show success message (no backend, just visual feedback)
      if (successMsg) {
        successMsg.classList.add('visible');
      }

      // Reset form
      form.reset();

      // Clear errors
      Object.values(fields).forEach(field => {
        if (field.element) field.element.classList.remove('error');
        if (field.error) field.error.classList.remove('visible');
      });

      // Hide success after 5 seconds
      setTimeout(() => {
        if (successMsg) successMsg.classList.remove('visible');
      }, 5000);
    }
  });
}

function validateField(field) {
  if (!field.element) return true;

  const value = field.element.value;
  const isValid = field.validate(value);

  if (isValid) {
    field.element.classList.remove('error');
    if (field.error) field.error.classList.remove('visible');
  } else {
    field.element.classList.add('error');
    if (field.error) field.error.classList.add('visible');
  }

  return isValid;
}

/* ============================================
   7. FEATURED WORK CAROUSEL
   ============================================ */

function initFeaturedCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = document.querySelectorAll('.carousel__slide');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const categoryLabel = document.getElementById('carousel-category-label');

  if (!track || !slides.length) return;

  let currentIndex = 0;
  const totalSlides = slides.length;

  function updateCarousel() {
    // Update active slide
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentIndex);
    });

    // Update category label
    if (categoryLabel) {
      const activeSlide = slides[currentIndex];
      const category = activeSlide.getAttribute('data-category') || '';
      
      // Fade out, change text, fade in
      categoryLabel.style.opacity = '0';
      categoryLabel.style.transform = 'translateY(-5px)';
      setTimeout(() => {
        categoryLabel.textContent = category;
        categoryLabel.style.opacity = '1';
        categoryLabel.style.transform = 'translateY(0)';
      }, 200);
    }

    // Calculate offset to center the active slide
    const slideWidth = slides[0].offsetWidth;
    const gap = 16; // matches --space-4
    const viewportWidth = track.parentElement.offsetWidth;
    const offset = (viewportWidth / 2) - (slideWidth / 2) - (currentIndex * (slideWidth + gap));
    
    track.style.transform = `translateX(${offset}px)`;
  }

  function goToSlide(index) {
    if (index < 0) {
      currentIndex = totalSlides - 1;
    } else if (index >= totalSlides) {
      currentIndex = 0;
    } else {
      currentIndex = index;
    }
    updateCarousel();
  }

  // Navigation buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  }

  // Click on slide to go to it
  slides.forEach((slide, i) => {
    slide.addEventListener('click', () => goToSlide(i));
  });

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  track.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToSlide(currentIndex + 1);
      } else {
        goToSlide(currentIndex - 1);
      }
    }
  }, { passive: true });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const carousel = document.getElementById('featured-carousel');
    if (!carousel) return;
    
    const rect = carousel.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
    
    if (isVisible) {
      if (e.key === 'ArrowLeft') goToSlide(currentIndex - 1);
      if (e.key === 'ArrowRight') goToSlide(currentIndex + 1);
    }
  });

  // Handle resize
  window.addEventListener('resize', () => {
    updateCarousel();
  });

  // Initialize
  updateCarousel();
}

