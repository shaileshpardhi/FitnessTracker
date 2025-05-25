// Global Variables
let currentSection = 'dashboard';
let workoutTimer = null;
let timerSeconds = 0;
let isTimerRunning = false;
let currentMealType = '';

// Data Storage
const userData = {
    caloriesBurned: 0,
    workoutTime: 0,
    waterIntake: 0,
    streakCount: 0,
    caloriesConsumed: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    weight: [],
    workouts: [],
    meals: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
    },
    achievements: [],
    settings: {
        calorieGoal: 2000,
        waterGoal: 8,
        reminderTime: 'off'
    }
};

// Exercise Database
const exercises = {
    strength: [
        { name: 'Push-ups', duration: '3 sets x 15 reps', icon: 'fas fa-hand-rock', calories: 50 },
        { name: 'Squats', duration: '3 sets x 20 reps', icon: 'fas fa-arrow-down', calories: 60 },
        { name: 'Planks', duration: '3 sets x 60 sec', icon: 'fas fa-minus', calories: 40 },
        { name: 'Lunges', duration: '3 sets x 12 reps', icon: 'fas fa-walking', calories: 55 },
        { name: 'Burpees', duration: '3 sets x 10 reps', icon: 'fas fa-fire', calories: 80 }
    ],
    cardio: [
        { name: 'Running', duration: '30 minutes', icon: 'fas fa-running', calories: 300 },
        { name: 'Cycling', duration: '45 minutes', icon: 'fas fa-bicycle', calories: 400 },
        { name: 'Jump Rope', duration: '15 minutes', icon: 'fas fa-circle', calories: 200 },
        { name: 'Swimming', duration: '30 minutes', icon: 'fas fa-swimmer', calories: 350 },
        { name: 'Dancing', duration: '30 minutes', icon: 'fas fa-music', calories: 250 }
    ],
    flexibility: [
        { name: 'Yoga Flow', duration: '30 minutes', icon: 'fas fa-leaf', calories: 120 },
        { name: 'Stretching', duration: '15 minutes', icon: 'fas fa-expand-arrows-alt', calories: 50 },
        { name: 'Pilates', duration: '45 minutes', icon: 'fas fa-circle-notch', calories: 180 },
        { name: 'Meditation', duration: '20 minutes', icon: 'fas fa-om', calories: 30 },
        { name: 'Tai Chi', duration: '30 minutes', icon: 'fas fa-yin-yang', calories: 100 }
    ],
    hiit: [
        { name: 'Tabata', duration: '20 minutes', icon: 'fas fa-bolt', calories: 250 },
        { name: 'Circuit Training', duration: '30 minutes', icon: 'fas fa-sync', calories: 300 },
        { name: 'Sprint Intervals', duration: '25 minutes', icon: 'fas fa-tachometer-alt', calories: 350 },
        { name: 'Kettlebell HIIT', duration: '20 minutes', icon: 'fas fa-weight-hanging', calories: 280 },
        { name: 'Bodyweight HIIT', duration: '25 minutes', icon: 'fas fa-fist-raised', calories: 320 }
    ]
};

// Achievements Database
const achievements = [
    { id: 'first_workout', name: 'First Steps', description: 'Complete your first workout', icon: 'fas fa-baby', unlocked: false },
    { id: 'week_streak', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: 'fas fa-fire', unlocked: false },
    { id: 'calorie_burner', name: 'Calorie Crusher', description: 'Burn 1000 calories in a day', icon: 'fas fa-burn', unlocked: false },
    { id: 'hydration_hero', name: 'Hydration Hero', description: 'Drink 8 glasses of water', icon: 'fas fa-tint', unlocked: false },
    { id: 'consistency_king', name: 'Consistency King', description: 'Work out 30 days in a row', icon: 'fas fa-crown', unlocked: false },
    { id: 'strength_master', name: 'Strength Master', description: 'Complete 50 strength workouts', icon: 'fas fa-dumbbell', unlocked: false }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Show loading screen
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        initializeApp();
    }, 2000);
});

