  // ==========================================
// 1. INICIALIZACIÓN DE EmailJS (Segura y sin spam)
// ==========================================
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: "2fsLYqtr1QY0q5Jbn",
        });
        console.log("✅ EmailJS inicializado correctamente.");
    } else {
        console.warn("⚠️ EmailJS no detectado. El envío de correos no funcionará, pero el checkout sí.");
    }
})();

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('yiSellCart')) || [];
        this.TAX_RATE = 0.00; 

        // Configuración de EmailJS
        this.EMAILJS_SERVICE_ID = "service_56lcpfp";
        this.EMAILJS_TEMPLATE_ID = "template_7eo6ywr";

        // Estado del flujo de compra
        this.orderConfirmed = false;

        this.init();
    }

    init() {
        this.render();
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // Add to Cart (Robusto: funciona aunque el botón tenga íconos internos)
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart');
            if (btn) {
                e.preventDefault();
                const p = btn.closest('.product');
                if (!p) return;

                const item = {
                    id: p.dataset.id,
                    name: p.dataset.name,
                    price: parseFloat(p.dataset.price) || 0,
                };

                this.add(item);

                const originalText = btn.innerText;
                btn.innerText = 'Added ✓';
                btn.disabled = true;
                setTimeout(() => { 
                    btn.innerText = originalText || 'Add to Cart'; 
                    btn.disabled = false;
                }, 1500);
            }
        });

        // Abrir Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.openCheckout());
        }

        // Cerrar Modal
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

    clearCart() {
        this.items = [];
        this.orderConfirmed = false;
        this.save();
        this.render();
    }

    getSubtotal() {
        return this.items.reduce((sum, i) => sum + (parseFloat(i.price) * i.qty), 0);
    }

    getTaxes() {
        return this.getSubtotal() * this.TAX_RATE;
    }

    getTotal() {
        return this.getSubtotal() + this.getTaxes();
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
            if (totalEl) totalEl.textContent = 'Total: R$ 0,00';
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
                <td>R$ ${price.toFixed(2).replace('.', ',')}</td>
                <td>
                    <input type="number" value="${item.qty}" min="1" 
                           onchange="cart.updateQty('${item.id}', this.value)">
                </td>
                <td>R$ ${(price * item.qty).toFixed(2).replace('.', ',')}</td>
                <td>
                    <button class="btn-remove" onclick="cart.remove('${item.id}')">Remover</button>
                </td>
            `;
            tbody.appendChild(row);
        });

        if (totalEl) {
            totalEl.textContent = `Total: R$ ${this.getSubtotal().toFixed(2).replace('.', ',')}`;
        }
    }

    openCheckout() {
        if (this.items.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const modal = document.getElementById('checkoutModal');
        if (!modal) {
            alert('Erro: Modal de checkout não encontrado no HTML');
            return;
        }

        this.orderConfirmed = false;
        this.togglePaymentButtons(false);

        this.renderOrderSummary();
        this.bindCheckoutEvents();
        modal.style.display = 'block';
    }

    renderOrderSummary() {
        const itemsDiv = document.getElementById('orderItems');
        if (!itemsDiv) return;

        const subtotal = this.getSubtotal();
        const taxes = this.getTaxes();
        const total = this.getTotal();

        let html = '';
        this.items.forEach(item => {
            html += `
                <div class="summary-line">
                    <span>${item.qty}x ${item.name}</span>
                    <span>R$ ${(parseFloat(item.price) * item.qty).toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });

        itemsDiv.innerHTML = html;
        document.getElementById('subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('taxes').textContent = `R$ ${taxes.toFixed(2).replace('.', ',')}`;
        document.getElementById('finalTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }

    bindCheckoutEvents() {
        // ViaCEP Autocomplete
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
                        document.getElementById('endereco').value = data.logradouro || '';
                        document.getElementById('cidade').value = data.localidade || '';
                        document.getElementById('estado').value = data.uf || '';
                        document.getElementById('numero').focus();
                    }
                } catch (err) {
                    console.error('Erro ao buscar CEP:', err);
                }
            });

            cepInput.addEventListener('input', (e) => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5, 8);
                e.target.value = v;
            });
        }

        // PASO 1: Botón Confirmar y Continuar
        const confirmBtn = document.getElementById('confirm-order-btn');
        if (confirmBtn && !confirmBtn.dataset.bound) {
            confirmBtn.dataset.bound = 'true';
            confirmBtn.addEventListener('click', () => this.handleOrderConfirmation());
        }

        // PASO 2: Botones de Pago
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
        return {
            name: document.getElementById('customerName')?.value || '',
            email: document.getElementById('email')?.value || '',
            telefono: document.getElementById('telefono')?.value || document.getElementById('phone')?.value || '',
            cep: document.getElementById('cep')?.value || '',
            endereco: document.getElementById('endereco')?.value || '',
            numero: document.getElementById('numero')?.value || '',
            complemento: document.getElementById('complemento')?.value || '',
            cidade: document.getElementById('cidade')?.value || '',
            estado: document.getElementById('estado')?.value || '',
            items: this.items,
            subtotal: this.getSubtotal(),
            taxes: this.getTaxes(),
            total: this.getTotal()
        };
    }

    validateForm() {
        const form = document.getElementById('checkoutForm');
        if (!form) return true;
        if (!form.checkValidity()) {
            form.reportValidity();
            return false;
        }
        return true;
    }

    // ==========================================
    // 3. MÉTODO sendCheckoutEmail() - BLINDADO
    // ==========================================
    async sendCheckoutEmail(data, metodoPago) {
        // Si EmailJS no está cargado, retornamos true para no bloquear
        if (typeof emailjs === 'undefined') {
            console.warn("⚠️ EmailJS no disponible. Continuando sin envío de correo.");
            return true;
        }

        const itemsTexto = data.items.map(i => 
            `${i.qty}x ${i.name} - R$ ${(parseFloat(i.price) * i.qty).toFixed(2)}`
        ).join('\n');

        const templateParams = {
            customer_name: data.name,
            customer_email: data.email,
            customer_telefono: data.telefono,
            telefono: data.telefono,
            customer_address: `${data.endereco}, ${data.numero} - ${data.cidade}/${data.estado} - CEP: ${data.cep}`,
            order_items: itemsTexto,
            order_total: `R$ ${data.total.toFixed(2).replace('.', ',')}`,
            payment_method: metodoPago,
            to_email: data.email,
            from_name: "Yi-Sell"
        };

        try {
            console.log("📤 Enviando email con params:", templateParams);
            const res = await emailjs.send(this.EMAILJS_SERVICE_ID, this.EMAILJS_TEMPLATE_ID, templateParams);
            console.log('✅ EmailJS enviado con éxito:', res.status, res.text);
            return true;
        } catch (error) {
            console.error('❌ Error EmailJS:', error);
            console.error('Service ID:', this.EMAILJS_SERVICE_ID);
            console.error('Template ID:', this.EMAILJS_TEMPLATE_ID);
            // IMPORTANTE: Retornamos true aunque falle, para no bloquear el checkout
            return true;
        }
    }

    // ==========================================
    // 4. PASO 1: Manejar Confirmación (NO BLOQUEANTE)
    // ==========================================
    async handleOrderConfirmation() {
        if (!this.validateForm()) return;

        const btn = document.getElementById('confirm-order-btn');
        if (!btn || btn.disabled) return;

        btn.disabled = true;
        btn.textContent = 'Enviando confirmación...';

        const data = this.getFormData();

        // Enviar correo (no bloqueante - siempre retorna true)
        await this.sendCheckoutEmail(data, 'Confirmado - Pendiente de Pago');

        // SIEMPRE habilitamos los botones de pago, incluso si el email falló
        this.orderConfirmed = true;
        btn.textContent = '¡Confirmado! ✓';
        btn.style.backgroundColor = '#28a745';
        btn.style.color = '#fff';

        // Habilitar botones de pago
        this.togglePaymentButtons(true);
        
        console.log("✅ Pedido confirmado. Botones de pago habilitados.");
    }

    // ==========================================
    // 5. PASO 2: Procesar Pagos
    // ==========================================
    async processInfinitePay() {
        if (!this.orderConfirmed) {
            alert('Por favor, primero haz clic en "Confirmar y Continuar" para registrar tu pedido.');
            return;
        }

        const btn = document.getElementById('payInfinitePay');
        btn.disabled = true;
        btn.textContent = 'Redirigiendo...';

        const data = this.getFormData();
        const valor = data.total.toFixed(2).replace('.', ',');
        const link = `https://link.infinitepay.io/yakelin-yisel/${valor}`;

        localStorage.setItem('lastOrder', JSON.stringify(data));
        this.clearCart();

        window.location.href = link;
    }

    async processStripe() {
        if (!this.orderConfirmed) {
            alert('Por favor, primero haz clic en "Confirmar y Continuar" para registrar tu pedido.');
            return;
        }

        const btn = document.getElementById('payStripe');
        btn.disabled = true;
        btn.textContent = 'Procesando...';

        try {
            const data = this.getFormData();

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
                        email: data.email,
                        phone: data.telefono
                    },
                    metadata: {
                        cep: data.cep,
                        endereco: `${data.endereco}, ${data.numero}`,
                        cidade: data.cidade,
                        estado: data.estado,
                        telefono: data.telefono
                    }
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro no servidor');
            }

            const session = await response.json();
            localStorage.setItem('lastOrder', JSON.stringify(data));
            this.clearCart();

            window.location.href = session.url;

        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            alert('Erro ao processar pagamento: ' + error.message);
            btn.disabled = false;
            btn.textContent = 'Pagar con Cartão (Stripe)';
        }
    }

    togglePaymentButtons(show) {
        const paymentContainer = document.getElementById('payment-buttons-container');
        if (paymentContainer) {
            paymentContainer.style.display = show ? 'block' : 'none';
        } else {
            const stripeBtn = document.getElementById('payStripe');
            const infiniteBtn = document.getElementById('payInfinitePay');
            if (stripeBtn) stripeBtn.style.display = show ? 'inline-block' : 'none';
            if (infiniteBtn) infiniteBtn.style.display = show ? 'inline-block' : 'none';
        }
    }

    closeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.style.display = 'none';
    }
}

// Inicialización global
const cart = new ShoppingCart(); 