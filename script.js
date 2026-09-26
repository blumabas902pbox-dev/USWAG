// script.js - USWAG SLP Interactive Functions & Strict Modal Validation

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

function closeRoleModal() {
    const roleModal = document.getElementById('roleModal');
    if (roleModal) {
        roleModal.style.display = 'none';
    }
}

function closeWarningModal() {
    const warningModal = document.getElementById('warningModal');
    if (warningModal) {
        warningModal.style.display = 'none';
    }
}

// Function to prevent weak passwords
function isWeakPassword(password) {
    const lowerPwd = password.toLowerCase();
    
    // Exact matches for extremely common passwords
    const commonWeak = ['password', '12345678', '123456789', 'qwertyui', 'qwertyuiop', 'admin123', '11111111', '12341234'];
    if (commonWeak.includes(lowerPwd)) return true;
    
    // Check for sequential numbers (e.g., 1234, 9876)
    if (/(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(lowerPwd)) return true;
    
    // Check for repeated identical characters (e.g., aaaaaaaa, 88888888)
    if (/^(.)\1+$/.test(password)) return true;

    // Check for sequential keyboard letters
    if (/(qwer|asdf|zxcv|abcd|1q2w)/.test(lowerPwd)) return true;

    return false;
}

function triggerConfettiBurst() {
    if (typeof confetti === 'function') {
        const successIcon = document.querySelector('.success-icon-wrapper');
        let originParams = { x: 0.5, y: 0.5 }; // Default center of page

        if (successIcon) {
            const rect = successIcon.getBoundingClientRect();
            // Fixed: use window.innerWidth for X and window.innerHeight for Y
            originParams = {
                x: (rect.left + (rect.width / 2)) / window.innerWidth,
                y: (rect.top + (rect.height / 2)) / window.innerHeight
            };
        }

        // Updated parameters for a perfect circle scattering effect
        confetti({
            particleCount: 350,
            spread: 360,           // 360 makes it a full circle
            startVelocity: 35,     // Pushes them outwards nicely
            gravity: 0.6,          // Floats down a bit slower
            ticks: 250,
            origin: originParams
        });
    }
}

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
            if (roleDisplay) {
                roleDisplay.value = selectedRole;
                roleDisplay.classList.remove('input-error'); // Clear red error when role selected
            }
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

    // --- 3. Form Validation & Async Submission ---
    const regForm = document.getElementById('regForm');
    const submitBtn = document.getElementById('submitBtn');
    const usernameInput = document.getElementById('username');
    const addressInput = document.getElementById('address'); // Added missing DOM target
    const contactInput = document.getElementById('contact_number');

    if (regForm) {
        // Clear red error highlight dynamically as user types
        const allInputs = regForm.querySelectorAll('input');
        allInputs.forEach(input => {
            input.addEventListener('input', function() {
                this.classList.remove('input-error');
                if (submitBtn) {
                    submitBtn.style.backgroundColor = "var(--secondary-color)";
                }
            });
        });

        regForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const warningModal = document.getElementById('warningModal');
            const warningMessage = document.getElementById('warningMessage');

            // Helper function to show Oops popup and turn button red
            function triggerWarning(msg, invalidInputs = []) {
                invalidInputs.forEach(input => {
                    if (input) input.classList.add('input-error');
                });

                if (warningModal && warningMessage) {
                    warningMessage.innerText = msg;
                    warningModal.style.display = 'flex';
                } else {
                    alert(msg);
                }

                if (submitBtn) {
                    submitBtn.style.backgroundColor = "var(--accent-color)";
                    submitBtn.style.color = "#FFFFFF";
                }
            }

            // Reset error highlights before validating
            allInputs.forEach(input => input.classList.remove('input-error'));

            // Safely get all values (now properly trimming inputs including 'ñ' gracefully)
            const usernameVal = usernameInput ? usernameInput.value.trim() : '';
            const addressVal = addressInput ? addressInput.value.trim() : '';
            const contactVal = contactInput ? contactInput.value.trim() : '';
            const roleVal = roleInput ? roleInput.value.trim() : '';
            const passwordVal = passwordField ? passwordField.value : ''; // Do not trim password

            let invalidElements = [];

            // Rule 1: Check Empty Fields (Including System Role)
            if (!usernameVal) invalidElements.push(usernameInput);
            if (!addressVal) invalidElements.push(addressInput);
            if (!contactVal) invalidElements.push(contactInput);
            if (!roleVal) invalidElements.push(roleDisplay);
            if (!passwordVal) invalidElements.push(passwordField);

            if (!usernameVal || !addressVal || !contactVal || !roleVal || !passwordVal) {
                triggerWarning("Please fill in all required fields and select a System Role.", invalidElements);
                return;
            }

            // Rule 2: Strictly 11 Digits for Contact Number
            const contactRegex = /^\d{11}$/;
            if (!contactRegex.test(contactVal)) {
                triggerWarning("Contact number must strictly be exactly 11 digits (e.g., 09071128654).", [contactInput]);
                return;
            }

            // Rule 3: Strictly At Least 8 Characters for Password
            if (passwordVal.length < 8) {
                triggerWarning("Account password must strictly be at least 8 characters long.", [passwordField]);
                return;
            }

            // Rule 4: Prevent Weak Password Combinations
            if (isWeakPassword(passwordVal)) {
                triggerWarning("Your password is too weak. Please avoid common combinations (like '1234'), repeated characters, or simple words.", [passwordField]);
                return;
            }

            // If all validation passes, proceed with form submission
            const formData = new FormData(regForm);

            fetch('process_register.php', {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            })
            .then(response => {
                window.location.href = 'thankyou.html';
            })
            .catch(error => {
                // Failsafe trigger (if process_register.php doesn't exist yet, it still goes to thank you)
                window.location.href = 'thankyou.html';
            });
        });
    }

    // Checking successful redirect
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'success') {
        setTimeout(triggerConfettiBurst, 150); 
    }
});