function initializeApp() {
    loadUserData();
    setupEventListeners();
    updateDashboard();
    renderAchievements();
    initializeCharts();
    showSection('dashboard');
}

// Load user data from localStorage
function loadUserData() {
    const savedData = localStorage.getItem('fitTrackData');
    if (savedData) {
        Object.assign(userData, JSON.parse(savedData));
    }
    
    // Initialize achievements if not present
    if (!userData.achievements.length) {
        userData.achievements = [...achievements];
    }
}

// Save user data to localStorage
function saveUserData() {
    localStorage.setItem('fitTrackData', JSON.stringify(userData));
}

// Setup Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            showSection(section);
        });
    });

    // Mobile navigation toggle
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });
}

// Show Section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    document.getElementById(sectionName).classList.add('active');

    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    currentSection = sectionName;

    // Load section-specific content
    if (sectionName === 'workouts') {
        loadWorkoutCategories();
    } else if (sectionName === 'nutrition') {
        updateNutritionDisplay();
    } else if (sectionName === 'progress') {
        updateProgressCharts();
    }
}

// Update Dashboard
function updateDashboard() {
    document.getElementById('calories-burned').textContent = userData.caloriesBurned;
    document.getElementById('workout-time').textContent = userData.workoutTime;
    document.getElementById('water-intake').textContent = userData.waterIntake;
    document.getElementById('streak-count').textContent = userData.streakCount;

    // Update progress bars
    updateProgressBar('workout-progress', 'workout-percentage', userData.workoutTime, 60);
    updateProgressBar('water-progress', 'water-percentage', userData.waterIntake, userData.settings.waterGoal);
    updateProgressBar('steps-progress', 'steps-percentage', 5000, 10000); // Mock steps data
}

function updateProgressBar(barId, percentageId, current, goal) {
    const percentage = Math.min((current / goal) * 100, 100);
    document.getElementById(barId).style.width = percentage + '%';
    document.getElementById(percentageId).textContent = Math.round(percentage) + '%';
}

// Quick Actions
function startQuickWorkout() {
    showSection('workouts');
    document.getElementById('workout-timer').style.display = 'block';
    startTimer(1800); // 30 minutes
}

function logWater() {
    userData.waterIntake++;
    updateDashboard();
    saveUserData();
    showNotification('Water logged! Stay hydrated! 💧');
    checkAchievements();
}

function openBMICalculator() {
    showSection('profile');
    document.querySelector('.bmi-calculator').scrollIntoView({ behavior: 'smooth' });
}

function viewProgress() {
    showSection('progress');
}

// Workout Timer Functions
function startTimer(seconds) {
    timerSeconds = seconds;
    updateTimerDisplay();
    
    if (!isTimerRunning) {
        toggleTimer();
    }
}

function toggleTimer() {
    if (isTimerRunning) {
        clearInterval(workoutTimer);
        document.getElementById('start-pause-btn').innerHTML = '<i class="fas fa-play"></i>';
        isTimerRunning = false;
    } else {
        workoutTimer = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            updateTimerCircle();
            
            if (timerSeconds <= 0) {
                clearInterval(workoutTimer);
                completeWorkout();
            }
        }, 1000);
        
        document.getElementById('start-pause-btn').innerHTML = '<i class="fas fa-pause"></i>';
        isTimerRunning = true;
    }
}

