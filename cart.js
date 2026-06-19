// cart.js - VERSÃO ÚNICA E LIMPA - APAGA TUDO E COLA SÓ ISSO
class ShoppingCart {
    constructor() {
        // USA UMA KEY SÓ: yiSellCart
        this.items = JSON.parse(localStorage.getItem('yiSellCart')) || [];
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
        this.updateCartCount();
    }

    bindEvents() {
        // Adicionar ao carrinho - funciona em qualquer página
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const p = e.target.closest('.product');
                if (!p) return;
                
                const item = {
                    id: p.dataset.id,
                    name: p.dataset.name,
                    price: parseFloat(p.dataset.price) || 0,
                    pixlink: p.dataset.pixlink || ''
                };

                this.add(item);
                e.target.innerText = 'Added ✓';
                setTimeout(() => { e.target.innerText = 'Add to Cart'; }, 1500);
            }
        });

        // Checkout button
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openCheckout());
        }

        // Modal close
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCheckout());
        }

        window.addEventListener('click', (e) => {
            if (e.target.id === 'checkoutModal') this.closeCheckout();
        });
    }

    save() {
        localStorage.setItem('yiSellCart', JSON.stringify(this.items));
        this.updateCartCount();
    }

    add(item) {
        const existing = this.items.find(i => i.id == item.id); // == pega string/number
        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({ ...item, qty: 1 });
        }
        this.save();
        this.render();
    }

    updateQty(id, qty) {
        const item = this.items.find(i => i.id == id);
        if (item) {
            item.qty = Math.max(1, parseInt(qty) || 1);
            this.save();
            this.render();
        }
    }

    remove(id) {
        this.items = this.items.filter(i => i.id != id);
        this.save();
        this.render();
    }

    getTotal() {
        return this.items.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
    }

    updateCartCount() {
        const count = this.items.reduce((sum, item) => sum + item.qty, 0);
        const el = document.querySelector('#cart-count');
        if (el) el.innerText = count;
    }

    render() {
        const tbody = document.querySelector('#cartTable tbody');
        if (!tbody) return; // Não tá na página do carrinho, vaza

        const totalEl = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkout-btn');
        const emptyMsg = document.getElementById('empty-cart-msg');
        const table = document.getElementById('cartTable');

        tbody.innerHTML = '';

        if (this.items.length === 0) {
            if (emptyMsg) emptyMsg.style.display = 'block';
            if (table) table.style.display = 'none';
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (totalEl) totalEl.textContent = 'Total: R$ 0.00';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';
        if (table) table.style.display = 'table';
        if (checkoutBtn) checkoutBtn.disabled = false;

        this.items.forEach(item => {
            const price = parseFloat(item.price);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${price.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.qty}" min="1" 
                           onchange="cart.updateQty('${item.id}', this.value)">
                </td>
                <td>R$ ${(price * item.qty).toFixed(2)}</td>
                <td>
                    <button class="btn-remove" onclick="cart.remove('${item.id}')">Remove</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        if (totalEl) totalEl.textContent = `Total: R$ ${this.getTotal().toFixed(2)}`;
    }

    openCheckout() {
        if (this.items.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const modal = document.getElementById('checkoutModal');
        const optionsDiv = document.getElementById('checkout-options');
        
        // Se só tem 1 item com pixlink, manda direto
        const singleItemWithPix = this.items.length === 1 && this.items[0].pixlink;
        
        if (singleItemWithPix) {
            window.open(this.items[0].pixlink, '_blank');
            return;
        }

        let html = '';
        
        this.items.forEach(item => {
            if (item.pixlink) {
                html += `<a href="${item.pixlink}" target="_blank" class="checkout-option">
                    PIX: ${item.name} - R$ ${(parseFloat(item.price) * item.qty).toFixed(2)}
                </a>`;
            }
        });

        const cartText = this.items.map(i => 
            `${i.qty}x ${i.name} - R$ ${(parseFloat(i.price) * i.qty).toFixed(2)}`
        ).join('%0A');
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

// Inicia UMA VEZ SÓ
const cart = new ShoppingCart();
