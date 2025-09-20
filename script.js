// Main script for the Amigurumi Patterns store

// Pagination configuration
const ITEMS_PER_PAGE = 12; // Number of products per page
let currentPage = 1;
let filteredProducts = []; // Store current filtered/sorted products
let totalPages = 1;

// Calculate discount percentage
function calculateDiscount(original, sale) {
    const discount = Math.round(((original - sale) / original) * 100);
    return discount;
}

// Format price for display
function formatPrice(price) {
    return `$${price.toFixed(2)}`;
}

// Create product card HTML
function createProductCard(product) {
    const discount = calculateDiscount(product.originalPrice, product.salePrice);
    
    return `
        <div class="product-card" onclick="openModal(${product.id})">
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
                <span class="discount-badge">-${discount}%</span>
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="price-container">
					<span class="sale-price">${formatPrice(product.salePrice)}</span>
                    <span class="original-price">${formatPrice(product.originalPrice)}</span>
                </div>
				      <span class="purchase-btn1" >View Details</span>

            </div>
        </div>
    `;
}

// Calculate pagination details
function calculatePagination(totalItems) {
    totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    // Ensure current page is within bounds
    if (currentPage > totalPages) {
        currentPage = totalPages || 1;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }
}

// Get products for current page
function getPaginatedProducts(productsArray) {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return productsArray.slice(startIndex, endIndex);
}

// Create pagination controls HTML
function createPaginationControls() {
    if (totalPages <= 1) return ''; // No pagination needed for single page
    
    let html = '<div class="pagination-container">';
    
    // Previous button
    html += `<button class="pagination-btn pagination-prev" onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Previous
    </button>`;
    
    // Page numbers
    html += '<div class="pagination-numbers">';
    
    // Calculate which page numbers to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Always show first page
    if (startPage > 1) {
        html += `<button class="pagination-number" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            html += '<span class="pagination-dots">...</span>';
        }
    }
    
    // Show page numbers
    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="pagination-number ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    
    // Always show last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<span class="pagination-dots">...</span>';
        }
        html += `<button class="pagination-number" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    html += '</div>';
    
    // Next button
    html += `<button class="pagination-btn pagination-next" onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        Next <i class="fas fa-chevron-right"></i>
    </button>`;
    
    html += '</div>';
    
    // Add page info
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);
    html += `<div class="pagination-info">
        Showing ${startItem}-${endItem} of ${filteredProducts.length} products
    </div>`;
    
    return html;
}

// Change page function
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts(filteredProducts);
    
    // Scroll to top of products grid
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const scrollPosition = productsGrid.offsetTop - headerHeight - 20;
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }
}