function resetTimer() {
    clearInterval(workoutTimer);
    timerSeconds = 0;
    isTimerRunning = false;
    document.getElementById('start-pause-btn').innerHTML = '<i class="fas fa-play"></i>';
    updateTimerDisplay();
    updateTimerCircle();
    document.getElementById('workout-timer').style.display = 'none';
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    document.getElementById('timer-minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('timer-seconds').textContent = seconds.toString().padStart(2, '0');
}

function updateTimerCircle() {
    const circle = document.getElementById('timer-circle');
    const totalSeconds = 1800; // 30 minutes
    const progress = ((totalSeconds - timerSeconds) / totalSeconds) * 283;
    circle.style.strokeDashoffset = 283 - progress;
}

function completeWorkout() {
    const workoutMinutes = 30;
    const caloriesBurned = 250;
    
    userData.workoutTime += workoutMinutes;
    userData.caloriesBurned += caloriesBurned;
    userData.workouts.push({
        date: new Date().toISOString(),
        duration: workoutMinutes,
        calories: caloriesBurned,
        type: 'General Workout'
    });
    
    updateDashboard();
    saveUserData();
    showNotification('Workout completed! Great job! 🔥');
    checkAchievements();
    resetTimer();
}

// Workout Categories
function loadWorkoutCategories() {
    // Categories are already in HTML, just add click handlers
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', function() {
            const category = this.onclick.toString().match(/'([^']+)'/)[1];
            selectWorkoutCategory(category);
        });
    });
}

function selectWorkoutCategory(category) {
    const exerciseList = document.getElementById('exercise-list');
    const categoryExercises = exercises[category] || [];
    
    exerciseList.innerHTML = '';
    
    categoryExercises.forEach(exercise => {
        const exerciseItem = document.createElement('div');
        exerciseItem.className = 'exercise-item';
        exerciseItem.innerHTML = `
            <div class="exercise-info">
                <div class="exercise-icon">
                    <i class="${exercise.icon}"></i>
                </div>
                <div class="exercise-details">
                    <h4>${exercise.name}</h4>
                    <p>${exercise.duration}</p>
                </div>
            </div>
            <div class="exercise-duration">
                ${exercise.calories} cal
            </div>
        `;
        
        exerciseItem.addEventListener('click', () => startExercise(exercise));
        exerciseList.appendChild(exerciseItem);
    });
}

function startExercise(exercise) {
    showNotification(`Starting ${exercise.name}! Let's go! 💪`);
    document.getElementById('workout-timer').style.display = 'block';
    
    // Set timer based on exercise type
    let duration = 1800; // Default 30 minutes
    if (exercise.duration.includes('15')) duration = 900;
    if (exercise.duration.includes('20')) duration = 1200;
    if (exercise.duration.includes('45')) duration = 2700;
    
    startTimer(duration);
}

// Nutrition Functions
function updateNutritionDisplay() {
    document.getElementById('calories-consumed').textContent = userData.caloriesConsumed;
    document.getElementById('calorie-goal').textContent = userData.settings.calorieGoal;
    document.getElementById('protein-amount').textContent = userData.protein + 'g';
    document.getElementById('carbs-amount').textContent = userData.carbs + 'g';
    document.getElementById('fat-amount').textContent = userData.fat + 'g';
    
    // Update macro bars
    const proteinGoal = userData.settings.calorieGoal * 0.3 / 4; // 30% of calories from protein
    const carbsGoal = userData.settings.calorieGoal * 0.4 / 4; // 40% from carbs
    const fatGoal = userData.settings.calorieGoal * 0.3 / 9; // 30% from fat
    
    updateMacroBar('protein-fill', userData.protein, proteinGoal);
    updateMacroBar('carbs-fill', userData.carbs, carbsGoal);
    updateMacroBar('fat-fill', userData.fat, fatGoal);
    
    // Update calorie chart
    updateCalorieChart();
    
    // Load meals
    loadMeals();
}

function updateMacroBar(barId, current, goal) {
    const percentage = Math.min((current / goal) * 100, 100);
    document.getElementById(barId).style.width = percentage + '%';
}

