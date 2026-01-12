/**
 * GamingStore Application Logic
 * Handles Cart, Product Interactions, and Mobile Menu
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 1. STATE MANAGEMENT
    // =========================================
    const state = {
        cart: [],
        products: [] // Will gather from DOM
    };

    // =========================================
    // 2. DOM ELEMENTS
    // =========================================
    const elements = {
        // Cart
        cartOpenBtn: document.getElementById('cartOpenBtn'),
        cartCloseBtn: document.getElementById('cartCloseBtn'),
        cartDrawer: document.getElementById('cartDrawer'),
        cartBackdrop: document.getElementById('cartBackdrop'),
        cartItemsContainer: document.getElementById('cartItems'),
        cartTotalEl: document.getElementById('cartTotal'),
        cartCountEl: document.getElementById('cartCount'),
        checkoutBtn: document.getElementById('checkoutBtn'),
        clearCartBtn: document.getElementById('clearCartBtn'),
        
        // Products
        productGrid: document.getElementById('productGrid'),
        
        // Modal
        modal: document.getElementById('modal'),
        modalBackdrop: document.getElementById('modalBackdrop'),
        modalCloseBtn: document.getElementById('modalCloseBtn'),
        modalImg: document.getElementById('modalImg'),
        modalTitle: document.getElementById('modalTitle'),
        modalDesc: document.getElementById('modalDesc'),
        modalPrice: document.getElementById('modalPrice'),
        modalAddBtn: document.getElementById('modalAddBtn'),
        
        // Filters
        searchInput: document.getElementById('searchInput'),
        sortSelect: document.getElementById('sortSelect'),
        maxPriceInput: document.getElementById('maxPrice'),
        
        // Footer Year
        yearSpan: document.getElementById('year')
    };

    // Set current year
    if (elements.yearSpan) {
        elements.yearSpan.textContent = new Date().getFullYear();
    }

    // =========================================
    // 3. CART LOGIC
    // =========================================

    /**
     * Adds a product to the cart
     * @param {string} id - Product ID
     * @param {string} title - Product Name
     * @param {number} price - Product Price
     * @param {string} image - Image URL
     */
    function addToCart(id, title, price, image) {
        const existingItem = state.cart.find(item => item.id === id);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            state.cart.push({
                id,
                title,
                price,
                image,
                quantity: 1
            });
        }

        updateCartUI();
        openCart();
    }

    /**
     * Removes an item from the cart
     * @param {string} id - Product ID to remove
     */
    function removeFromCart(id) {
        state.cart = state.cart.filter(item => item.id !== id);
        updateCartUI();
    }

    /**
     * Updates all Cart UI elements (Badge, List, Total)
     */
    function updateCartUI() {
        // 1. Update Badge Count
        const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        elements.cartCountEl.textContent = totalItems;

        // 2. Calculate Total Price
        const totalPrice = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        elements.cartTotalEl.textContent = formatPrice(totalPrice);

        // 3. Render Cart Items
        elements.cartItemsContainer.innerHTML = '';

        if (state.cart.length === 0) {
            elements.cartItemsContainer.innerHTML = `
                <div style="text-align: center; color: var(--text-muted); padding-top: 2rem;">
                    <p>Ton panier est vide.</p>
                    <p style="font-size: 3rem; margin-top: 1rem;">🛒</p>
                </div>
            `;
            return;
        }

        state.cart.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <div class="cart-item-price">${formatPrice(item.price)} x ${item.quantity}</div>
                    <button class="remove-btn" data-id="${item.id}">Retirer</button>
                </div>
                <div style="font-weight: bold;">
                    ${formatPrice(item.price * item.quantity)}
                </div>
            `;
            
            // Attach remove event
            itemEl.querySelector('.remove-btn').addEventListener('click', () => {
                removeFromCart(item.id);
            });

            elements.cartItemsContainer.appendChild(itemEl);
        });
    }

    function openCart() {
        elements.cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    function closeCart() {
        elements.cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    function clearCart() {
        state.cart = [];
        updateCartUI();
    }

    // =========================================
    // 4. EVENT LISTENERS
    // =========================================

    // Cart Events
    elements.cartOpenBtn.addEventListener('click', openCart);
    elements.cartCloseBtn.addEventListener('click', closeCart);
    elements.cartBackdrop.addEventListener('click', closeCart);
    
    if (elements.clearCartBtn) {
        elements.clearCartBtn.addEventListener('click', clearCart);
    }
    
    if (elements.checkoutBtn) {
        elements.checkoutBtn.addEventListener('click', () => {
           if (state.cart.length > 0) {
               alert(`Commande validée pour un total de ${elements.cartTotalEl.textContent} !\n(Ceci est une démo)`);
               clearCart();
               closeCart();
           } else {
               alert('Ton panier est vide !');
           }
        });
    }

    // Product Grid Events (Delegation)
    // We listen on the grid container to handle clicks on buttons inside cards
    elements.productGrid.addEventListener('click', (e) => {
        const target = e.target;
        
        // Find the closest card
        const card = target.closest('.card.product');
        if (!card) return;

        // Get Product Data
        const id = card.dataset.id;
        const title = card.dataset.name;
        const price = parseFloat(card.dataset.price);
        // Fallback for image src if needed
        const imgEl = card.querySelector('img');
        const image = imgEl ? imgEl.getAttribute('src') : '';
        const desc = card.querySelector('.card-desc') ? card.querySelector('.card-desc').textContent : '';

        // Handle "Ajouter"
        if (target.classList.contains('add-to-cart') || target.closest('.add-to-cart')) {
            addToCart(id, title, price, image);
        }

        // Handle "Détails" (Quick View)
        if (target.classList.contains('quick-view') || target.closest('.quick-view')) {
            openModal({ id, title, price, image, desc });
        }
    });

    // =========================================
    // 5. MODAL LOGIC
    // =========================================
    function openModal(product) {
        elements.modalTitle.textContent = product.title;
        elements.modalDesc.textContent = product.desc;
        elements.modalPrice.textContent = formatPrice(product.price);
        elements.modalImg.src = product.image;
        
        // Update Modal Add Button to add THIS product
        elements.modalAddBtn.onclick = () => {
            addToCart(product.id, product.title, product.price, product.image);
            closeModal();
        };

        elements.modal.setAttribute('aria-hidden', 'false');
    }

    function closeModal() {
        elements.modal.setAttribute('aria-hidden', 'true');
    }

    elements.modalCloseBtn.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', closeModal);

    // Escape Key to close all overlays
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            closeModal();
        }
    });

    // =========================================
    // 6. FILTER & SEARCH (Client Side)
    // =========================================
    function filterProducts() {
        const query = elements.searchInput.value.toLowerCase();
        const maxPrice = parseFloat(elements.maxPriceInput.value) || Infinity;
        const sortValue = elements.sortSelect.value;

        const cards = Array.from(document.querySelectorAll('.card.product'));
        const grid = elements.productGrid;

        // 1. Filter
        const visibleCards = cards.filter(card => {
            const name = card.dataset.name.toLowerCase();
            const brand = card.dataset.brand.toLowerCase();
            const price = parseFloat(card.dataset.price);

            const matchesText = name.includes(query) || brand.includes(query);
            const matchesPrice = price <= maxPrice;

            if (matchesText && matchesPrice) {
                card.style.display = '';
                return true;
            } else {
                card.style.display = 'none';
                return false;
            }
        });

        // 2. Sort (on visible cards only, technically we arrange dom elements)
        // We need to re-append them in correct order
        
        // NOTE: Ideally we would sort the data and re-render. 
        // Here we just re-append existing DOM nodes.
        const sorted = visibleCards.sort((a, b) => {
            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);
            const nameA = a.dataset.name.toLowerCase();
            const nameB = b.dataset.name.toLowerCase();

            switch(sortValue) {
                case 'price_asc': return priceA - priceB;
                case 'price_desc': return priceB - priceA;
                case 'name_asc': return nameA.localeCompare(nameB);
                case 'name_desc': return nameB.localeCompare(nameA);
                default: 
                    // 'featured' - maintain original DOM order?? 
                    // Since we are sorting the array derived from DOM, 
                    // 'featured' as a concept needs an index or just do nothing.
                    return 0; 
            }
        });

        // Re-append sorted cards (moves them in DOM)
        sorted.forEach(card => grid.appendChild(card));
    }

    if (elements.searchInput) elements.searchInput.addEventListener('input', filterProducts);
    if (elements.maxPriceInput) elements.maxPriceInput.addEventListener('input', filterProducts);
    if (elements.sortSelect) elements.sortSelect.addEventListener('change', filterProducts);

    // =========================================
    // UTILS
    // =========================================
    function formatPrice(amount) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
    }
});
