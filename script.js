// Global Variables
let currentSlide = 0;
let slides;
let dots;
let cars = [];
let currentUser = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize slideshow
    slides = document.querySelectorAll('.slide');
    initializeSlideshow();
    
    // Initialize form handlers
    initializeFormHandlers();
    
    // Initialize modal handlers
    initializeModalHandlers();
    
    // Initialize FAQ handlers
    initializeFAQHandlers();
    
    // Initialize hamburger menu
    initializeHamburgerMenu();

    // Add login button to nav
    addLoginButton();

    // Check if user is logged in
    checkLoginStatus();
});

function addLoginButton() {
    const navLinks = document.querySelector('.nav-links');
    const loginLi = document.createElement('li');
    loginLi.id = 'loginLi';
    loginLi.innerHTML = '<a href="#" onclick="showLoginModal()">Login</a>';
    navLinks.appendChild(loginLi);
}

function updateLoginButton() {
    const loginLi = document.getElementById('loginLi');
    if (currentUser) {
        loginLi.innerHTML = `
            <div class="user-menu">
                ${currentUser.name} ▼
                <div class="user-dropdown">
                    <a href="#" onclick="showRentHistory()">Rent History</a>
                    <a href="#" onclick="showChangePassword()">Change Password</a>
                    <a href="#" onclick="logout()">Logout</a>
                </div>
            </div>`;
    } else {
        loginLi.innerHTML = '<a href="#" onclick="showLoginModal()">Login</a>';
    }
}

function checkLoginStatus() {
    const user = localStorage.getItem('user');
    if (user) {
        currentUser = JSON.parse(user);
        updateLoginButton();
    }
}

// Hamburger Menu Handlers
function initializeHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links li');
    let isMenuOpen = false;

    if (!hamburger) return; // Exit if hamburger doesn't exist

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Toggle body scroll
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Animate menu items
        navItems.forEach((item, index) => {
            if (isMenuOpen) {
                item.style.animation = `slideIn 0.5s ease forwards ${index * 0.1 + 0.3}s`;
            } else {
                item.style.animation = '';
            }
        });
    }

    function closeMenu() {
        if (isMenuOpen) {
            isMenuOpen = false;
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
            navItems.forEach(item => {
                item.style.animation = '';
            });
        }
    }

    // Event Listeners
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking navigation links
    navItems.forEach(item => {
        item.addEventListener('click', closeMenu);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isClickInside = navLinks.contains(e.target) || hamburger.contains(e.target);
        if (!isClickInside && isMenuOpen) {
            closeMenu();
        }
    });

    // Close menu on resize if in desktop mode
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });

    // Add keydown event for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            closeMenu();
        }
    });
}

// Slideshow Functions
function initializeSlideshow() {
    // Create dots
    const dotsContainer = document.querySelector('.dots-container');
    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        dot.onclick = () => setSlide(i);
        dotsContainer.appendChild(dot);
    }
    dots = document.querySelectorAll('.dot');
    
    // Show first slide
    showSlide(0);
    
    // Auto advance slides
    setInterval(() => changeSlide(1), 5000);
}

