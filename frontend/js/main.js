// API base URL - S'adapte automatiquement à l'environnement
const API_BASE = window.location.origin;

// Load products from API
async function loadProducts(containerId, category = null, limit = null) {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        
        let filteredProducts = products;
        if (category && category !== 'all') {
            filteredProducts = products.filter(p => p.category === category);
        }
        if (limit) {
            filteredProducts = filteredProducts.slice(0, limit);
        }
        
        renderProducts(containerId, filteredProducts);
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById(containerId).innerHTML = `
            <div class="col-12 text-center">
                <p class="text-danger">Erreur de chargement des produits. Veuillez réessayer.</p>
            </div>
        `;
    }
}

// Render products to the specified container
function renderProducts(containerId, products) {
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">Aucun produit trouvé.</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="col-md-4 col-lg-3 mb-4 fade-in">
            <div class="card product-card h-100">
                <div class="product-image-container">
                    <img src="${product.colors[0].image}" class="product-image" alt="${product.title}">
                    <div class="product-overlay">
                        <button class="product-action-btn" onclick="window.location.href='produit.html?slug=${product.slug}'">
                            <i class="bi bi-eye"></i>
                        </button>
                        <button class="product-action-btn" onclick="addToCart(${product.id})">
                            <i class="bi bi-cart-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="product-info">
                    <h5 class="product-title">${product.title}</h5>
                    <p class="product-description">${product.description}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto">
                        <span class="product-price">${product.price.toLocaleString()} XOF</span>
                        <button class="btn btn-sm btn-primary product-btn" onclick="window.location.href='produit.html?slug=${product.slug}'">
                            Voir détails
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
// Load product details
async function loadProductDetails(slug) {
    try {
        const response = await fetch(`${API_BASE}/api/product/${slug}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        const product = await response.json();
        
        renderProductDetails(product);
    } catch (error) {
        console.error('Error loading product details:', error);
        document.getElementById('product-details').innerHTML = `
            <div class="col-12 text-center">
                <h2>Produit non trouvé</h2>
                <a href="boutique.html" class="btn btn-primary">Retour à la boutique</a>
            </div>
        `;
    }
}

// Render product details
function renderProductDetails(product) {
    const container = document.getElementById('product-details');
    
    container.innerHTML = `
        <div class="row product-detail-container fade-in">
            <div class="col-md-6 p-4">
                <img src="${product.colors[0].image}" class="product-detail-image" alt="${product.title}" id="main-product-image">
            </div>
            <div class="col-md-6 product-detail-info">
                <h2 class="product-detail-title">${product.title}</h2>
                <p class="product-detail-category badge bg-secondary">${product.category}</p>
                <h3 class="product-detail-price">${product.price.toLocaleString()} XOF</h3>
                <p class="product-detail-description">${product.description}</p>
                
                <div class="color-selector">
                    <label class="color-label">Couleur:</label>
                    <div class="color-options mb-2">
                        ${product.colors.map((color, index) => `
                            <div class="color-option ${index === 0 ? 'active' : ''}" 
                                 style="background-color: ${color.colorCode}"
                                 data-image="${color.image}"
                                 data-color="${color.name}"
                                 onclick="changeProductColor(this)"
                                 title="${color.name}">
                            </div>
                        `).join('')}
                    </div>
                    <small class="color-name" id="selected-color">${product.colors[0].name}</small>
                </div>
                
                <div class="mb-4">
                    <label class="form-label fw-bold">Taille:</label>
                    <select class="form-select form-select-lg" id="size-select">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                </div>
                
                <div class="quantity-selector mb-4">
                    <label class="quantity-label">Quantité:</label>
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="updateQuantity(-1)">-</button>
                        <input type="number" id="quantity" class="quantity-input" value="1" min="1">
                        <button class="quantity-btn" onclick="updateQuantity(1)">+</button>
                    </div>
                </div>
                
                <button class="btn add-to-cart-btn" onclick="addToCart(${product.id})">
                    <i class="bi bi-cart-plus"></i> Ajouter au panier
                </button>
            </div>
        </div>
    `;
}

// Change product color
function changeProductColor(element) {
    // Update active color
    document.querySelectorAll('.color-option').forEach(opt => {
        opt.classList.remove('active');
    });
    element.classList.add('active');
    
    // Update image
    document.getElementById('main-product-image').src = element.dataset.image;
    
    // Update selected color text
    document.getElementById('selected-color').textContent = element.dataset.color;
}

// Update product quantity
function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity');
    let quantity = parseInt(quantityInput.value) + change;
    
    if (quantity < 1) quantity = 1;
    
    quantityInput.value = quantity;
}

// Initialize page based on URL parameters
function initPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');
    
    if (slug) {
        loadProductDetails(slug);
    }
}

// Document ready
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    updateCartCount();
    
    // Initialize page based on content
    if (document.getElementById('featured-products')) {
        loadProducts('featured-products', null, 4);
    }
    
    if (document.getElementById('all-products')) {
        loadProducts('all-products');
        
        // Load categories for filter
        loadCategories();
    }
    
    if (document.getElementById('product-details')) {
        initPage();
    }
});

// Load categories for filter
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        
        const categories = [...new Set(products.map(p => p.category))];
        
        const container = document.getElementById('category-filter');
        if (container) {
            container.innerHTML = `
                <button class="btn btn-outline-primary category-btn active" data-category="all">Tous</button>
                ${categories.map(cat => `
                    <button class="btn btn-outline-primary category-btn" data-category="${cat}">${cat}</button>
                `).join('')}
            `;
            
            // Add event listeners to category buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    loadProducts('all-products', this.dataset.category);
                });
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}
// Animations au défilement - Version simplifiée
function initScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.fade-in');
    
    // Vérifier si le navigateur supporte Intersection Observer
    if (!('IntersectionObserver' in window)) {
        // Fallback pour les navigateurs qui ne supportent pas cette fonction
        elementsToAnimate.forEach(el => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        });
        return;
    }
    
    // Créer un observateur pour détecter quand les éléments sont visibles
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Quand l'élément devient visible
                setTimeout(() => {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Déclencher quand 10% de l'élément est visible
    });
    
    // Configurer l'état initial et observer chaque élément
    elementsToAnimate.forEach(el => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Appeler cette fonction quand la page est chargée
document.addEventListener('DOMContentLoaded', function() {
    // ... votre code existant ...
    
    // Initialiser les animations
    initScrollAnimations();
    
    // ... le reste de votre code ...
    // Fonctionnalités pour la navigation
function initNavigation() {
    // Animation de la navbar au scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar-custom');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Fonctionnalité de recherche
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');
    
    if (searchInput && searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (searchInput.value.trim() !== '') {
                performSearch(searchInput.value);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                performSearch(searchInput.value);
            }
        });
    }
    
    // Mettre à jour le compteur du panier
    updateCartCount();
}

// Fonction de recherche
function performSearch(query) {
    // Vous pouvez implémenter la logique de recherche ici
    console.log('Recherche:', query);
    // Redirection vers la page de résultats de recherche
    // window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// Initialiser la navigation quand le document est prêt
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    // ... le reste de votre code d'initialisation
});
});