// script.js - USWAG SLP Interactive Functions & Modal Logic

/**
 * Requirement 4: One-time Welcome Alert Notification using localStorage
 */
function showWelcomeAlert() {
    const isAcknowledged = localStorage.getItem('uswag_welcome_acknowledged');
    const modal = document.getElementById('welcomeAlertModal');
    
    if (!isAcknowledged && modal) {
        modal.style.display = 'flex';
    }
}

function dismissModal() {
    const modal = document.getElementById('welcomeAlertModal');
    if (modal) {
        modal.style.display = 'none';
        localStorage.setItem('uswag_welcome_acknowledged', 'true');
    }
}

/**
 * Role Selection Pop-up Modal Controls
 */
function closeRoleModal() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) {
        roleModal.style.display = 'none';
    }
}

/**
 * Warning Modal Controls
 */
function closeWarningModal() {
    const warningModal = document.getElementById('warningModal');
    if (warningModal) {
        warningModal.style.display = 'none';
    }
}

/**
 * Requirement 7: Trigger Confetti Burst Animation
 * Updated to dynamically originate from the success icon
 */
function triggerConfettiBurst() {
    if (typeof confetti === 'function') {
        // Target the success icon wrapper
        const successIcon = document.querySelector('.success-icon-wrapper');
        
        // Default fallback origin
        let originParams = { x: 0.5, y: 0.6 }; 

        if (successIcon) {
            // Get the exact dimensions and position of the icon on the current screen
            const rect = successIcon.getBoundingClientRect();
            
            // Calculate the center point as a percentage of the viewport (0.0 to 1.0)
            originParams = {
                x: (rect.left + (rect.width / 2)) / window.innerWidth,
                y: (rect.top + (rect.height / 2)) / window.innerHeight
            };
        }

        confetti({
            particleCount: 120,
            spread: 70,
            origin: originParams
        });
    }
}

// Single Consolidated DOM Initialization Block (Fixes UI Glitches & Lag)
document.addEventListener("DOMContentLoaded", function() {
    
    // --- 1. Role Selection Modal Logic ---
    const roleDisplay = document.getElementById('roleDisplay');
    const roleModal = document.getElementById('roleModal');
    const roleInput = document.getElementById('role');
    const roleOptions = document.querySelectorAll('.role-option');

    if (roleDisplay && roleModal) {
        roleDisplay.addEventListener('click', function(e) {
            e.preventDefault();
            roleModal.style.display = 'flex';
        });
    }

    roleOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedRole = this.getAttribute('data-role');
            if (roleInput) roleInput.value = selectedRole;
            if (roleDisplay) roleDisplay.value = selectedRole;
            closeRoleModal();
        });
    });

    // --- 2. Password Visibility Toggle Logic ---
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password-field');

    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const isPassword = passwordField.getAttribute('type') === 'password';
            passwordField.setAttribute('type', isPassword ? 'text' : 'password');
            this.classList.toggle('fa-eye', !isPassword);
            this.classList.toggle('fa-eye-slash', isPassword);
        });
    }

    // --- 3. Form Validation & Async Submission (Fixes PHP Download Glitch) ---
    const regForm = document.getElementById('regForm');
    const submitBtn = document.getElementById('submitBtn');
    const contactInput = document.getElementById('contact_number');

    if (regForm) {
        regForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevents browser file download on local preview servers

            let isValid = true;
            const contactVal = contactInput ? contactInput.value.trim() : '';
            
            // Validate 11-digit Philippine contact number
            const contactRegex = /^\d{11}$/;
            if (!contactRegex.test(contactVal)) {
                const warningModal = document.getElementById('warningModal');
                const warningMessage = document.getElementById('warningMessage');
                
                if (warningModal && warningMessage) {
                    warningMessage.innerText = "Please enter a valid 11-digit cellphone number (e.g., 09222555100).";
                    warningModal.style.display = 'flex';
                } else {
                    // Fallback 
                    alert("Please enter a valid 11-digit cellphone number (e.g., 09222555100).");
                }
                isValid = false;
            }


            // Check required inputs
            const requiredInputs = regForm.querySelectorAll('[required]');
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                }
            });

            if (!isValid) {
                if (submitBtn) {
                    submitBtn.style.backgroundColor = "var(--accent-color)";
                    submitBtn.style.color = "#FFFFFF";
                }
                return;
            }

            // Prepare form payload
            const formData = new FormData(regForm);

            // Send registration data to PHP script asynchronously
            fetch('process_register.php', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                // Instantly navigate to thank you page
                window.location.href = 'thankyou.html';
            })
            .catch(error => {
                // Smooth fallback redirect to thank you page
                window.location.href = 'thankyou.html';
            });
        });

        // Reset submit button color when user types
        regForm.addEventListener('input', function() {
            if (submitBtn) {
                submitBtn.style.backgroundColor = "var(--secondary-color)";
            }
        });
    }

    // Trigger confetti if URL parameter contains success flag
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'success') {
        // Small delay ensures the DOM is fully rendered before calculating coordinates
        setTimeout(triggerConfettiBurst, 150); 
    }
});