function showSlide(n) {
    // Remove active class from all slides and dots
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Handle array bounds
    currentSlide = n;
    if (currentSlide >= slides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    
    // Show current slide and dot
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function changeSlide(direction) {
    showSlide(currentSlide + direction);
}

function setSlide(n) {
    showSlide(n);
}

// Car Data Functions
async function fetchCars() {
    try {
        const response = await fetch('http://localhost:3000/api/cars');
        const data = await response.json();
        cars = data;
        loadCarsIntoSelect();
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Display cars in the fleet grid
function displayCars(cars) {
    const fleetGrid = document.getElementById('fleetGrid');
    fleetGrid.innerHTML = '';

    // Create list container
    const listContainer = document.createElement('div');
    listContainer.className = 'fleet-list';

    cars.forEach(car => {
        const carItem = document.createElement('div');
        carItem.className = 'car-list-item';
        carItem.innerHTML = `
            <img src="${car.image}" alt="${car.name}" class="car-list-image">
            <div class="car-list-details">
                <div class="car-list-header">
                    <h3 class="car-list-name">${car.name}</h3>
                    <div class="car-list-price">£${car.price}/day</div>
                </div>
                <div class="car-category">${car.category}</div>
                <div class="car-list-features">
                    <div class="car-feature">
                        <i class="fas fa-user-friends"></i>
                        <span>${car.features.seats} Seats</span>
                    </div>
                    <div class="car-feature">
                        <i class="fas fa-suitcase"></i>
                        <span>${car.features.luggage} Luggage</span>
                    </div>
                    <div class="car-feature">
                        <i class="fas fa-cog"></i>
                        <span>${car.features.transmission}</span>
                    </div>
                </div>
            </div>
        `;
        listContainer.appendChild(carItem);
    });

    fleetGrid.appendChild(listContainer);
}

// Initialize form handlers
function initializeFormHandlers() {
    const rentalForm = document.getElementById('rental-form');
    const carSelect = document.getElementById('carModel');
    
    // Load cars into select dropdown
    loadCarsIntoSelect();
    
    if (rentalForm) {
        rentalForm.addEventListener('submit', handleFormSubmit);
        console.log('Rental form handler initialized');
    } else {
        console.error('Rental form not found');
    }
}

// Load cars into select dropdown
async function loadCarsIntoSelect() {
    try {
        const response = await fetch('http://localhost:3000/api/cars');
        const cars = await response.json();
        
        const carSelect = document.getElementById('carModel');
        if (!carSelect) {
            console.error('Car select element not found');
            return;
        }
        
        // Clear existing options
        carSelect.innerHTML = '<option value="">Select a Car</option>';
        
        // Add cars to select
        cars.forEach(car => {
            const option = document.createElement('option');
            option.value = car.car_id;
            option.textContent = `${car.car_model} - ${car.type} ($${car.price}/day)`;
            carSelect.appendChild(option);
        });
        
        // Store cars in global variable for price calculation
        window.cars = cars;
        
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Form Submission Handler
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }

    const formData = {
        car_id: parseInt(document.getElementById('carModel').value),
        full_name: document.getElementById('fullName').value,
        full_address: document.getElementById('address').value,
        phone_number: document.getElementById('phone').value,
        driving_license: document.getElementById('license').value,
        pickup_date: document.getElementById('pickupDate').value,
        return_date: document.getElementById('returnDate').value,
        total_price: calculateTotalPrice()
    };

    // Validate all fields
    for (const [key, value] of Object.entries(formData)) {
        if (!value && value !== 0) {
            alert(`Please fill in all fields. Missing: ${key.replace(/_/g, ' ')}`);
            return;
        }
    }

    // Store booking data temporarily
    window.pendingBooking = formData;
    
    // Close the rental form modal and show payment modal
    closeModal('rentalFormModal');
    showPaymentModal(formData.total_price);
}

// Payment Modal
function showPaymentModal(totalPrice) {
    const paymentContent = `
        <h2>Payment Details</h2>
        <p class="total-price">Total Amount: $${totalPrice}</p>
        <form id="paymentForm">
            <div class="form-group">
                <label for="cardName">Name on Card</label>
                <input type="text" id="cardName" placeholder="John Doe" required>
            </div>
            <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" 
                    maxlength="19" pattern="[0-9 ]{16,19}" required>
            </div>
            <div class="payment-row">
                <div class="form-group half">
                    <label for="expiryDate">Expiry Date</label>
                    <input type="text" id="expiryDate" placeholder="MM/YY" 
                        maxlength="5" pattern="[0-9]{2}/[0-9]{2}" required>
                </div>
                <div class="form-group half">
                    <label for="cvv">CVV</label>
                    <input type="password" id="cvv" placeholder="123" 
                        maxlength="3" pattern="[0-9]{3}" required>
                </div>
            </div>
            <button type="submit" class="btn">Confirm Payment</button>
        </form>
    `;
    
    const { modalOverlay, modal, closeModal } = createModal(paymentContent);
    
    // Add payment form handler
    document.getElementById('paymentForm').onsubmit = async (e) => {
        e.preventDefault();
        
        // Get the booking data
        const bookingData = window.pendingBooking;
        if (!bookingData) {
            alert('Booking data not found');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(bookingData)
            });

            if (response.status === 401) {
                currentUser = null;
                localStorage.removeItem('user');
                updateLoginButton();
                alert('Session expired. Please login again.');
                closeModal();
                showLoginModal();
                return;
            }

            const data = await response.json();
            
            if (response.ok) {
                alert('Booking successful! Thank you for your payment.');
                document.getElementById('rental-form').reset();
                window.pendingBooking = null; // Clear the pending booking
                closeModal();
            } else {
                alert(data.error || 'Booking failed');
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('rental-form').reset();
            window.pendingBooking = null;
            closeModal();
            alert('Booking successful! Thank you for your payment.');
        }
    };

    // Format card number input
    const cardNumber = document.getElementById('cardNumber');
    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        if (value.length > 16) value = value.substr(0, 16);
        e.target.value = value.replace(/(.{4})/g, '$1 ').trim();
    });

    // Format expiry date input
    const expiryDate = document.getElementById('expiryDate');
    expiryDate.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substr(0, 2) + '/' + value.substr(2);
        }
        e.target.value = value;
    });
}

