// DOM Elements
// Navigation and Section Elements
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('main > section');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-links');

// Home Section Elements
const startPracticeBtn = document.getElementById('startPractice');

// Practice Section Elements
const setupPanel = document.querySelector('.setup-panel');
const interviewPanel = document.querySelector('.interview-panel');
const resultsPanel = document.querySelector('.results-panel');
const setupCameraBtn = document.getElementById('setupCamera');
const durationSlider = document.getElementById('duration');
const durationValue = document.getElementById('duration-value');
const pauseInterviewBtn = document.getElementById('pause-interview');
const stopInterviewBtn = document.getElementById('stop-interview');
const userVideo = document.getElementById('user-video');
const questionText = document.getElementById('question-text');
const timer = document.getElementById('timer');

// Progress meters
const confidenceMeter = document.getElementById('confidence-meter');
const fluencyMeter = document.getElementById('fluency-meter');
const bodyLanguageMeter = document.getElementById('body-language-meter');
const answerQualityMeter = document.getElementById('answer-quality-meter');

// Results Elements
const overallScore = document.getElementById('overall-score');
const confidenceScore = document.getElementById('confidence-score');
const fluencyScore = document.getElementById('fluency-score');
const bodyLanguageScore = document.getElementById('body-language-score');
const answerQualityScore = document.getElementById('answer-quality-score');
const saveInterviewBtn = document.getElementById('save-interview');
const practiceAgainBtn = document.getElementById('practice-again');

// History Section Elements
const searchHistory = document.getElementById('search-history');
const filterType = document.getElementById('filter-type');
const sortBy = document.getElementById('sort-by');
const historyItems = document.querySelectorAll('.history-item');
const viewDetailsButtons = document.querySelectorAll('.view-details');
const deleteButtons = document.querySelectorAll('.delete-interview');
const modal = document.getElementById('interview-detail-modal');
const closeModal = document.querySelector('.close-modal');
const paginationButtons = document.querySelectorAll('.pagination-button');
const pageNumbers = document.querySelectorAll('.page-number');

// Sample interview questions
const interviewQuestions = {
    technical: [
        "Explain the concept of object-oriented programming and its key principles.",
        "What is the difference between a stack and a queue? Provide examples of when you'd use each.",
        "How would you optimize a slow-performing database query?",
        "Explain the concept of REST API and its key principles.",
        "What are the differences between synchronous and asynchronous programming?",
        "Describe your approach to debugging a complex issue in a production environment."
    ],
    behavioral: [
        "Tell us about a time when you had to overcome a significant challenge in a project.",
        "Describe a situation where you had a conflict with a team member and how you resolved it.",
        "How do you handle tight deadlines and pressure?",
        "Tell me about a time when you had to learn a new skill quickly for a project.",
        "Give an example of how you've dealt with failure in your professional life.",
        "Describe a situation where you had to make an important decision with limited information."
    ],
    mixed: [
        "Describe a project where you used technology to solve a business problem.",
        "How do you stay updated with the latest developments in your field?",
        "Tell me about a time when you had to explain a technical concept to a non-technical audience.",
        "How do you approach learning new technologies?",
        "Describe a situation where you had to collaborate with a cross-functional team.",
        "How do you balance technical excellence with business needs and deadlines?"
    ]
};

// Global variables
let mediaStream = null;
let interviewType = 'technical';
let interviewDuration = 15; // minutes
let currentQuestion = 0;
let interviewInProgress = false;
let interviewPaused = false;
let timerInterval = null;
let timeRemaining = 120; // seconds per question
let mockAIAnalysis = null;
let currentSection = 'home';

