// --- Global Constants ---
const PRIMARY_RED = '#D2042D';
const SECONDARY_BLUE = '#0B61A4';

// --- Fee Data Structure (Sample Data - UPDATE IN README) ---
const courseFees = {
    'Software Engineering': { tuition: 80000, reg: 5000, library: 3000, exam: 4000 },
    'Information Technology (IT)': { tuition: 75000, reg: 5000, library: 3000, exam: 4000 },
    'Computer Science': { tuition: 85000, reg: 5000, library: 3000, exam: 4000 },
    'Accounting': { tuition: 65000, reg: 4000, library: 2500, exam: 3500 },
    'Business Management': { tuition: 60000, reg: 4000, library: 2500, exam: 3500 },
    'Data Science': { tuition: 90000, reg: 5000, library: 3500, exam: 4500 }
};

const DURATION_MULTIPLIERS = {
    'Term': 1,
    'Year': 3 // Assuming 3 terms per year for estimate
};

// --- Mobile Menu Toggle ---
document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen);
            // Accessibility improvement: adjust focus for better screen reader experience
            if (isOpen) {
                // Focus on the first link when menu opens
                navMenu.querySelector('a').focus();
            }
        });

        // Close menu on link click (for smooth scrolling/navigation)
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                // Only auto-close on mobile/tablet size where the toggle is visible
                if (window.innerWidth < 1024) {
                    navMenu.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Close menu on window resize if it transitions to desktop view
        window.addEventListener('resize', () => {
             if (window.innerWidth >= 1024) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
             }
        });
    }

    // --- Smooth Scrolling for Internal Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if it's an internal link on the current page
            if (this.pathname === window.location.pathname) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Page-Specific Initializers ---
    if (document.getElementById('fee-calculator-form')) {
        initializeFeeCalculator();
    }
    if (document.getElementById('application-form')) {
        initializeApplicationForm();
    }
    if (document.getElementById('sponsorship-form')) {
        initializeSponsorshipForm();
    }
});

// --- FEES.HTML: Fee Calculator Logic ---
function initializeFeeCalculator() {
    const form = document.getElementById('fee-calculator-form');
    const courseSelect = document.getElementById('calc-course');
    const durationSelect = document.getElementById('calc-duration');
    const outputDiv = document.getElementById('calc-output');

    // Populate course dropdown (for dynamic calculation)
    Object.keys(courseFees).forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });

    const calculateFee = () => {
        const course = courseSelect.value;
        const duration = durationSelect.value;

        if (!course || !duration) {
            outputDiv.innerHTML = '<p style="color:' + SECONDARY_BLUE + ';">Please select both a course and a duration.</p>';
            return;
        }

        const fees = courseFees[course];
        const multiplier = DURATION_MULTIPLIERS[duration];

        if (!fees || !multiplier) {
             outputDiv.innerHTML = `<p style="color:${PRIMARY_RED};">Error: Fee data missing for selection.</p>`;
             return;
        }

        const totalFeesPerTerm = fees.tuition + fees.reg + fees.library + fees.exam;
        const totalEstimate = totalFeesPerTerm * multiplier;

        outputDiv.innerHTML = `
            <p><strong>Course:</strong> ${course}</p>
            <p><strong>Duration:</strong> ${duration} (x${multiplier} term${multiplier > 1 ? 's' : ''} estimate)</p>
            <hr style="margin:0.5rem 0; border-color:${SECONDARY_BLUE};">
            <p><strong>Tuition per Term:</strong> KSh ${fees.tuition.toLocaleString('en-KE')}</p>
            <p><strong>Total Estimate:</strong> <span style="font-size:1.5rem; color:${PRIMARY_RED};">KSh ${totalEstimate.toLocaleString('en-KE')}</span></p>
            <p style="font-size:0.9rem; margin-top:0.5rem;">*Note: Estimate only. Final fees confirmed on application.</p>
        `;
    };

    // Attach listeners to recalculate on change
    courseSelect.addEventListener('change', calculateFee);
    durationSelect.addEventListener('change', calculateFee);

    // Initial calculation (or placeholder message)
    calculateFee();
}


