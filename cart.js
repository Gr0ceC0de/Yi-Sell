// cart.js - APAGA TODO SEU ARQUIVO E COLA SÓ ISSO
class ShoppingCart {
    constructor() {
        // USA UMA KEY SÓ PRA TUDO
        this.items = JSON.parse(localStorage.getItem('yiSellCart')) || [];
        this.init();
    }

    init() {
        this.render();
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // 1. Botões Add to Cart - funciona em qualquer página
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

        // 2. Botão Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openCheckout());
        }

        // 3. Fechar modal
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
        const existing = this.items.find(i => i.id == item.id); // == compara string com number
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
        if (!tbody) return; // Não tá na página do carrinho

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
        
        if (!modal || !optionsDiv) {
            // Se não tem modal, redireciona pro WhatsApp direto
            const cartText = this.items.map(i => 
                `${i.qty}x ${i.name} - R$ ${(parseFloat(i.price) * i.qty).toFixed(2)}`
            ).join('%0A');
            const total = this.getTotal().toFixed(2);
            window.open(`https://wa.me/5511939385258?text=Olá! Quero finalizar compra:%0A%0A${cartText}%0A%0ATotal: R$ ${total}`, '_blank');
            return;
        }

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
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.style.display = 'none';
    }
    // Adiciona dentro da class ShoppingCart

openCheckout() {
    if (this.items.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    const modal = document.getElementById('checkoutModal');
    this.renderOrderSummary();
    this.bindCheckoutEvents();
    modal.style.display = 'block';
}

renderOrderSummary() {
    const itemsDiv = document.getElementById('orderItems');
    const subtotal = this.getTotal();
    const taxRate = 0.08; // 8% de taxa
    const taxes = subtotal * taxRate;
    const total = subtotal + taxes;

    let html = '';
    this.items.forEach(item => {
        html += `
            <div class="summary-line">
                <span>${item.qty}x ${item.name}</span>
                <span>R$ ${(parseFloat(item.price) * item.qty).toFixed(2)}</span>
            </div>
        `;
    });
    
    itemsDiv.innerHTML = html;
    document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2)}`;
    document.getElementById('taxes').textContent = `R$ ${taxes.toFixed(2)}`;
    document.getElementById('finalTotal').textContent = `R$ ${total.toFixed(2)}`;
}

bindCheckoutEvents() {
    // Busca CEP automático
    document.getElementById('cep').addEventListener('blur', async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;
        
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                document.getElementById('endereco').value = data.logradouro;
                document.getElementById('cidade').value = data.localidade;
                document.getElementById('estado').value = data.uf;
            }
        } catch (err) {
            console.error('Erro ao buscar CEP:', err);
        }
    });

    // Máscara CEP
    document.getElementById('cep').addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
        e.target.value = v;
    });

    // Botão InfinitePay
    document.getElementById('payInfinitePay').addEventListener('click', () => {
        this.processInfinitePay();
    });

    // Botão Stripe
    document.getElementById('payStripe').addEventListener('click', () => {
        this.processStripe();
    });
}

getFormData() {
    const subtotal = this.getTotal();
    const taxes = subtotal * 0.08;
    const total = subtotal + taxes;

    return {
        name: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        cep: document.getElementById('cep').value,
        endereco: document.getElementById('endereco').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        items: this.items,
        subtotal: subtotal,
        taxes: taxes,
        total: total
    };
}

validateForm() {
    const form = document.getElementById('checkoutForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return false;
    }
    return true;
}

processInfinitePay() {
    if (!this.validateForm()) return;
    
    const data = this.getFormData();
    
    // Monta link InfinitePay com valor total
    // Formato: https://link.infinitepay.io/NOME/VALOR
    const valor = data.total.toFixed(2).replace('.', ',');
    const nomeUrl = encodeURIComponent(data.name);
    const link = `https://link.infinitepay.io/yakelin-yisel/${nomeUrl}-${valor}`;
    
    // Salva pedido no localStorage antes de redirecionar
    localStorage.setItem('lastOrder', JSON.stringify(data));
    
    window.open(link, '_blank');
}

processStripe() {
    if (!this.validateForm()) return;
    
    const data = this.getFormData();
    
    // AQUI VOCÊ PRECISA DE BACKEND PRA GERAR SESSION REAL
    // Por enquanto, redireciona pra página de instruções
    alert(`Stripe Checkout:\n\nTotal: R$ ${data.total.toFixed(2)}\n\nPra integrar Stripe de verdade, você precisa:\n1. Criar conta no Stripe\n2. Backend que gera Checkout Session\n3. Webhook pra confirmar pagamento\n\nDados do pedido salvos.`);
    
    localStorage.setItem('lastOrder', JSON.stringify(data));
    
    // Exemplo: window.location.href = '/api/create-stripe-session';
}

closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}
}

// Inicia UMA VEZ SÓ
const cart = new ShoppingCart();