// Render all products to the grid
function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    
    // Store the current filtered products
    filteredProducts = productsToRender;
    
    // Check if products data exists
    if (typeof products === 'undefined' || !products.length) {
        productsGrid.innerHTML = `
            <div class="loading">
                No products available. Please ensure productsData.js is loaded correctly.
            </div>
        `;
        return;
    }
    
    // Check if there are products to render
    if (!productsToRender.length) {
        productsGrid.innerHTML = `
            <div class="loading">
                No products match your search criteria.
            </div>
        `;
        return;
    }
    
    // Calculate pagination
    calculatePagination(productsToRender.length);
    
    // Get paginated products
    const paginatedProducts = getPaginatedProducts(productsToRender);
    
    // Create HTML for paginated products
    const productsHTML = paginatedProducts.map(product => createProductCard(product)).join('');
    
    // Create pagination controls
    const paginationHTML = createPaginationControls();
    
    // Update the grid with products and pagination
    productsGrid.innerHTML = productsHTML + paginationHTML;
    
    // Add entrance animation to cards
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.05}s`;
    });
}

// Modal functionality
let currentProduct = null;

function openModal(productId) {
    // Find the product by ID
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) return;
    
    // Calculate discount
    const discount = calculateDiscount(currentProduct.originalPrice, currentProduct.salePrice);
    const savings = currentProduct.originalPrice - currentProduct.salePrice;
    
    // Update modal content
    document.getElementById('modalTitle').textContent = currentProduct.title;
    document.getElementById('modalImage').src = currentProduct.image;
    document.getElementById('modalImage').alt = currentProduct.title;
    document.getElementById('modalDescription').textContent = currentProduct.description;
    document.getElementById('modalOriginalPrice').textContent = formatPrice(currentProduct.originalPrice);
    document.getElementById('modalSalePrice').textContent = formatPrice(currentProduct.salePrice);
    document.getElementById('modalDiscount').textContent = `-${discount}%`;
    document.getElementById('purchaseBtn').href = currentProduct.purchaseLink;
    
    // Show modal
    const modal = document.getElementById('productModal');
    modal.classList.add('active');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Track view analytics (if needed)
    trackProductView(productId);
}

function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    currentProduct = null;
}

// Close modal when clicking outside of it
document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Search and filter functionality
function searchProducts(query) {
    currentPage = 1; // Reset to first page when searching
    
    if (!query) {
        renderProducts();
        return;
    }
    
    const searchTerm = query.toLowerCase();
    const searchResults = products.filter(product => {
        return product.title.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm);
    });
    
    renderProducts(searchResults);
}

// Sort products
function sortProducts(sortBy) {
    let sortedProducts = [...(filteredProducts.length ? filteredProducts : products)];
    
    switch(sortBy) {
        case 'price-low':
            sortedProducts.sort((a, b) => a.salePrice - b.salePrice);
            break;
        case 'price-high':
            sortedProducts.sort((a, b) => b.salePrice - a.salePrice);
            break;
        case 'discount':
            sortedProducts.sort((a, b) => {
                const discountA = calculateDiscount(a.originalPrice, a.salePrice);
                const discountB = calculateDiscount(b.originalPrice, b.salePrice);
                return discountB - discountA;
            });
            break;
        case 'name':
            sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
            break;
        default:
            // Keep original order
            break;
    }
    
    currentPage = 1; // Reset to first page when sorting
    renderProducts(sortedProducts);
}

// Filter by price range
function filterByPriceRange(minPrice, maxPrice) {
    const filtered = products.filter(product => {
        return product.salePrice >= minPrice && product.salePrice <= maxPrice;
    });
    
    currentPage = 1; // Reset to first page when filtering
    renderProducts(filtered);
}

// Analytics tracking (placeholder function)
function trackProductView(productId) {
    // This would normally send data to an analytics service
    console.log(`Product viewed: ${productId}`);
    
    // Store in localStorage for recent views
    let recentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');
    recentViews = recentViews.filter(id => id !== productId);
    recentViews.unshift(productId);
    recentViews = recentViews.slice(0, 5); // Keep only last 5
    localStorage.setItem('recentViews', JSON.stringify(recentViews));
}

// Get recently viewed products
function getRecentlyViewed() {
    const recentIds = JSON.parse(localStorage.getItem('recentViews') || '[]');
    return products.filter(product => recentIds.includes(product.id));
}

// Lazy loading for images
function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Shopping cart functionality (basic implementation)
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const cartItem = cart.find(item => item.id === productId);
    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            quantity: 1,
            price: product.salePrice
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${product.title} added to cart!`);
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCounter = document.getElementById('cartCount');
    if (cartCounter) {
        cartCounter.textContent = totalItems;
        cartCounter.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing notification if any
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }
    
    // Create new notification
    const notif = document.createElement('div');
    notif.className = `notification notification-${type}`;
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00d2ff, #3a7bd5)' : '#ff4757'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Add animation and pagination styles dynamically
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification {
            transition: all 0.3s ease;
        }
        
        /* Pagination Styles */
        .pagination-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 3rem;
            padding: 2rem 0;
            grid-column: 1 / -1;
        }
        
        .pagination-numbers {
            display: flex;
            gap: 0.5rem;
            align-items: center;
        }
        
        .pagination-btn, .pagination-number {
            padding: 0.5rem 1rem;
            border: 1px solid #e0e0e0;
            background: white;
            color: #666;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .pagination-btn:hover:not(:disabled), 
        .pagination-number:hover:not(.active) {
            background: linear-gradient(135deg, #ff6b9d, #c66cdd);
            color: white;
            border-color: transparent;
            transform: translateY(-2px);
        }
        
        .pagination-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .pagination-number.active {
            background: linear-gradient(135deg, #ff6b9d, #c66cdd);
            color: white;
            border-color: transparent;
        }
        
        .pagination-dots {
            color: #999;
            padding: 0 0.5rem;
        }
        
        .pagination-info {
            grid-column: 1 / -1;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            margin-top: 1rem;
        }
        
        @media (max-width: 768px) {
            .pagination-container {
                flex-direction: column;
                gap: 1rem;
            }
            
            .pagination-numbers {
                flex-wrap: wrap;
                justify-content: center;
            }
            
            .pagination-btn {
                padding: 0.75rem 1.5rem;
            }
        }
    `;
    document.head.appendChild(style);
}

// Handle image loading errors
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        // Replace broken images with a placeholder
        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="sans-serif" font-size="20"%3EImage not available%3C/text%3E%3C/svg%3E';
        e.target.classList.add('image-error');
    }
}, true);

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Keyboard navigation for accessibility
function setupKeyboardNavigation() {
    const cards = document.querySelectorAll('.product-card');
    cards.forEach((card, index) => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `View ${products[index]?.title || 'product'} details`);
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.click();
            }
        });
    });
}

// Performance monitoring
function monitorPerformance() {
    if (window.performance && performance.timing) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                const timing = performance.timing;
                const loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`Page load time: ${loadTime}ms`);
                
                // Send to analytics if needed
                if (loadTime > 3000) {
                    console.warn('Page load time exceeds 3 seconds');
                }
            }, 0);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Core initialization
    renderProducts();
    setupLazyLoading();
    addAnimationStyles();
    updateCartCount();
    
    // Setup additional features
    setTimeout(() => {
        setupKeyboardNavigation();
    }, 100);
    
    // Monitor performance in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        monitorPerformance();
    }
});

// Handle visibility change (pause animations when tab is not visible)
document.addEventListener('visibilitychange', function() {
    const cards = document.querySelectorAll('.product-card');
    if (document.hidden) {
        cards.forEach(card => card.style.animationPlayState = 'paused');
    } else {
        cards.forEach(card => card.style.animationPlayState = 'running');
    }
});

// Export functions for external use if needed
window.amigurumiStore = {
    searchProducts,
    sortProducts,
    filterByPriceRange,
    addToCart,
    getRecentlyViewed,
    showNotification,
    changePage,
    setItemsPerPage: function(items) {
        ITEMS_PER_PAGE = items;
        currentPage = 1;
        renderProducts(filteredProducts);
    }
};