// Wait for the DOM to be fully loaded before executing any code
document.addEventListener('DOMContentLoaded', function() {
    // Form submission handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        // Prevent the default form submission behavior
        e.preventDefault();
        
        // Get values from form fields
        const username = document.querySelector('input[type="text"]').value;
        const password = document.querySelector('input[type="password"]').value;
        const remember = document.getElementById('remember').checked;
        
        // Validate username (must not be empty)
        if (!username) {
            alert('Please enter your username');
            return;
        }
        
        // Validate password (must not be empty)
        if (!password) {
            alert('Please enter your password');
            return;
        }
        
        // Validate password length (minimum 8 characters)
        if (password.length < 8) {
            alert('Password must be at least 8 characters long');
            return;
        }
        
        // Log form data to console (for development purposes)
        // In production, you would send this data to a server
        console.log('Login information:', {
            username,
            password,
            remember
        });
        
        // Simulate successful login
        // In a real application, this would happen after server response
        alert('Login successful!');
    });

    // Google login button click handler
    document.querySelector('.google-login').addEventListener('click', function() {
        // Alert user about Google login
        // In a real application, this would redirect to Google OAuth
        alert('Redirecting to Google login...');
        
        // Here you would normally integrate with Google Sign-In API
        // Example code:
        // function onSignIn(googleUser) {
        //   var profile = googleUser.getBasicProfile();
        //   console.log('ID: ' + profile.getId());
        //   console.log('Name: ' + profile.getName());
        //   console.log('Email: ' + profile.getEmail());
        // }
        
        // In production, you would redirect to Google's OAuth endpoint:
        // window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&...';
    });
    // Toggle password visibility
    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordField = document.getElementById('password');
        const eyeIcon = document.getElementById('eyeIcon');
        
        if (passwordField.type === 'password') {
            passwordField.type = 'text';
            eyeIcon.classList.remove('fa-eye');
            eyeIcon.classList.add('fa-eye-slash');
        } else {
            passwordField.type = 'password';
            eyeIcon.classList.remove('fa-eye-slash');
            eyeIcon.classList.add('fa-eye');
        }
    });
});