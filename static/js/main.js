document.addEventListener('DOMContentLoaded', function() {
    // Section navigation
    const sections = document.querySelectorAll('section[id^="section-"]');
    const sectionDots = document.querySelectorAll('.section-dot');
    let activeSection = 0;
    
    // Next section buttons
    document.getElementById('next-section-1').addEventListener('click', () => scrollToSection(1));
    document.getElementById('next-section-2').addEventListener('click', () => scrollToSection(2));
    document.getElementById('next-section-3').addEventListener('click', () => scrollToSection(3));
    document.getElementById('next-section-4').addEventListener('click', () => scrollToSection(4));
    
    // Section dots
    sectionDots.forEach((dot, index) => {
        dot.addEventListener('click', function() {
            scrollToSection(index);
        });
    });
    
    function scrollToSection(index) {
        sections[index].scrollIntoView({ behavior: 'smooth' });
        activeSection = index;
        updateActiveDot();
    }
    
    function updateActiveDot() {
        sectionDots.forEach((dot, index) => {
            if (index === activeSection) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }
    
    // Scroll event to update active section
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeSection = index;
                updateActiveDot();
            }
        });
    });
    
    // Login modal
    const loginModal = document.getElementById('login-modal');
    const loginBtn = document.getElementById('login-btn');
    const accessDashboardBtn = document.getElementById('access-dashboard-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    
    loginBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
    
    accessDashboardBtn.addEventListener('click', () => {
        loginModal.classList.add('active');
    });
    
    closeModalBtn.addEventListener('click', () => {
        loginModal.classList.remove('active');
    });
    
    // Close modal when clicking outside
    loginModal.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.classList.remove('active');
        }
    });
    
    // Home button
    document.getElementById('home-btn').addEventListener('click', () => {
        scrollToSection(0);
    });
    
    // Check for flash messages and show login modal if there are any
    const flashMessages = document.querySelector('.error-message');
    if (flashMessages) {
        loginModal.classList.add('active');
    }
});