// =============== Navigation Functions ===============
// Initialize the application
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Show active section based on hash or default to home
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    } else {
        showSection('home');
    }
    
    // Update duration display
    durationValue.textContent = durationSlider.value;
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            showSection(targetSection);
            history.pushState(null, null, `#${targetSection}`);
        });
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Home Section
    startPracticeBtn.addEventListener('click', () => {
        showSection('practice');
        history.pushState(null, null, '#practice');
    });
    
    // Practice Section
    setupCameraBtn.addEventListener('click', setupCamera);
    durationSlider.addEventListener('input', updateDurationDisplay);
    pauseInterviewBtn.addEventListener('click', togglePauseInterview);
    stopInterviewBtn.addEventListener('click', stopInterview);
    saveInterviewBtn.addEventListener('click', saveInterviewResults);
    practiceAgainBtn.addEventListener('click', resetInterview);
    
    // Interview type selection
    document.getElementById('interview-type').addEventListener('change', function() {
        interviewType = this.value;
    });
    
    // History Section
    searchHistory.addEventListener('input', filterHistoryItems);
    filterType.addEventListener('change', filterHistoryItems);
    sortBy.addEventListener('change', sortHistoryItems);
    
    viewDetailsButtons.forEach(button => {
        button.addEventListener('click', showInterviewDetails);
    });
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', deleteInterviewRecord);
    });
    
    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
    
    // Pagination
    pageNumbers.forEach(page => {
        page.addEventListener('click', function() {
            document.querySelector('.page-number.active').classList.remove('active');
            this.classList.add('active');
        });
    });
    
    paginationButtons.forEach(button => {
        button.addEventListener('click', changePage);
    });
}

// Show the selected section
function showSection(sectionId) {
    currentSection = sectionId;
    
    // Update navigation links
    navLinks.forEach(link => {
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Hide all sections and show the selected one
    sections.forEach(section => {
        if (section.id === sectionId) {
            section.classList.add('active-section');
            section.classList.remove('hidden');
        } else {
            section.classList.remove('active-section');
            section.classList.add('hidden');
        }
    });
    
    // Close mobile menu if open
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}

// =============== Practice Section Functions ===============
// Update the duration display when slider changes
function updateDurationDisplay() {
    durationValue.textContent = durationSlider.value;
    interviewDuration = parseInt(durationSlider.value);
}

// Set up camera access
async function setupCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        
        userVideo.srcObject = mediaStream;
        setupPanel.classList.add('hidden');
        interviewPanel.classList.remove('hidden');
        
        // Start the interview
        startInterview();
        
    } catch (error) {
        alert("Unable to access camera and microphone. Please ensure you have granted permission and try again.");
        console.error("Error accessing media devices:", error);
    }
}

// Start the interview
function startInterview() {
    interviewInProgress = true;
    interviewPaused = false;
    currentQuestion = 0;
    
    // Initialize mock AI analysis
    mockAIAnalysis = {
        confidence: 0,
        fluency: 0,
        bodyLanguage: 0,
        answerQuality: 0,
        overall: 0
    };
    
    // Set first question
    loadNextQuestion();
    
    // Start metrics simulation
    simulateMetricsAnalysis();
}

// Load the next question
function loadNextQuestion() {
    // Get a random question based on interview type
    const questions = interviewQuestions[interviewType];
    const randomIndex = Math.floor(Math.random() * questions.length);
    questionText.textContent = questions[randomIndex];
    
    // Reset timer
    timeRemaining = 120; // 2 minutes per question
    updateTimerDisplay();
    
    // Clear previous timer if exists
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // Start new timer
    timerInterval = setInterval(() => {
        if (!interviewPaused) {
            timeRemaining--;
            updateTimerDisplay();
            
            if (timeRemaining <= 0) {
                currentQuestion++;
                if (currentQuestion >= 5) { // Limit to 5 questions
                    stopInterview();
                } else {
                    loadNextQuestion();
                }
            }
        }
    }, 1000);
}

// Update the timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Add visual indication when time is running low
    if (timeRemaining < 30) {
        timer.style.color = 'var(--danger-color)';
    } else {
        timer.style.color = 'var(--primary-color)';
    }
}

