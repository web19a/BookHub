// app.js - Complete Educational Resource Management System
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// ========================
// DATA CONFIGURATION
// ========================
const DEFAULT_BOOKS = [
    {
        type: "textbook",
        subject: "Mathematics",
        grade: "11",
        title: "Mathematics Grade 11",
        pdfUrl: "assets/pdfs/g-11-mathematics.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "textbook",
        subject: "English",
        grade: "11",
        title: "English Grade 11",
        pdfUrl: "assets/pdfs/g-11-english.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "textbook",
        subject: "Biology",
        grade: "11",
        title: "Biology Grade 11",
        pdfUrl: "assets/pdfs/g-11-biology.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "textbook",
        subject: "Economics",
        grade: "10",
        title: "Economics Grade 10",
        pdfUrl: "assets/pdfs/g-10-economics.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "textbook",
        subject: "ICT",
        grade: "10",
        title: "ICT Grade 10",
        pdfUrl: "assets/pdfs/g-10-ict.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "textbook",
        subject: "Physics",
        grade: "10",
        title: "Physics Grade 10",
        pdfUrl: "assets/pdfs/g-10-physics.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "textbook",
        subject: "Geography",
        grade: "10",
        title: "Geography Grade 10",
        pdfUrl: "assets/pdfs/g-10-geography.pdf",
        added: "2024-01-01T00:00:00Z"
    },
    {
        type: "guide",
        subject: "Science",
        grade: "8",
        title: "Science Olympiad Guide",
        bookName: "National Science Curriculum",
        publishYear: "2023",
        pdfUrl: "assets/pdfs/science-guide.pdf",
        added: "2024-01-01T00:00:00Z"
    }
];
// ========================
// CORE FUNCTIONALITY
// ========================
function initializeBooks() {
    if (!localStorage.getItem('books')) {
        const validatedBooks = DEFAULT_BOOKS.map(book => ({
            type: book.type || 'textbook',
            subject: book.subject ? formatSubject(book.subject) : 'General',
            grade: book.grade?.toString().padStart(2, '0') || '00',
            title: book.title || 'Untitled Resource',
            pdfUrl: book.pdfUrl || '',
            ...(book.type === 'guide' && {
                bookName: book.bookName || '',
                publishYear: book.publishYear || ''
            }),
            added: book.added || new Date().toISOString()
        }));
        localStorage.setItem('books', JSON.stringify(validatedBooks));
    }
}

function formatSubject(subject) {
    return subject.charAt(0).toUpperCase() + subject.slice(1).toLowerCase();
}

