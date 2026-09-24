// ==========================================
// 1. INICIALIZACIÓN DE EmailJS
// ==========================================
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: "2fsLYqtr1QY0q5Jbn" });
        console.log("✅ EmailJS inicializado correctamente.");
    } else {
        console.error("❌ CRÍTICO: EmailJS no se cargó. Revisa tu conexión o el script en el <head>.");
    }
})();

class ShoppingCart {
    constructor() {
        // 1. Detectar automáticamente la clave real que usa tu catálogo
        this.STORAGE_KEY = this.findCartKey();

        // 2. Cargar los items usando esa clave exacta
        this.items = JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || [];

        this.TAX_RATE = 0.00; 
        this.EMAILJS_SERVICE_ID = "service_56lcpfp";
        this.EMAILJS_TEMPLATE_ID = "template_7eo6ywr";
        this.orderConfirmed = false;

        console.log(`🛒 Carrito cargado desde: "${this.STORAGE_KEY}" con ${this.items.length} items.`);
        this.init();
    }

    // Método inteligente para encontrar la clave correcta
    findCartKey() {
        const possibleKeys = [
            'yiSellCart',      
            'yiCart',          
            'yi_sell_cart',    
            'cart',            
            'shoppingCart',    
            'shopping_cart'    
        ];

        for (let key of possibleKeys) {
            if (localStorage.getItem(key)) {
                console.log(`✅ Clave del carrito encontrada y unificada: "${key}"`);
                return key;
            }
        }
        return 'yiSellCart'; // Clave por defecto si no encuentra ninguna
    }

    init() {
        this.render();
        this.updateCartCount();
        this.bindEvents();
    }

