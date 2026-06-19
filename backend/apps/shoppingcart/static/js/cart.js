// backend/apps/shoppingcart/static/js/cart.js
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Evento global pra qualquer botão .add-to-cart em qualquer página
document.addEventListener('click', e => {
    if(e.target.classList.contains('add-to-cart')) {
        const p = e.target.closest('.product');
        const id = p.dataset.id;
        const name = p.dataset.name;
        const price = parseFloat(p.dataset.price);

        const existing = cart.find(item => item.id === id);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        alert(`${name} adicionado ao carrinho!`);
    }
});

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const el = document.querySelector('#cart-count');
    if(el) el.innerText = count;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

function updateQuantity(id, qty) {
    qty = parseInt(qty);
    if (isNaN(qty) || qty < 1) return;
    const item = cart.find(i => i.id === id);
    if (item) {
        item.quantity = qty;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
    }
}

function renderCart() {
    const tbody = document.querySelector("#cartTable tbody");
    if(!tbody) return; // Só roda se estiver no shoppingcart.html
    
    tbody.innerHTML = "";
    let total = 0;
    cart.forEach(item => {
        const row = document.createElement("tr");
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        row.innerHTML = `
            <td>${item.name}</td>
            <td>R$ ${item.price.toFixed(2)}</td>
            <td><input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id}', this.value)"></td>
            <td>R$ ${itemTotal.toFixed(2)}</td>
            <td><button onclick="removeFromCart('${item.id}')">Remove</button></td>
        `;
        tbody.appendChild(row);
    });
    document.getElementById("cartTotal").textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Roda ao carregar qualquer página
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCart(); // Só vai renderizar se tiver #cartTable
});