function calculateTotalPrice() {
    const carSelect = document.getElementById('carModel');
    const pickupDate = new Date(document.getElementById('pickupDate').value);
    const returnDate = new Date(document.getElementById('returnDate').value);
    
    if (!carSelect.value || !pickupDate || !returnDate || isNaN(pickupDate) || isNaN(returnDate)) {
        return 0;
    }
    
    const selectedCar = window.cars.find(car => car.car_id === parseInt(carSelect.value));
    if (!selectedCar) {
        return 0;
    }
    
    const days = Math.ceil((returnDate - pickupDate) / (1000 * 60 * 60 * 24));
    return days * selectedCar.price;
}

// Login/Register Functions
async function login(username, password) {
    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (response.ok) {
            currentUser = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
            updateLoginButton();
            return true;
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

function showLoginModal() {
    const loginContent = `
        <h2>Login</h2>
        <form id="loginForm">
            <div class="form-group">
                <input type="text" id="loginUsername" placeholder="Username" required>
            </div>
            <div class="form-group">
                <input type="password" id="loginPassword" placeholder="Password" required>
            </div>
            <button type="submit" class="btn">Login</button>
        </form>
        <p>Don't have an account? <a href="#" id="showRegister">Register here</a></p>
    `;
    
    const { modalOverlay, modal, closeModal } = createModal(loginContent);
    
    // Event handlers
    document.getElementById('showRegister').onclick = (e) => {
        e.preventDefault();
        modalOverlay.remove();
        showRegisterModal();
    };
    
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await login(username, password);
            closeModal();
            alert('Login successful!');
        } catch (error) {
            alert(error.message || 'Login failed');
        }
    };
}

function showRegisterModal() {
    const registerContent = `
        <h2>Register</h2>
        <form id="registerForm">
            <div class="form-group">
                <input type="text" id="regName" placeholder="Full Name" required>
            </div>
            <div class="form-group">
                <input type="email" id="regEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
                <input type="text" id="regUsername" placeholder="Username" required>
            </div>
            <div class="form-group">
                <input type="password" id="regPassword" placeholder="Password" required>
            </div>
            <button type="submit" class="btn">Register</button>
        </form>
        <p>Already have an account? <a href="#" id="showLogin">Login here</a></p>
    `;
    
    const { modalOverlay, modal, closeModal } = createModal(registerContent);
    
    // Event handlers
    document.getElementById('showLogin').onclick = (e) => {
        e.preventDefault();
        modalOverlay.remove();
        showLoginModal();
    };
    
    document.getElementById('registerForm').onsubmit = async (e) => {
        e.preventDefault();
        const customer_name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const username = document.getElementById('regUsername').value;
        const password = document.getElementById('regPassword').value;

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customer_name, email, username, password })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Registration successful! Please login.');
                modalOverlay.remove();
                showLoginModal();
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Registration failed');
        }
    };
}

async function logout() {
    try {
        await fetch('http://localhost:3000/api/logout', {
            credentials: 'include'
        });
        currentUser = null;
        localStorage.removeItem('user');
        updateLoginButton();
        alert('Logged out successfully');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function showRentHistory() {
    try {
        const response = await fetch('http://localhost:3000/api/bookings/history', {
            credentials: 'include'
        });
        const bookings = await response.json();
        
        const modalContent = `
            <h2>Your Rental History</h2>
            <div class="booking-history">
                ${bookings.map(booking => `
                    <div class="booking-item">
                        <h3>${booking.car_model} (${booking.type})</h3>
                        <p>Pickup: ${new Date(booking.pickup_date).toLocaleDateString()}</p>
                        <p>Return: ${new Date(booking.return_date).toLocaleDateString()}</p>
                        <p>Total Price: £${booking.total_price}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        const { modalOverlay, modal, closeModal } = createModal(modalContent);
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching rental history');
    }
}

// Change Password Modal
function showChangePassword() {
    if (!currentUser) {
        alert('Please login first');
        showLoginModal();
        return;
    }

    const changePasswordContent = `
        <h2>Change Password</h2>
        <form id="changePasswordForm">
            <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" required>
            </div>
            <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" id="newPassword" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" required>
            </div>
            <button type="submit" class="btn">Update Password</button>
        </form>
    `;
    
    const { modalOverlay, modal, closeModal } = createModal(changePasswordContent);
    
    document.getElementById('changePasswordForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword })
            });
            
            if (response.status === 401) {
                currentUser = null;
                localStorage.removeItem('user');
                updateLoginButton();
                alert('Session expired. Please login again.');
                closeModal();
                showLoginModal();
                return;
            }
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Password updated successfully');
                closeModal();
            } else {
                alert(data.error || 'Error updating password');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating password. Please try again.');
        }
    };
}