function updateCalorieChart() {
    const canvas = document.getElementById('calorie-chart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 80;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate progress
    const progress = userData.caloriesConsumed / userData.settings.calorieGoal;
    const angle = progress * 2 * Math.PI;
    
    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 12;
    ctx.stroke();
    
    // Draw progress arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + angle);
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function addMeal(mealType) {
    currentMealType = mealType;
    document.getElementById('food-modal').classList.add('active');
}

function saveFoodItem() {
    const name = document.getElementById('food-name').value;
    const calories = parseInt(document.getElementById('food-calories').value) || 0;
    const protein = parseInt(document.getElementById('food-protein').value) || 0;
    const carbs = parseInt(document.getElementById('food-carbs').value) || 0;
    const fat = parseInt(document.getElementById('food-fat').value) || 0;
    
    if (!name) {
        showNotification('Please enter a food name', 'error');
        return;
    }
    
    const foodItem = { name, calories, protein, carbs, fat };
    userData.meals[currentMealType].push(foodItem);
    
    userData.caloriesConsumed += calories;
    userData.protein += protein;
    userData.carbs += carbs;
    userData.fat += fat;
    
    updateNutritionDisplay();
    saveUserData();
    closeModal('food-modal');
    showNotification('Food added successfully! 🍎');
    
    // Clear form
    document.getElementById('food-name').value = '';
    document.getElementById('food-calories').value = '';
    document.getElementById('food-protein').value = '';
    document.getElementById('food-carbs').value = '';
    document.getElementById('food-fat').value = '';
}

function loadMeals() {
    Object.keys(userData.meals).forEach(mealType => {
        const container = document.getElementById(`${mealType}-items`);
        container.innerHTML = '';
        
        userData.meals[mealType].forEach((item, index) => {
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-item';
            mealItem.innerHTML = `
                <div class="meal-item-info">
                    <h5>${item.name}</h5>
                    <p>P: ${item.protein}g | C: ${item.carbs}g | F: ${item.fat}g</p>
                </div>
                <div class="meal-item-calories">${item.calories} cal</div>
            `;
            container.appendChild(mealItem);
        });
    });
}

// Progress Functions
function updateProgressCharts() {
    updateWeightChart();
    updateWorkoutChart();
}

function updateWeightChart() {
    const ctx = document.getElementById('weight-chart').getContext('2d');
    
    // Generate sample weight data
    const weightData = userData.weight.length ? userData.weight : generateSampleWeightData();
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: weightData.map((_, index) => `Week ${index + 1}`),
            datasets: [{
                label: 'Weight (kg)',
                data: weightData,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#334155' }
                },
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#334155' }
                }
            }
        }
    });
}

function updateWorkoutChart() {
    const ctx = document.getElementById('workout-chart').getContext('2d');
    
    // Generate sample workout data
    const workoutData = [3, 4, 2, 5, 4, 6, 5];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Workouts',
                data: workoutData,
                backgroundColor: '#10b981',
                borderColor: '#059669',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#f8fafc'
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#334155' }
                },
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: '#334155' },
                    beginAtZero: true
                }
            }
        }
    });
}

function generateSampleWeightData() {
    const baseWeight = 70;
    const data = [];
    for (let i = 0; i < 12; i++) {
        data.push(baseWeight + Math.random() * 4 - 2);
    }
    return data;
}

function logMeasurement() {
    const weight = parseFloat(document.getElementById('weight-input').value);
    const bodyFat = parseFloat(document.getElementById('bodyfat-input').value);
    
    if (weight) {
        userData.weight.push(weight);
        showNotification('Measurement logged successfully! 📊');
        saveUserData();
        updateProgressCharts();
        
        // Clear inputs
        document.getElementById('weight-input').value = '';
        document.getElementById('bodyfat-input').value = '';
    }
}

// Achievements
function renderAchievements() {
    const container = document.getElementById('achievement-grid');
    container.innerHTML = '';
    
    userData.achievements.forEach(achievement => {
        const achievementItem = document.createElement('div');
        achievementItem.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
        achievementItem.innerHTML = `
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
        `;
        container.appendChild(achievementItem);
    });
}

