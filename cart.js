// cart.js - Versão limpa e universal
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Evento global: funciona em TradingTools.html, classifieds.html, etc
document.addEventListener('click', e => {
    if (e.target.classList.contains('add-to-cart')) {
        const p = e.target.closest('.product');
        if (!p) return;
        
        const id = p.dataset.id;
        const name = p.dataset.name;
        const price = parseFloat(p.dataset.price);

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        saveCart();
        updateCartCount();
        renderCart();
        e.target.innerText = 'Added ✓';
        setTimeout(() => { e.target.innerText = 'Add to Cart'; }, 1500);
    }
});

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.querySelector('#cart-count');
    if (el) el.innerText = count;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
    updateCartCount();
}

function updateQuantity(id, qty) {
    qty = parseInt(qty);
    if (isNaN(qty) || qty < 1) return;
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = qty;
        saveCart();
        renderCart();
    }
}

function renderCart() {
    const tbody = document.querySelector("#cartTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${item.name}</td>
            <td>R$ ${item.price.toFixed(2)}</td>
            <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)"></td>
            <td>R$ ${itemTotal.toFixed(2)}</td>
            <td><button onclick="removeFromCart('${item.id}')">Remove</button></td>
        `;
        tbody.appendChild(row);
    });
    
    const totalEl = document.getElementById("cartTotal");
    if (totalEl) totalEl.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Roda quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart();
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            window.location.href = 'checkout.html';
        });
    }
});
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('yiSellCart')) || [];
        this.init();
    }

    init() {
        this.renderCart();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('checkout-btn').addEventListener('click', () => this.openCheckout());
        document.querySelector('.close').addEventListener('click', () => this.closeCheckout());
        window.addEventListener('click', (e) => {
            if (e.target.id === 'checkoutModal') this.closeCheckout();
        });
    }

    addItem(product) {
        const existing = this.cart.find(item => item.id === product.id);
        if (existing) {
            existing.qty += 1;
        } else {
            this.cart.push({ ...product, qty: 1 });
        }
        this.save();
        this.renderCart();
    }

    updateQty(id, qty) {
        const item = this.cart.find(i => i.id === id);
        if (item) {
            item.qty = Math.max(1, parseInt(qty));
            this.save();
            this.renderCart();
        }
    }

    removeItem(id) {
        this.cart = this.cart.filter(item => item.id !== id);
        this.save();
        this.renderCart();
    }

    save() {
        localStorage.setItem('yiSellCart', JSON.stringify(this.cart));
    }

    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }

    renderCart() {
        const tbody = document.querySelector('#cartTable tbody');
        const totalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkout-btn');
        const emptyMsg = document.getElementById('empty-cart-msg');
        const table = document.getElementById('cartTable');

        tbody.innerHTML = '';

        if (this.cart.length === 0) {
            emptyMsg.style.display = 'block';
            table.style.display = 'none';
            checkoutBtn.disabled = true;
            totalEl.textContent = 'Total: R$ 0.00';
            return;
        }

        emptyMsg.style.display = 'none';
        table.style.display = 'table';
        checkoutBtn.disabled = false;

        this.cart.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.qty}" min="1" 
                           onchange="cart.updateQty('${item.id}', this.value)">
                </td>
                <td>R$ ${(item.price * item.qty).toFixed(2)}</td>
                <td>
                    <button class="btn-remove" onclick="cart.removeItem('${item.id}')">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        totalEl.textContent = `Total: R$ ${this.getTotal().toFixed(2)}`;
    }

    openCheckout() {
        const modal = document.getElementById('checkoutModal');
        const optionsDiv = document.getElementById('checkout-options');
        
        // Se só tem 1 item com pixlink, manda direto pro PIX
        const singleItemWithPix = this.cart.length === 1 && this.cart[0].pixlink;
        
        if (singleItemWithPix) {
            window.open(this.cart[0].pixlink, '_blank');
            return;
        }

        // Senão, mostra opções
        let html = '';
        
        // Opção 1: PIX individual pra cada produto
        this.cart.forEach(item => {
            if (item.pixlink) {
                html += `<a href="${item.pixlink}" target="_blank" class="checkout-option">
                    PIX: ${item.name} - R$ ${(item.price * item.qty).toFixed(2)}
                </a>`;
            }
        });

        // Opção 2: WhatsApp com carrinho completo
        const cartText = this.cart.map(i => `${i.qty}x ${i.name} - R$ ${(i.price * i.qty).toFixed(2)}`).join('%0A');
        const total = this.getTotal().toFixed(2);
        const waLink = `https://wa.me/5511939385258?text=Olá! Quero finalizar compra:%0A%0A${cartText}%0A%0ATotal: R$ ${total}`;
        
        html += `<a href="${waLink}" target="_blank" class="checkout-option">
            WhatsApp - Finalizar Tudo (R$ ${total})
        </a>`;

        optionsDiv.innerHTML = html;
        modal.style.display = 'block';
    }

    closeCheckout() {
        document.getElementById('checkoutModal').style.display = 'none';
    }
}

const cart = new ShoppingCart();
