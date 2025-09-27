// API base URL
const API_BASE = window.location.origin;

// Cart functions
function getCart() {
    const cart = localStorage.getItem('yessay_cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('yessay_cart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}

async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch(`${API_BASE}/api/products`);
        const products = await response.json();
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            alert('Produit non trouvé!');
            return;
        }
        
        const sizeSelect = document.getElementById('size-select');
        const size = sizeSelect ? sizeSelect.value : 'One Size';
        
        const quantityInput = document.getElementById('quantity');
        const qty = quantityInput ? parseInt(quantityInput.value) : quantity;
        
        // Get selected color
        const selectedColorOption = document.querySelector('.color-option.active');
        const color = selectedColorOption ? selectedColorOption.dataset.color : product.colors[0].name;
        const colorImage = selectedColorOption ? selectedColorOption.dataset.image : product.colors[0].image;
        
        const cart = getCart();
        const existingItemIndex = cart.findIndex(item => 
            item.id === productId && item.size === size && item.color === color
        );
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += qty;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: colorImage,
                size: size,
                color: color,
                quantity: qty
            });
        }
        
        saveCart(cart);
        updateCartCount();
        
        // Show confirmation
        alert(`${product.title} (${color}) ajouté au panier!`);
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Erreur lors de l\'ajout au panier');
    }
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

function updateCartItemQuantity(index, change) {
    const cart = getCart();
    cart[index].quantity += change;
    
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    saveCart(cart);
    renderCart();
}

async function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartElement = document.getElementById('empty-cart');
    const cartContainer = document.getElementById('cart-container');
    
    const cart = getCart();
    
    if (cart.length === 0) {
        if (emptyCartElement) emptyCartElement.style.display = 'block';
        if (cartContainer) cartContainer.style.display = 'none';
        if (cartTotalElement) cartTotalElement.textContent = '0';
        return;
    }
    
    if (emptyCartElement) emptyCartElement.style.display = 'none';
    if (cartContainer) cartContainer.style.display = 'block';
    
    let total = 0;
    
    if (cartItemsContainer) {
        cartItemsContainer.innerHTML = cart.map((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            return `
                <div class="cart-item fade-in">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h5 class="cart-item-title">${item.title}</h5>
                        <div class="cart-item-meta">
                            <span class="me-3">Couleur: ${item.color}</span>
                            <span>Taille: ${item.size}</span>
                        </div>
                        <div class="cart-item-price">${item.price.toLocaleString()} XOF × ${item.quantity} = ${itemTotal.toLocaleString()} XOF</div>
                    </div>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" readonly>
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="btn btn-outline-danger ms-3" onclick="removeFromCart(${index})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    if (cartTotalElement) {
        cartTotalElement.textContent = total.toLocaleString();
    }
}

// WhatsApp functions
function sendWhatsAppOrder() {
    const cart = getCart();
    if (cart.length === 0) {
        alert('Votre panier est vide!');
        return;
    }
    
    // Récupérer les informations client
    const name = document.getElementById('name')?.value || '';
    const email = document.getElementById('email')?.value || '';
    const phone = document.getElementById('phone')?.value || '';
    const address = document.getElementById('address')?.value || '';
    
    // Construire le message
    let message = "Bonjour! Je souhaite commander les articles suivants:%0A%0A";
    
    cart.forEach(item => {
        message += `- ${item.title} (Couleur: ${item.color}, Taille: ${item.size}, Quantité: ${item.quantity}) : ${(item.price * item.quantity).toLocaleString()} XOF%0A`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `%0ATotal: ${total.toLocaleString()} XOF%0A%0A`;
    
    // Ajouter les informations client si disponibles
    if (name || email || phone || address) {
        message += "Mes informations:%0A";
        if (name) message += `Nom: ${name}%0A`;
        if (email) message += `Email: ${email}%0A`;
        if (phone) message += `Téléphone: ${phone}%0A`;
        if (address) message += `Adresse: ${address}%0A`;
    }
    
    // Ouvrir WhatsApp
    const whatsappNumber = "221771915772"; // À remplacer par votre numéro
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
}

// Initialize cart page
if (document.getElementById('cart-items')) {
    document.addEventListener('DOMContentLoaded', function() {
        renderCart();
        updateCartCount();
    });
}