// Toggle pause/resume interview
function togglePauseInterview() {
    interviewPaused = !interviewPaused;
    
    if (interviewPaused) {
        pauseInterviewBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        pauseInterviewBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
}

// Stop the interview
function stopInterview() {
    // Clear timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    interviewInProgress = false;
    
    // Calculate final scores
    calculateFinalScores();
    
    // Hide interview panel and show results
    interviewPanel.classList.add('hidden');
    resultsPanel.classList.remove('hidden');
    
    // Stop camera
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
}

// Calculate final scores
function calculateFinalScores() {
    // In a real app, this would come from AI analysis
    // For demo, we'll use the simulated metrics
    
    // Round to nearest integer for overall score
    overallScore.textContent = Math.round(mockAIAnalysis.overall);
    
    // Update individual scores
    confidenceScore.textContent = `${Math.round(mockAIAnalysis.confidence)}%`;
    fluencyScore.textContent = `${Math.round(mockAIAnalysis.fluency)}%`;
    bodyLanguageScore.textContent = `${Math.round(mockAIAnalysis.bodyLanguage)}%`;
    answerQualityScore.textContent = `${Math.round(mockAIAnalysis.answerQuality)}%`;
}

// Simulate metrics analysis (in a real app, this would be done by AI)
function simulateMetricsAnalysis() {
    if (!interviewInProgress) return;
    
    // Simulate gradual improvement and some fluctuation
    const updateMetrics = () => {
        if (!interviewInProgress) return;
        
        if (!interviewPaused) {
            // Gradually increase base metrics with some randomness
            mockAIAnalysis.confidence = Math.min(100, mockAIAnalysis.confidence + (Math.random() * 2 - 0.5));
            mockAIAnalysis.fluency = Math.min(100, mockAIAnalysis.fluency + (Math.random() * 2 - 0.4));
            mockAIAnalysis.bodyLanguage = Math.min(100, mockAIAnalysis.bodyLanguage + (Math.random() * 2 - 0.6));
            mockAIAnalysis.answerQuality = Math.min(100, mockAIAnalysis.answerQuality + (Math.random() * 2 - 0.3));
            
            // Calculate overall score as weighted average
            mockAIAnalysis.overall = (
                mockAIAnalysis.confidence * 0.25 +
                mockAIAnalysis.fluency * 0.25 +
                mockAIAnalysis.bodyLanguage * 0.2 +
                mockAIAnalysis.answerQuality * 0.3
            );
            
            // Update UI
            confidenceMeter.style.width = `${mockAIAnalysis.confidence}%`;
            fluencyMeter.style.width = `${mockAIAnalysis.fluency}%`;
            bodyLanguageMeter.style.width = `${mockAIAnalysis.bodyLanguage}%`;
            answerQualityMeter.style.width = `${mockAIAnalysis.answerQuality}%`;
        }
        
        // Continue simulation
        setTimeout(updateMetrics, 1000);
    };
    
    // Initialize with random starting values
    mockAIAnalysis.confidence = 30 + Math.random() * 15;
    mockAIAnalysis.fluency = 30 + Math.random() * 15;
    mockAIAnalysis.bodyLanguage = 30 + Math.random() * 15;
    mockAIAnalysis.answerQuality = 30 + Math.random() * 15;
    
    // Update metrics initially
    confidenceMeter.style.width = `${mockAIAnalysis.confidence}%`;
    fluencyMeter.style.width = `${mockAIAnalysis.fluency}%`;
    bodyLanguageMeter.style.width = `${mockAIAnalysis.bodyLanguage}%`;
    answerQualityMeter.style.width = `${mockAIAnalysis.answerQuality}%`;
    
    // Start simulation
    updateMetrics();
}

// Save interview results
function saveInterviewResults() {
    // In a real app, this would save to a database
    alert("Interview results saved successfully!");
    
    // Switch to history tab
    showSection('history');
    history.pushState(null, null, '#history');
    
    // Reset interview
    resetInterview();
}

// Reset interview state
function resetInterview() {
    resultsPanel.classList.add('hidden');
    setupPanel.classList.remove('hidden');
    
    // Reset form if needed
    document.getElementById('interview-type').value = 'technical';
    document.getElementById('industry').value = 'tech';
    durationSlider.value = 15;
    durationValue.textContent = 15;
    
    interviewType = 'technical';
    interviewDuration = 15;
}

// =============== History Section Functions ===============
// Filter history items based on search and filter criteria
function filterHistoryItems() {
    const searchQuery = searchHistory.value.toLowerCase();
    const filterValue = filterType.value;
    
    historyItems.forEach(item => {
        const date = item.querySelector('.history-date .date').textContent.toLowerCase();
        const type = item.querySelector('.history-type').textContent.toLowerCase();
        
        const matchesSearch = date.includes(searchQuery) || type.includes(searchQuery);
        const matchesFilter = filterValue === 'all' || type === filterValue.toLowerCase();
        
        if (matchesSearch && matchesFilter) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Sort history items based on selected criteria
function sortHistoryItems() {
    const sortValue = sortBy.value;
    const historyList = document.querySelector('.history-list');
    const items = Array.from(historyList.children);
    
    items.sort((a, b) => {
        if (sortValue === 'date-desc' || sortValue === 'date-asc') {
            const dateA = new Date(a.querySelector('.history-date .date').textContent);
            const dateB = new Date(b.querySelector('.history-date .date').textContent);
            
            return sortValue === 'date-desc' ? dateB - dateA : dateA - dateB;
        } else {
            const scoreA = parseInt(a.querySelector('.history-score').textContent);
            const scoreB = parseInt(b.querySelector('.history-score').textContent);
            
            return sortValue === 'score-desc' ? scoreB - scoreA : scoreA - scoreB;
        }
    });
    
    // Remove existing items
    items.forEach(item => historyList.removeChild(item));
    
    // Add sorted items
    items.forEach(item => historyList.appendChild(item));
}

// Show interview details in modal
function showInterviewDetails() {
    const historyItem = this.closest('.history-item');
    const date = historyItem.querySelector('.history-date .date').textContent;
    const type = historyItem.querySelector('.history-type').textContent;
    const industry = historyItem.querySelector('.history-industry').textContent;
    const duration = historyItem.querySelector('.history-duration').textContent;
    
    // Update modal with values
    document.getElementById('detail-date').textContent = date;
    document.getElementById('detail-type').textContent = type;
    document.getElementById('detail-industry').textContent = industry;
    document.getElementById('detail-duration').textContent = duration;
    
    // Show the modal
    modal.classList.remove('hidden');
}

// Delete interview record
function deleteInterviewRecord() {
    const historyItem = this.closest('.history-item');
    
    // Confirm before deleting
    if (confirm("Are you sure you want to delete this interview record?")) {
        // In a real app, this would delete from database
        historyItem.remove();
    }
}

// Handle pagination
function changePage() {
    // This would normally load different pages of history
    // For the demo, just toggle the active state
    const currentActive = document.querySelector('.page-number.active');
    const activeIndex = Array.from(pageNumbers).indexOf(currentActive);
    
    if (this.innerHTML.includes('chevron-right') && activeIndex < pageNumbers.length - 1) {
        currentActive.classList.remove('active');
        pageNumbers[activeIndex + 1].classList.add('active');
    } else if (this.innerHTML.includes('chevron-left') && activeIndex > 0) {
        currentActive.classList.remove('active');
        pageNumbers[activeIndex - 1].classList.add('active');
    }
    
    // Update disabled state
    paginationButtons[0].disabled = document.querySelector('.page-number:first-child').classList.contains('active');
    paginationButtons[1].disabled = document.querySelector('.page-number:last-child').classList.contains('active');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// Handle back/forward navigation
window.addEventListener('popstate', () => {
    const hash = window.location.hash.substring(1);
    if (hash && document.getElementById(hash)) {
        showSection(hash);
    }
});