// ========================
// FILTER & SEARCH SYSTEM
// ========================
function createGradeFilters() {
    const container = document.getElementById('gradeFilters');
    if (!container) return;

    const books = JSON.parse(localStorage.getItem('books')) || [];
    const grades = [...new Set(books.map(book => book.grade))].sort((a, b) => a - b);
    
    container.innerHTML = `
        <button class="grade-filter-btn active" onclick="loadBooks()">All Grades</button>
        ${grades.map(grade => `
            <button class="grade-filter-btn" 
                onclick="loadBooks('${grade}')"
                data-grade="${grade}">
                Grade ${grade}
            </button>
        `).join('')}
    `;

    container.querySelectorAll('.grade-filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            container.querySelectorAll('.grade-filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function loadBooks(selectedGrade) {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    try {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        const searchTerm = document.getElementById('bookSearch').value.toLowerCase();

        books = books.filter(book => {
            const matchesGrade = !selectedGrade || book.grade === selectedGrade;
            const matchesSearch = !searchTerm || 
                book.title.toLowerCase().includes(searchTerm) ||
                book.subject.toLowerCase().includes(searchTerm) ||
                book.grade.includes(searchTerm);
            return matchesGrade && matchesSearch;
        });

        renderBooks(books);
    } catch (error) {
        handleLoadingError(error);
    }
}

function renderBooks(books) {
    const booksGrid = document.getElementById('booksGrid');
    booksGrid.innerHTML = books.map(book => `
        <div class="book-card">
            <div class="book-type ${book.type}">${book.type.toUpperCase()}</div>
            <h3>${book.title}</h3>
            <div class="book-details">
                <p><strong>Subject:</strong> ${book.subject}</p>
                <p><strong>Grade:</strong> ${book.grade}</p>
                ${book.type === 'guide' ? `
                    <p><strong>Based on:</strong> ${book.bookName}</p>
                    <p><strong>Published:</strong> ${book.publishYear}</p>
                ` : ''}
            </div>
            <div class="book-actions">
                ${renderPDFButton(book)}
                ${currentUser?.role === 'admin' ? renderDeleteButton(book) : ''}
            </div>
        </div>
    `).join('');
}

function renderPDFButton(book) {
    return `
        <button class="pdf-btn" 
            onclick="openPdf('${book.pdfUrl}')"
            ${!book.pdfUrl ? 'disabled title="PDF unavailable"' : ''}>
            ${book.pdfUrl ? '📘 View PDF' : '🚫 PDF Missing'}
        </button>
    `;
}

function renderDeleteButton(book) {
    return `
        <button class="delete-btn" 
            onclick="deleteBook('${book.title.replace(/'/g, "\\'")}')">
            🗑️ Delete
        </button>
    `;
}

// ========================
// BOOK MANAGEMENT
// ========================
function addBook() {
    const form = document.getElementById('bookForm');
    const newBook = validateBookForm();

    if (!newBook) return;

    const books = JSON.parse(localStorage.getItem('books')) || [];
    if (isDuplicateBook(books, newBook)) return;

    books.push(newBook);
    updateBookStorage(books);
    resetUIAfterSubmission();
}

function validateBookForm() {
    const requiredFields = ['subject', 'grade', 'bookTitle', 'pdfUrl'];
    const missingField = requiredFields.find(id => !document.getElementById(id).value.trim());

    if (missingField) {
        alert('Please fill all required fields');
        document.getElementById(missingField).focus();
        return null;
    }

    return {
        type: document.getElementById('bookType').value,
        subject: formatSubject(document.getElementById('subject').value.trim()),
        grade: document.getElementById('grade').value.replace(/\D/g, '').padStart(2, '0'),
        title: document.getElementById('bookTitle').value.trim(),
        pdfUrl: document.getElementById('pdfUrl').value.trim(),
        ...getGuideFields(),
        added: new Date().toISOString()
    };
}

function getGuideFields() {
    if (document.getElementById('bookType').value === 'guide') {
        return {
            bookName: document.getElementById('guideBookName').value.trim(),
            publishYear: document.getElementById('publishYear').value.trim()
        };
    }
    return {};
}

function isDuplicateBook(books, newBook) {
    if (books.some(b => b.title.toLowerCase() === newBook.title.toLowerCase())) {
        alert('This book title already exists!');
        return true;
    }
    return false;
}

function updateBookStorage(books) {
    localStorage.setItem('books', JSON.stringify(books));
    document.getElementById('bookSearch').value = '';
    loadBooks();
    createGradeFilters();
}

function resetUIAfterSubmission() {
    document.getElementById('bookForm').reset();
    toggleGuideFields();
}

function deleteBook(title) {
    if (!confirm(`Permanently delete "${title}"?`)) return;
    
    try {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        books = books.filter(book => book.title !== title);
        localStorage.setItem('books', JSON.stringify(books));
        updateBookStorage(books);
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete resource. Please try again.');
    }
}

// ========================
// UI CONTROLS
// ========================
function toggleGuideFields() {
    const guideFields = document.querySelector('.guide-fields');
    const bookType = document.getElementById('bookType');
    if (!guideFields || !bookType) return;
    
    guideFields.classList.toggle('hidden', bookType.value !== 'guide');
}

function showSection(sectionId) {
    try {
        // 1. Remove active states from all elements
        document.querySelectorAll('.content-section, .nav-btn').forEach(element => {
            element.classList.remove('active');
        });

        // 2. Get target elements
        const targetSection = document.getElementById(sectionId);
        const targetButton = document.querySelector(`.nav-btn[onclick*="${sectionId}"]`);

        // 3. Add active states with animation safeguards
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.animation = 'fadeIn 0.3s ease';
        }

        if (targetButton) {
            targetButton.classList.add('active');
            targetButton.style.animation = 'buttonPop 0.2s ease';
        }

        // 4. Clear animations after completion
        setTimeout(() => {
            if (targetSection) targetSection.style.animation = '';
            if (targetButton) targetButton.style.animation = '';
        }, 300);

    } catch (error) {
        console.error('Section transition error:', error);
        alert('Error loading section. Please try again.');
    }
}
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function openPdf(pdfUrl) {
    try {
        if (!pdfUrl) throw new Error('PDF file not available');
        window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
        console.error('PDF error:', error);
        alert(`Error: ${error.message}`);
    }
}

// ========================
// INITIALIZATION
// ========================
document.addEventListener('DOMContentLoaded', () => {
    try {
        initializeTheme();
        initializeBooks();
        handleSplashScreen();
        checkAuthState();
    } catch (error) {
        displayCriticalError(error);
    }
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function handleSplashScreen() {
    const splashScreen = document.querySelector('.splash-screen');
    if (splashScreen) {
        setTimeout(() => {
            splashScreen.style.opacity = '0';
            splashScreen.style.visibility = 'hidden';
        }, 2000);
    }
}

function checkAuthState() {
    currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (currentUser) {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        initializeAdminFeatures();
        loadUserProfile();
        loadBooks();
        createGradeFilters();
    } else {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
    }
}

function initializeAdminFeatures() {
    if (currentUser?.role === 'admin') {
        const bookTypeSelect = document.getElementById('bookType');
        if (bookTypeSelect) {
            bookTypeSelect.addEventListener('change', toggleGuideFields);
            document.getElementById('adminControls').classList.remove('hidden');
        }
    }
}

function loadUserProfile() {
    document.getElementById('profileName').textContent = currentUser.name || 'Guest';
    document.getElementById('profileEmail').textContent = currentUser.email || 'No email';
    document.getElementById('profileJoined').textContent = 
        currentUser.joined ? new Date(currentUser.joined).toLocaleDateString() : 'Unknown';
}

function displayCriticalError(error) {
    console.error('Critical error:', error);
    document.body.innerHTML = `
        <div class="error-container">
            <h1>⚠️ System Error</h1>
            <p>${error.message}</p>
            <button onclick="location.reload()" class="reload-btn">
                Reload Application
            </button>
        </div>
    `;
}

// ========================
// ABOUT OVERLAY CONTROLS
// ========================
function showAbout() {
    const overlay = document.getElementById('aboutOverlay');
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideAbout(event) {
    // Only close if clicking outside content or on close button
    if (event && event.target !== document.getElementById('aboutOverlay')) return;
    
    const overlay = document.getElementById('aboutOverlay');
    overlay.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close with ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideAbout();
});