    bindEvents() {
        // 1. Add to Cart
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.add-to-cart');
            if (btn) {
                e.preventDefault();
                const p = btn.closest('.product');
                if (!p) return;

                this.add({
                    id: p.dataset.id,
                    name: p.dataset.name,
                    price: parseFloat(p.dataset.price) || 0,
                });

                const originalText = btn.innerText;
                btn.innerText = 'Added ✓';
                btn.disabled = true;
                setTimeout(() => { 
                    btn.innerText = originalText || 'Add to Cart'; 
                    btn.disabled = false;
                }, 1500);
            }
        });

        // 2. Abrir Checkout
        const checkoutBtn = document.getElementById('checkout-btn');
        if (checkoutBtn) checkoutBtn.addEventListener('click', () => this.openCheckout());

        // 3. Cerrar Modal
        const closeBtn = document.getElementById('closeModal');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeCheckout());
        window.addEventListener('click', (e) => {
            if (e.target.id === 'checkoutModal') this.closeCheckout();
        });

        // 4. PASO 1: Confirmar y Enviar Datos
        const confirmBtn = document.getElementById('confirmDataBtn');
        if (confirmBtn) confirmBtn.addEventListener('click', () => this.handleOrderConfirmation());

        // 5. PASO 2: Botones de Pago y Copiado
        const payInfiniteBtn = document.getElementById('payInfinitePay');
        if (payInfiniteBtn) payInfiniteBtn.addEventListener('click', () => this.processInfinitePay());

        const copyPixBtn = document.getElementById('copyPixBtn');
        if (copyPixBtn) copyPixBtn.addEventListener('click', () => this.copyToClipboard('41a2bc9e-5854-43ab-bc8a-b9f13addd96d', copyPixBtn));

        const copyEthBtn = document.getElementById('copyEthBtn');
        if (copyEthBtn) copyEthBtn.addEventListener('click', () => this.copyToClipboard('0xacaCD7D5CD04D7E7Dcf4155C3FA6c2124f1B090C', copyEthBtn));
    }

    // ✅ CORREGIDO: Ahora usa la clave detectada, no un nombre fijo
    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.items));
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

        tbody.innerHTML = '';

        if (this.items.length === 0) {
            if (checkoutBtn) checkoutBtn.disabled = true;
            if (totalEl) totalEl.textContent = 'Total: R$ 0,00';
            return;
        }

        if (checkoutBtn) checkoutBtn.disabled = false;

        this.items.forEach(item => {
            const price = parseFloat(item.price);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>R$ ${price.toFixed(2).replace('.', ',')}</td>
                <td><input type="number" value="${item.qty}" min="1" onchange="cart.updateQty('${item.id}', this.value)"></td>
                <td>R$ ${(price * item.qty).toFixed(2).replace('.', ',')}</td>
                <td><button class="btn-remove" onclick="cart.remove('${item.id}')">Remover</button></td>
            `;
            tbody.appendChild(row);
        });

        if (totalEl) totalEl.textContent = `Total: R$ ${this.getSubtotal().toFixed(2).replace('.', ',')}`;
    }

    openCheckout() {
        if (this.items.length === 0) {
            alert('¡Carrito vacío! Agrega productos antes de continuar.');
            return;
        }
        const modal = document.getElementById('checkoutModal');
        const step1 = document.getElementById('checkoutStep1');
        const step2 = document.getElementById('checkoutStep2');

        if (modal) {
            this.orderConfirmed = false;
            if (step1) step1.style.display = 'block';
            if (step2) step2.style.display = 'none';

            const emailStatusDot = document.getElementById('emailStatusDot');
            const emailStatusText = document.getElementById('emailStatusText');
            if (emailStatusDot) emailStatusDot.className = 'status-dot pending';
            if (emailStatusText) emailStatusText.textContent = 'Estado del envío: pendiente';

            const confirmBtn = document.getElementById('confirmDataBtn');
            if (confirmBtn) {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirmar y Enviar Datos';
                confirmBtn.style.backgroundColor = '';
            }

            this.renderOrderSummary();
            modal.style.display = 'block';
        }
    }

    renderOrderSummary() {
        const itemsDiv = document.getElementById('orderItems');
        if (!itemsDiv) return;

        let html = '';
        this.items.forEach(item => {
            html += `<div class="summary-line"><span>${item.qty}x ${item.name}</span><span>R$ ${(parseFloat(item.price) * item.qty).toFixed(2).replace('.', ',')}</span></div>`;
        });
        itemsDiv.innerHTML = html;

        document.getElementById('subtotal').textContent = `R$ ${this.getSubtotal().toFixed(2).replace('.', ',')}`;
        document.getElementById('taxes').textContent = `R$ ${this.getTaxes().toFixed(2).replace('.', ',')}`;
        document.getElementById('finalTotal').textContent = `R$ ${this.getTotal().toFixed(2).replace('.', ',')}`;
    }

    getFormData() {
        return {
            name: document.getElementById('customerName')?.value.trim() || '',
            telefono: document.getElementById('phone')?.value.trim() || '',
            email: document.getElementById('email')?.value.trim() || '',
            items: this.items,
            total: this.getTotal()
        };
    }

    validateForm() {
        const name = document.getElementById('customerName')?.value.trim() || '';
        const phone = document.getElementById('phone')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        let isValid = true;

        document.querySelectorAll('.error-msg').forEach(e => {
            e.style.display = 'none';
            e.textContent = '';
        });

        if (name.length < 3) {
            const err = document.getElementById('nameError');
            err.textContent = "El nombre debe tener al menos 3 caracteres.";
            err.style.display = 'block';
            isValid = false;
        }

        if (phone.replace(/\D/g, '').length < 8) {
            const err = document.getElementById('phoneError');
            err.textContent = "Ingresa un teléfono válido (mínimo 8 dígitos).";
            err.style.display = 'block';
            isValid = false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            const err = document.getElementById('emailError');
            err.textContent = "Ingresa un correo electrónico válido (ej: tu@email.com).";
            err.style.display = 'block';
            isValid = false;
        }

        return isValid;
    }

    async sendCheckoutEmail(data) {
        if (typeof emailjs === 'undefined') {
            alert("⚠️ Error crítico: La librería de EmailJS no se cargó. Revisa tu conexión a internet.");
            return false;
        }

        // ✅ COMPATIBILIDAD TOTAL CON TU PLANTILLA: {{nombre}}, {{telefono}}, {{email}}, {{total}}
        const templateParams = {
            nombre: data.name,
            telefono: data.telefono,
            email: data.email,
            total: `R$ ${data.total.toFixed(2).replace('.', ',')}`,
            items: data.items.map(i => `${i.qty}x ${i.name}`).join(' | '),
            payment_method: 'Pendiente'
        };

        try {
            console.log("📤 Parámetros enviados a EmailJS:", templateParams);
            const res = await emailjs.send(this.EMAILJS_SERVICE_ID, this.EMAILJS_TEMPLATE_ID, templateParams);
            console.log('✅ EmailJS respuesta exitosa:', res);
            return true;
        } catch (error) {
            console.error('❌ Error detallado de EmailJS:', error);

            let errorMsg = "Error de red o configuración desconocida.";
            if (error.text) {
                errorMsg = error.text; 
            } else if (error.message) {
                errorMsg = error.message;
            }

            alert(`❌ Error al enviar los datos:\n\n"${errorMsg}"\n\n💡 Solución: Revisa que los IDs en cart.js coincidan exactamente con los de tu panel de EmailJS.`);
            return false;
        }
    }

    async handleOrderConfirmation() {
        if (!this.validateForm()) {
            alert("⚠️ Por favor, corrige los errores marcados en rojo en el formulario antes de continuar.");
            return;
        }

        const btn = document.getElementById('confirmDataBtn');
        if (!btn || btn.disabled) return;

        const data = this.getFormData();
        if (!data.items || data.items.length === 0) {
            alert("⚠️ El carrito está vacío.");
            return;
        }

        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = '⏳ Enviando datos...';

        const emailSent = await this.sendCheckoutEmail(data);

        if (emailSent) {
            document.getElementById('checkoutStep1').style.display = 'none';
            document.getElementById('checkoutStep2').style.display = 'block';

            const dot = document.getElementById('emailStatusDot');
            const txt = document.getElementById('emailStatusText');
            if (dot) dot.className = 'status-dot ok';
            if (txt) txt.textContent = '✅ Estado: Datos recibidos correctamente';

            this.orderConfirmed = true;
            this.renderOrderSummary();
        } else {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    async processInfinitePay() {
        if (!this.orderConfirmed) {
            alert('⚠️ Por favor, primero haz clic en "Confirmar y Enviar Datos" para registrar tu pedido.');
            return;
        }
        const btn = document.getElementById('payInfinitePay');
        btn.disabled = true;
        btn.textContent = 'Redirigiendo...';

        const data = this.getFormData();
        const valor = data.total.toFixed(2).replace('.', ',');

        localStorage.setItem('lastOrder', JSON.stringify(data));
        this.clearCart();
        window.location.href = `https://link.infinitepay.io/yakelin-yisel/${valor}`;
    }

    copyToClipboard(text, btn) {
        const originalText = btn.textContent;
        navigator.clipboard.writeText(text).then(() => {
            btn.textContent = '✅ ¡COPIADO!';
            setTimeout(() => { btn.textContent = originalText; }, 2000);
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                btn.textContent = '✅ ¡COPIADO!';
                setTimeout(() => { btn.textContent = originalText; }, 2000);
            } catch (err) {
                btn.textContent = '❌ Error al copiar';
            }
            document.body.removeChild(ta);
        });
    }

    closeCheckout() {
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.style.display = 'none';
    }
}

// Inicialización global
const cart = new ShoppingCart();