// Modal utility function
function createModal(modalContent) {
    // Create modal container
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = modalContent;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = 'position: absolute; right: 10px; top: 10px; background: none; border: none; font-size: 24px; cursor: pointer;';
    modal.appendChild(closeButton);
    
    // Add to DOM
    modalOverlay.appendChild(modal);
    document.body.appendChild(modalOverlay);
    
    // Close handlers
    const closeModal = () => {
        modalOverlay.remove();
    };
    
    closeButton.onclick = closeModal;
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) {
            closeModal();
        }
    };
    
    // Prevent closing when clicking inside modal
    modal.onclick = (e) => {
        e.stopPropagation();
    };
    
    return { modalOverlay, modal, closeModal };
}

// Modal Handlers
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
}

function initializeModalHandlers() {
    // Get all modals
    const modals = {
        rental: document.getElementById('rentalFormModal'),
        summary: document.getElementById('summaryModal'),
        about: document.getElementById('aboutModal'),
        contact: document.getElementById('contactModal'),
        fleet: document.getElementById('fleetModal')
    };
    
    // Get all close buttons
    const closeButtons = document.querySelectorAll('.close');
    
    // Add click event to all close buttons
    closeButtons.forEach(button => {
        button.onclick = function() {
            Object.values(modals).forEach(modal => {
                if (modal) modal.style.display = 'none';
            });
            enableScroll();
        }
    });
    
    // Click outside modal to close
    window.onclick = function(event) {
        Object.entries(modals).forEach(([key, modal]) => {
            if (event.target === modal) {
                modal.style.display = 'none';
                enableScroll();
            }
        });
    };

    // Handle scroll behavior
    Object.values(modals).forEach(modal => {
        if (modal) {
            modal.addEventListener('show', disableScroll);
            modal.addEventListener('hide', enableScroll);
        }
    });
}

// Scroll Control Functions
function disableScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

function enableScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

// Show modal functions with scroll control
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        disableScroll();
        modal.dispatchEvent(new Event('show'));
    }
}

function showFleetModal() {
    showModal('fleetModal');
    updateNavActiveState('cars');
    if (!window.carsLoaded) {
        loadAndDisplayCars();
    }
}

function showRentalFormModal() {
    showModal('rentalFormModal');
    updateNavActiveState('rental');
}

function showAboutModal() {
    showModal('aboutModal');
    updateNavActiveState('about');
}

function showContactModal() {
    showModal('contactModal');
    updateNavActiveState('contact');
}

// Navigation Handlers
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
            
            // If clicking Rent Now in nav, show rental section
            if (this.getAttribute('href') === '#rental') {
                showRentalSection();
            }
        });
    });
});

// Function to show rental section
function showRentalSection() {
    const rentalSection = document.getElementById('rental');
    if (rentalSection) {
        // Show the section
        rentalSection.style.display = 'block';
        
        // Add some delay before scrolling to ensure the section is visible
        setTimeout(() => {
            // Scroll to rental section smoothly
            rentalSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            // Update nav active state
            const navLinks = document.querySelectorAll('.nav-links a');
            navLinks.forEach(link => link.classList.remove('active'));
            const rentalLink = document.querySelector('a[href="#rental"]');
            if (rentalLink) {
                rentalLink.classList.add('active');
            }
        }, 100);
    }
}

// FAQ Handlers
function initializeFAQHandlers() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            item.classList.toggle('active');
        });
    });
}

// Update navigation active state
function updateNavActiveState(activeSection) {
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${activeSection}`) {
            link.classList.add('active');
        }
    });
}

// Show fleet modal
function showFleetModal() {
    const modal = document.getElementById('fleetModal');
    modal.style.display = 'block';
    
    // Update nav active state
    updateNavActiveState('cars');

    // Load cars if not already loaded
    if (!window.carsLoaded) {
        loadAndDisplayCars();
    }
}

// Initialize fleet category tabs
function initializeFleetTabs() {
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
            // Filter cars by category
            const category = tab.dataset.category;
            filterCarsByCategory(category);
        });
    });
}

// Load and display cars from JSON file
async function loadAndDisplayCars() {
    try {
        const response = await fetch('http://localhost:3000/api/cars');
        const carsData = await response.json();
        window.cars = carsData;
        window.carsLoaded = true;
        displayCars(carsData);
    } catch (error) {
        console.error('Error loading cars:', error);
    }
}

// Filter cars by category
function filterCarsByCategory(category) {
    if (!window.cars) return;

    const filteredCars = category === 'all' 
        ? window.cars 
        : window.cars.filter(car => car.category.toLowerCase() === category.toLowerCase());
    
    displayCars(filteredCars);
}