// --- APPLY.HTML: Form Validation and Modal Logic ---
function initializeApplicationForm() {
    const form = document.getElementById('application-form');
    const modal = document.getElementById('confirmation-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const mailtoBtn = document.getElementById('modal-mailto-btn');

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Example Kenyan mobile number regex (starts with 07 or +2547, 10-12 digits total)
    const phoneRegex = /^(07|\+2547)\d{8}$/;
    
    // --- Validation Function ---
    const validateField = (input, regex = null, customCheck = null) => {
        const errorElement = input.nextElementSibling;
        let isValid = true;

        if (input.required && input.value.trim() === '') {
            errorElement.textContent = `${input.previousElementSibling.textContent} is required.`;
            isValid = false;
        } else if (regex && !regex.test(input.value.trim())) {
            errorElement.textContent = `Please enter a valid ${input.name} format.`;
            isValid = false;
        } else if (customCheck && !customCheck(input.value)) {
            errorElement.textContent = `Invalid value for ${input.name}.`;
            isValid = false;
        } else {
            errorElement.textContent = '';
            input.setAttribute('aria-invalid', 'false');
        }

        if (isValid) {
             errorElement.style.display = 'none';
             input.setAttribute('aria-invalid', 'false');
        } else {
             errorElement.style.display = 'block';
             input.setAttribute('aria-invalid', 'true');
        }
        return isValid;
    };

    // Add immediate feedback on input blur
    form.querySelectorAll('input, select, textarea').forEach(input => {
        // Skip file input for simple regex check
        if (input.type === 'file' || input.type === 'hidden') return;

        input.addEventListener('blur', () => {
            const regex = input.name === 'email' ? emailRegex : (input.name === 'phone' ? phoneRegex : null);
            validateField(input, regex);
        });
    });

    // --- Form Submission Handler ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isFormValid = true;
        
        // Validate all fields on submit
        form.querySelectorAll('input:not([type="file"]), select, textarea').forEach(input => {
            const regex = input.name === 'email' ? emailRegex : (input.name === 'phone' ? phoneRegex : null);
            if (!validateField(input, regex)) {
                isFormValid = false;
            }
        });

        if (isFormValid) {
            // 1. Process data (Client-side demo)
            const formData = new FormData(form);
            const applicantEmail = formData.get('email');
            
            // Log for demo and reset form (simulates successful backend submission)
            console.log('Application Form Submitted:', Object.fromEntries(formData.entries()));
            form.reset();

            // 2. Configure and Show Modal
            mailtoBtn.href = `mailto:${applicantEmail}?subject=Copy%20of%20Your%20College%20Application&body=Dear%20Applicant,%0A%0AThank%20you%20for%20your%20application.%20A%20copy%20of%20the%20data%20submitted%20is%20below%3A%0A%0A${encodeURIComponent(JSON.stringify(Object.fromEntries(formData.entries()), null, 2))}%0A%0AThe%20Admissions%20Office.`;
            
            modal.style.display = 'flex';
            modal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
            closeModalBtn.focus(); // Focus for accessibility
        } else {
            alert('Please correct the highlighted errors in the form.');
        }
    });

    // --- Modal Closing Logic ---
    const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Restore scrolling
        // Focus back to the application button or form start
        document.getElementById('application-form').querySelector('input').focus();
    };

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// --- SPONSORSHIP.HTML: Form Submission Placeholder ---
function initializeSponsorshipForm() {
    const form = document.getElementById('sponsorship-form');
    // Using a simpler approach since the prompt didn't require complex validation or modal for this form
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Client-side visual feedback
        submitBtn.textContent = 'Request Sent! We will contact you shortly.';
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = SECONDARY_BLUE;
        
        console.log('Sponsorship Inquiry Submitted:', Object.fromEntries(new FormData(form).entries()));

        setTimeout(() => {
            form.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = PRIMARY_RED;
            alert('Your sponsorship request has been submitted. Thank you!');
        }, 3000);
    });
}