function checkAchievements() {
    let newAchievements = [];
    
    userData.achievements.forEach(achievement => {
        if (!achievement.unlocked) {
            let shouldUnlock = false;
            
            switch (achievement.id) {
                case 'first_workout':
                    shouldUnlock = userData.workouts.length >= 1;
                    break;
                case 'week_streak':
                    shouldUnlock = userData.streakCount >= 7;
                    break;
                case 'calorie_burner':
                    shouldUnlock = userData.caloriesBurned >= 1000;
                    break;
                case 'hydration_hero':
                    shouldUnlock = userData.waterIntake >= 8;
                    break;
                case 'consistency_king':
                    shouldUnlock = userData.streakCount >= 30;
                    break;
                case 'strength_master':
                    shouldUnlock = userData.workouts.filter(w => w.type.includes('Strength')).length >= 50;
                    break;
            }
            
            if (shouldUnlock) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        }
    });
    
    if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
            showNotification(`Achievement Unlocked: ${achievement.name}! 🏆`);
        });
        renderAchievements();
        saveUserData();
    }
}

// Profile Functions
function saveSettings() {
    userData.settings.calorieGoal = parseInt(document.getElementById('calorie-goal-input').value) || 2000;
    userData.settings.waterGoal = parseInt(document.getElementById('water-goal-input').value) || 8;
    userData.settings.reminderTime = document.getElementById('reminder-time').value;
    
    saveUserData();
    updateDashboard();
    updateNutritionDisplay();
    showNotification('Settings saved successfully! ⚙️');
}

function calculateBMI() {
    const height = parseFloat(document.getElementById('height-input').value);
    const weight = parseFloat(document.getElementById('bmi-weight-input').value);
    
    if (!height || !weight) {
        showNotification('Please enter both height and weight', 'error');
        return;
    }
    
    const bmi = weight / ((height / 100) ** 2);
    const bmiResult = document.getElementById('bmi-result');
    const bmiNumber = document.getElementById('bmi-number');
    const bmiCategory = document.getElementById('bmi-category');
    
    bmiNumber.textContent = bmi.toFixed(1);
    
    let category = '';
    let categoryClass = '';
    
    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'underweight';
    } else if (bmi < 25) {
        category = 'Normal Weight';
        categoryClass = 'normal';
    } else if (bmi < 30) {
        category = 'Overweight';
        categoryClass = 'overweight';
    } else {
        category = 'Obese';
        categoryClass = 'obese';
    }
    
    bmiCategory.textContent = category;
    bmiCategory.className = `bmi-category ${categoryClass}`;
    bmiResult.style.display = 'block';
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    
    if (type === 'error') {
        notification.style.background = 'var(--gradient-danger)';
    } else {
        notification.style.background = 'var(--gradient-secondary)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Chart Initialization
function initializeCharts() {
    // Set Chart.js defaults for dark theme
    Chart.defaults.color = '#f8fafc';
    Chart.defaults.borderColor = '#334155';
    Chart.defaults.backgroundColor = 'rgba(99, 102, 241, 0.1)';
}

// Utility Functions
function formatDate(date) {
    return new Date(date).toLocaleDateString();
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Auto-save data every 30 seconds
setInterval(saveUserData, 30000);

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                showSection('dashboard');
                break;
            case '2':
                e.preventDefault();
                showSection('workouts');
                break;
            case '3':
                e.preventDefault();
                showSection('nutrition');
                break;
            case '4':
                e.preventDefault();
                showSection('progress');
                break;
            case '5':
                e.preventDefault();
                showSection('profile');
                break;
        }
    }
    
    // ESC to close modals
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});

// Touch gestures for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const sections = ['dashboard', 'workouts', 'nutrition', 'progress', 'profile'];
        const currentIndex = sections.indexOf(currentSection);
        
        if (diff > 0 && currentIndex < sections.length - 1) {
            // Swipe left - next section
            showSection(sections[currentIndex + 1]);
        } else if (diff < 0 && currentIndex > 0) {
            // Swipe right - previous section
            showSection(sections[currentIndex - 1]);
        }
    }
}

// Performance monitoring
const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
            console.log(`${entry.name}: ${entry.duration}ms`);
        }
    }
});

observer.observe({ entryTypes: ['measure'] });

// Measure app initialization time
performance.mark('app-start');
window.addEventListener('load', () => {
    performance.mark('app-end');
    performance.measure('app-initialization', 'app-start', 'app-end');
});