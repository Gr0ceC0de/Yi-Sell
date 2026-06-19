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
