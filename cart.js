// cart.js - Yi-Sell v1.0
// BASE: carrito original funcional + EmailJS

(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({
            publicKey: '2fsLYqtr1QY0q5Jbn'
        });
        console.log('EmailJS OK');
    } else {
        console.error('EmailJS no está cargado');
    }
})();

class ShoppingCart {
    constructor() {
        this.STORAGE_KEY = 'yiSellCart';
        this.items = this.loadCart();
        this.TAX_RATE = 0.00;

  this.EMAILJS_SERVICE_ID = 'service_56lcpfp un';
        this.EMAILJS_TEMPLATE_ID = 'template_7eo6ywr';

        this.orderConfirmed = false;
        this.init();
    }

    loadCart() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            const items = data ? JSON.parse(data) : [];
            return Array.isArray(items) ? items : [];
        } catch (e) {
            console.error('Error leyendo carrito:', e);
            return [];
        }
    }

    init() {
        this.render();
        this.updateCartCount();
        this.bindEvents();
        this.debug('INIT');
    }

    bindEvents() {
        document.addEventListener('click', e => {
            const btn = e.target.closest('.add-to-cart');
            if (!btn) return;

            e.preventDefault();

            const p = btn.closest('.product');
            if (!p) return;

            this.add({
                id: p.dataset.id,
                name: p.dataset.name,
                price: parseFloat(p.dataset.price) || 0
            });

            const text = btn.innerText;
            btn.innerText = 'Added ✓';
            setTimeout(() => btn.innerText = text, 1500);
        });

        const checkout = document.getElementById('checkout-btn');
        if (checkout) {
            checkout.addEventListener('click', () => this.openCheckout());
        }

        const close = document.querySelector('.close');
        if (close) {
            close.addEventListener('click', () => this.closeCheckout());
        }

        window.addEventListener('click', e => {
            if (e.target.id === 'checkoutModal') {
                this.closeCheckout();
            }
        });

        const confirm = document.getElementById('confirmDataBtn');
        if (confirm) {
            confirm.addEventListener('click', () => this.handleOrderConfirmation());
        }

        const infinite = document.getElementById('payInfinitePay');
        if (infinite) {
            infinite.addEventListener('click', () => this.processInfinitePay());
        }

        const stripe = document.getElementById('payStripe');
        if (stripe) {
            stripe.addEventListener('click', () => this.processStripe());
        }

        const pix = document.getElementById('copyPixBtn');
        if (pix) {
            pix.addEventListener('click', () =>
                this.copyToClipboard(
                    '41a2bc9e-5854-43ab-bc8a-b9f13addd96d',
                    pix
                )
            );
        }

        const eth = document.getElementById('copyEthBtn');
        if (eth) {
            eth.addEventListener('click', () =>
                this.copyToClipboard(
                    '0xacaCD7D5CD04D7E7Dcf4155C3FA6c2124f1B090C',
                    eth
                )
            );
        }
    }

    save() {
        localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(this.items)
        );
        this.updateCartCount();
        this.debug('SAVE');
    }

    add(item) {
        const existing = this.items.find(i => i.id == item.id);

        if (existing) {
            existing.qty += 1;
        } else {
            this.items.push({
                ...item,
                qty: 1
            });
        }

        this.save();
        this.render();
        this.debug('ADD');
    }

    updateQty(id, qty) {
        const item = this.items.find(i => i.id == id);

        if (!item) return;

        item.qty = Math.max(1, parseInt(qty) || 1);

        this.save();
        this.render();
        this.debug('UPDATE QTY');
    }

    remove(id) {
        this.items = this.items.filter(i => i.id != id);

        this.save();
        this.render();
        this.debug('REMOVE');
    }

    clearCart() {
        this.items = [];
        this.orderConfirmed = false;

        this.save();
        this.render();
        this.debug('CLEAR');
    }

    getSubtotal() {
        return this.items.reduce(
            (sum, i) =>
                sum + (parseFloat(i.price) || 0) * (Number(i.qty) || 0),
            0
        );
    }

    getTaxes() {
        return this.getSubtotal() * this.TAX_RATE;
    }

    getTotal() {
        return this.getSubtotal() + this.getTaxes();
    }

    money(value) {
        return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    }

    updateCartCount() {
        const el = document.getElementById('cart-count');

        if (el) {
            el.innerText = this.items.reduce(
                (sum, i) => sum + (Number(i.qty) || 0),
                0
            );
        }
    }

    render() {
        const tbody = document.querySelector('#cartTable tbody');
        if (!tbody) return;

        const table = document.getElementById('cartTable');
        const empty = document.getElementById('empty-cart-msg');
        const total = document.getElementById('cartTotal');
        const checkout = document.getElementById('checkout-btn');

        tbody.innerHTML = '';

        if (!this.items.length) {
            if (empty) empty.style.display = 'block';
            if (table) table.style.display = 'none';
            if (checkout) checkout.disabled = true;
            if (total) total.textContent = 'Total: R$ 0,00';
            return;
        }

        if (empty) empty.style.display = 'none';
        if (table) table.style.display = 'table';
        if (checkout) checkout.disabled = false;

        this.items.forEach(item => {
            const price = parseFloat(item.price) || 0;
            const qty = Number(item.qty) || 1;

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${this.money(price)}</td>
                <td>
                    <input
                        type="number"
                        value="${qty}"
                        min="1"
                        onchange="cart.updateQty('${item.id}', this.value)"
                    >
                </td>
                <td>${this.money(price * qty)}</td>
                <td>
                    <button
                        class="btn-remove"
                        onclick="cart.remove('${item.id}')"
                    >
                        Remover
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        if (total) {
            total.textContent = `Total: ${this.money(this.getSubtotal())}`;
        }
    }

    openCheckout() {
        if (!this.items.length) {
            alert('Seu carrinho está vazio!');
            return;
        }

        const modal = document.getElementById('checkoutModal');

        if (!modal) {
            alert('Erro: Modal de checkout não encontrado.');
            return;
        }

        this.orderConfirmed = false;

        const step1 = document.getElementById('checkoutStep1');
        const step2 = document.getElementById('checkoutStep2');

        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';

        const btn = document.getElementById('confirmDataBtn');

        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Confirmar y Enviar Datos';
        }

        this.renderOrderSummary();
        modal.style.display = 'block';
    }

    renderOrderSummary() {
        const itemsDiv = document.getElementById('orderItems');
        if (!itemsDiv) return;

        itemsDiv.innerHTML = this.items.map(item => `
            <div class="summary-line">
                <span>${item.qty}x ${item.name}</span>
                <span>${this.money(
                    (parseFloat(item.price) || 0) * item.qty
                )}</span>
            </div>
        `).join('');

        const subtotal = document.getElementById('subtotal');
        const taxes = document.getElementById('taxes');
        const total = document.getElementById('finalTotal');

        if (subtotal) subtotal.textContent = this.money(this.getSubtotal());
        if (taxes) taxes.textContent = this.money(this.getTaxes());
        if (total) total.textContent = this.money(this.getTotal());
    }

    getFormData() {
        return {
            nombre: document.getElementById('customerName')?.value.trim() || '',
            telefono: document.getElementById('phone')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            items: this.items,
            total: this.getTotal()
        };
    }

    validateForm() {
        const form = document.getElementById('checkoutForm');

        if (form && !form.checkValidity()) {
            form.reportValidity();
            return false;
        }

        const nombre = document.getElementById('customerName')?.value.trim() || '';
        const telefono = document.getElementById('phone')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';

        if (nombre.length < 3) {
            alert('Ingresa tu nombre completo.');
            return false;
        }

        if (telefono.replace(/\D/g, '').length < 8) {
            alert('Ingresa un teléfono válido.');
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Ingresa un correo electrónico válido.');
            return false;
        }

        return true;
    }

    async sendCheckoutEmail(data) {
        if (typeof emailjs === 'undefined') {
            alert('EmailJS no está cargado.');
            return false;
        }

        const params = {
            nombre: data.nombre,
            telefono: data.telefono,
            email: data.email,
            total: this.money(data.total),
            items: data.items
                .map(i => `${i.qty}x ${i.name}`)
                .join(' | '),
            payment_method: 'Pendiente'
        };

        console.log('EmailJS:', params);

        try {
            await emailjs.send(
                this.EMAILJS_SERVICE_ID,
                this.EMAILJS_TEMPLATE_ID,
                params
            );

            console.log('Email enviado correctamente.');
            return true;

        } catch (error) {
            console.error('EmailJS ERROR:', error);

            alert(
                'Error al enviar:\n\n' +
                (error.text || error.message || 'Error desconocido')
            );

            return false;
        }
    }

    async handleOrderConfirmation() {
        if (!this.validateForm()) return;

        if (!this.items.length) {
            alert('El carrito está vacío.');
            return;
        }

        const btn = document.getElementById('confirmDataBtn');

        if (!btn || btn.disabled) return;

        const original = btn.textContent;

        btn.disabled = true;
        btn.textContent = 'Enviando...';

        const data = this.getFormData();

        const sent = await this.sendCheckoutEmail(data);

        if (!sent) {
            btn.disabled = false;
            btn.textContent = original;
            return;
        }

        this.orderConfirmed = true;

        const step1 = document.getElementById('checkoutStep1');
        const step2 = document.getElementById('checkoutStep2');

        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'block';

        const dot = document.getElementById('emailStatusDot');
        const text = document.getElementById('emailStatusText');

        if (dot) dot.className = 'status-dot ok';
        if (text) {
            text.textContent =
                'Estado: Datos recibidos correctamente';
        }

        this.renderOrderSummary();
    }

    processInfinitePay() {
        if (!this.orderConfirmed) {
            alert('Primero confirma y envía los datos del pedido.');
            return;
        }

        const data = this.getFormData();
        const valor = data.total.toFixed(2).replace('.', ',');

        localStorage.setItem('lastOrder', JSON.stringify(data));

        this.clearCart();

        window.location.href =
            `https://link.infinitepay.io/yakelin-yisel/${valor}`;
    }

    async processStripe() {
        if (!this.validateForm()) return;

        const btn = document.getElementById('payStripe');

        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Processando...';
        }

        try {
            const data = this.getFormData();

            const response = await fetch(
                'https://yi-sell.onrender.com/create-checkout-session',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        items: data.items.map(item => ({
                            name: item.name,
                            price: parseFloat(item.price),
                            qty: item.qty
                        })),
                        customer: {
                            name: data.nombre,
                            email: data.email
                        },
                        metadata: {
                            phone: data.telefono
                        }
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Erro no servidor Stripe');
            }

            const session = await response.json();

            localStorage.setItem(
                'lastOrder',
                JSON.stringify(data)
            );

            this.clearCart();

            window.location.href = session.url;

        } catch (error) {
            console.error(error);

            alert(
                'Erro ao processar pagamento: ' +
                error.message
            );

            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Pagar com Cartão';
            }
        }
    }

    copyToClipboard(text, btn) {
        const original = btn.textContent;

        navigator.clipboard.writeText(text)
            .then(() => {
                btn.textContent = '✅ ¡COPIADO!';

                setTimeout(() => {
                    btn.textContent = original;
                }, 2000);
            })
            .catch(() => {
                const input = document.createElement('textarea');

                input.value = text;
                document.body.appendChild(input);
                input.select();

                try {
                    document.execCommand('copy');
                    btn.textContent = '✅ ¡COPIADO!';

                    setTimeout(() => {
                        btn.textContent = original;
                    }, 2000);
                } catch (e) {
                    btn.textContent = '❌ Error';
                }

                input.remove();
            });
    }

    closeCheckout() {
        const modal = document.getElementById('checkoutModal');

        if (modal) {
            modal.style.display = 'none';
        }
    }

    debug(action) {
        console.log(
            `🛒 ${action} | ${this.items.length} líneas | ` +
            `${this.items.reduce((s, i) => s + Number(i.qty || 0), 0)} unidades | ` +
            `Total: ${this.money(this.getTotal())}`
        );
    }
}

const cart = new ShoppingCart();