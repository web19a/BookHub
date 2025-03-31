// app.js - Complete Fixed Version
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Validated Default Books Data
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

// Book Initialization with Validation
function initializeBooks() {
    if (!localStorage.getItem('books')) {
        const validatedBooks = DEFAULT_BOOKS.map(book => ({
            type: book.type || 'textbook',
            subject: book.subject ? book.subject.charAt(0).toUpperCase() + book.subject.slice(1) : 'General',
            grade: book.grade?.toString() || 'N/A',
            title: book.title || 'Untitled Book',
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

// Enhanced Book Management
function addBook() {
    const books = JSON.parse(localStorage.getItem('books')) || [];
    const form = document.getElementById('bookForm');
    
    // Validate required fields
    const requiredFields = [
        'subject', 'grade', 'bookTitle', 'pdfUrl'
    ].map(id => document.getElementById(id));
    
    const missingField = requiredFields.find(field => !field.value.trim());
    if (missingField) {
        alert('Please fill all required fields');
        missingField.focus();
        return;
    }

    // Sanitize inputs
    const newBook = {
        type: document.getElementById('bookType').value,
        subject: document.getElementById('subject').value.trim().replace(/^./, c => c.toUpperCase()),
        grade: document.getElementById('grade').value.replace(/\D/g, '').padStart(2, '0'),
        title: document.getElementById('bookTitle').value.trim(),
        pdfUrl: document.getElementById('pdfUrl').value.trim(),
        added: new Date().toISOString()
    };

    if (newBook.type === 'guide') {
        newBook.bookName = document.getElementById('guideBookName').value.trim();
        newBook.publishYear = document.getElementById('publishYear').value.trim();
    }

    // Check for duplicates
    if (books.some(b => b.title.toLowerCase() === newBook.title.toLowerCase())) {
        alert('This book title already exists!');
        return;
    }

    books.push(newBook);
    localStorage.setItem('books', JSON.stringify(books));
    loadBooks();
    form.reset();
    toggleGuideFields();
}

// Robust Book Loading
function loadBooks() {
    const booksGrid = document.getElementById('booksGrid');
    if (!booksGrid) return;

    try {
        const books = JSON.parse(localStorage.getItem('books')) || [];
        
        booksGrid.innerHTML = books.map(book => {
            const safeBook = {
                title: book.title || 'Untitled Book',
                subject: book.subject || 'Not Specified',
                grade: book.grade?.toString() || 'N/A',
                type: book.type || 'textbook',
                pdfUrl: book.pdfUrl || '',
                bookName: book.bookName || '',
                publishYear: book.publishYear || ''
            };

            return `
                <div class="book-card">
                    <div class="book-type">${safeBook.type.toUpperCase()}</div>
                    <h3>${safeBook.title}</h3>
                    <div class="book-details">
                        <p><strong>Subject:</strong> ${safeBook.subject}</p>
                        <p><strong>Grade:</strong> ${safeBook.grade}</p>
                        ${safeBook.type === 'guide' ? `
                            <p><strong>Based on:</strong> ${safeBook.bookName}</p>
                            <p><strong>Published:</strong> ${safeBook.publishYear}</p>
                        ` : ''}
                    </div>
                    <div class="book-actions">
                        <button class="pdf-btn" 
                            onclick="openPdf('${safeBook.pdfUrl}')"
                            ${!safeBook.pdfUrl ? 'disabled title="PDF unavailable"' : ''}>
                            View PDF
                        </button>
                        ${currentUser?.role === 'admin' ? `
                            <button class="delete-btn" 
                                onclick="deleteBook('${safeBook.title.replace(/'/g, "\\'")}')">
                                Delete
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = '<p class="error">Error loading materials. Please refresh the page.</p>';
    }
}

// Safe Delete Function
function deleteBook(title) {
    if (!confirm(`Permanently delete "${title}"? This cannot be undone!`)) return;
    
    try {
        let books = JSON.parse(localStorage.getItem('books')) || [];
        books = books.filter(book => book.title !== title);
        localStorage.setItem('books', JSON.stringify(books));
        loadBooks();
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete book. Please try again.');
    }
}

// PDF Handling with Error Checking
function openPdf(pdfUrl) {
    try {
        if (!pdfUrl || pdfUrl === '#') {
            throw new Error('PDF file not available');
        }
        
        const pdfWindow = window.open(pdfUrl, '_blank', 'noopener,noreferrer');
        if (!pdfWindow || pdfWindow.closed) {
            throw new Error('Popup blocked! Please allow popups for this site.');
        }
    } catch (error) {
        console.error('PDF error:', error);
        alert(`Error: ${error.message}`);
    }
}

// UI Functions with Error Prevention
function toggleGuideFields() {
    try {
        const guideFields = document.querySelector('.guide-fields');
        const bookType = document.getElementById('bookType');
        if (!guideFields || !bookType) return;
        
        guideFields.classList.toggle('visible', bookType.value === 'guide');
    } catch (error) {
        console.error('UI error:', error);
    }
}

function showSection(sectionId) {
    try {
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) targetSection.classList.add('active');
    } catch (error) {
        console.error('Section error:', error);
    }
}

// Theme Management
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme') === 'dark' 
        ? 'light' 
        : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Comprehensive Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Theme setup
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Data initialization
        initializeBooks();

        // Auth state
        currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        
        if (currentUser) {
            document.getElementById('authContainer').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');

            // Admin setup
            if (currentUser.role === 'admin') {
                const bookTypeSelect = document.getElementById('bookType');
                if (bookTypeSelect) {
                    bookTypeSelect.addEventListener('change', toggleGuideFields);
                    document.getElementById('adminControls').classList.remove('hidden');
                }
            }

            // Load data
            loadBooks();
            
            // Profile setup
            document.getElementById('profileName').textContent = currentUser.name || 'Guest';
            document.getElementById('profileEmail').textContent = currentUser.email || 'No email';
            document.getElementById('profileJoined').textContent = currentUser.joined 
                ? new Date(currentUser.joined).toLocaleDateString() 
                : 'Unknown';
        } else {
            document.getElementById('authContainer').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
        }
    } catch (error) {
        console.error('Startup error:', error);
        document.body.innerHTML = `
            <div class="error-container">
                <h1>Application Error</h1>
                <p>${error.message}</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
});