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

function triggerConfettiBurst() {
    if (typeof confetti === 'function') {
        const successIcon = document.querySelector('.success-icon-wrapper');
        let originParams = { x: 0.5, y: 0.6 }; 

        if (successIcon) {
            const rect = successIcon.getBoundingClientRect();
            originParams = {
                x: (rect.left + (rect.width / 2)) / window.innerHeight,
                y: (rect.top + (rect.height / 2)) / window.innerHeight
            };
        }

        confetti({
            particleCount: 250,
            spread: 100,
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
    const contactInput = document.getElementById('contact_number');
    const usernameInput = document.getElementById('username');

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

            const usernameVal = usernameInput ? usernameInput.value.trim() : '';
            const contactVal = contactInput ? contactInput.value.trim() : '';
            const roleVal = roleInput ? roleInput.value.trim() : '';
            const passwordVal = passwordField ? passwordField.value : '';

            let errors = [];
            let invalidElements = [];

            // Rule 1: Check Empty Fields (Including System Role)
            if (!usernameVal) {
                invalidElements.push(usernameInput);
            }
            if (!contactVal) {
                invalidElements.push(contactInput);
            }
            if (!roleVal) {
                invalidElements.push(roleDisplay);
            }
            if (!passwordVal) {
                invalidElements.push(passwordField);
            }

            if (!usernameVal || !contactVal || !roleVal || !passwordVal) {
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
                window.location.href = 'thankyou.html';
            });
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'success') {
        setTimeout(triggerConfettiBurst, 150); 
    }
});