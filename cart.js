class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('yiSellCart')) || [];
        this.init();
    }

    init() {
        this.render();
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const p = e.target.closest('.product');
                if (!p) return;
                
                const item = {
                    id: p.dataset.id,
                    name: p.dataset.name,
                    price: parseFloat(p.dataset.price) || 0,
                };

                this.add(item);
                e.target.innerText = 'Added ✓';
                setTimeout(() => { e.target.innerText = 'Add to Cart'; }, 1500);
            }
        });

        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openCheckout());
        }

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
        const existing = this.items.find(i => i.id == item.id);
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
        if (!tbody) return;

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

    // ABRE MODAL - VERSÃO CORRETA
    openCheckout() {
        if (this.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const modal = document.getElementById('checkoutModal');
        if (!modal) {
            alert('Erro: Modal não encontrado');
            return;
        }

        this.renderOrderSummary();
        this.bindCheckoutEvents();
        modal.style.display = 'block';
    }

    renderOrderSummary() {
        const itemsDiv = document.getElementById('orderItems');
        if (!itemsDiv) return;

        const subtotal = this.getTotal();
        const taxRate = 0.08;
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
        const cepInput = document.getElementById('cep');
        if (cepInput && !cepInput.dataset.bound) {
            cepInput.dataset.bound = 'true';
            cepInput.addEventListener('blur', async (e) => {
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

            cepInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
                e.target.value = v;
            });
        }

        const payStripeBtn = document.getElementById('payStripe');
        if (payStripeBtn && !payStripeBtn.dataset.bound) {
            payStripeBtn.dataset.bound = 'true';
            payStripeBtn.addEventListener('click', () => this.processStripe());
        }

        const payInfiniteBtn = document.getElementById('payInfinitePay');
        if (payInfiniteBtn && !payInfiniteBtn.dataset.bound) {
            payInfiniteBtn.dataset.bound = 'true';
            payInfiniteBtn.addEventListener('click', () => this.processInfinitePay());
        }
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
    const valor = data.total.toFixed(2).replace('.', ',');
    
    // LINK SIMPLES, SEM NOME NEM CÓDIGO
    const link = `https://link.infinitepay.io/yakelin-yisel/${valor}`;
    
    localStorage.setItem('lastOrder', JSON.stringify(data));
    window.location.href = link;
}
    // STRIPE DE VERDADE - CHAMA SEU BACKEND NO RENDER
    async processStripe() {
        if (!this.validateForm()) return;
        
        const data = this.getFormData();
        const btn = document.getElementById('payStripe');
        btn.disabled = true;
        btn.textContent = 'Processando...';

        try {
            // TROCA AQUI PELA URL DO SEU RENDER
            const response = await fetch('https://yi-sell.onrender.com/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: data.items.map(item => ({
                        name: item.name,
                        price: parseFloat(item.price),
                        qty: item.qty
                    })),
                    customer: {
                        name: data.name,
                        email: data.email
                    }
                })
            });

            if (!response.ok) throw new Error('Erro no servidor');

            const session = await response.json();
            localStorage.setItem('lastOrder', JSON.stringify(data));
            
            // Limpa carrinho e redireciona pro Stripe
            this.items = [];
            this.save();
            window.location.href = session.url;

        } catch (error) {
            alert('Erro ao processar pagamento: ' + error.message);
            btn.disabled = false;
            btn.textContent = 'Pagar com Stripe';
        }
    }

    closeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.style.display = 'none';
    }
}

const cart = new ShoppingCart();
