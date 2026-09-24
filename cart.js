 ============================================================
// cart.js - Yi-Sell v1.0 Final
// BASE: versión original funcional
// EmailJS integrado sin alterar la arquitectura del carrito
// ============================================================


// ============================================================
// 1. INICIALIZACIÓN DE EmailJS
// ============================================================

(function () {
    if (typeof emailjs !== 'undefined') {

        emailjs.init({
            publicKey: "2fsLYqtr1QY0q5Jbn"
        });

        console.log("✅ EmailJS inicializado correctamente.");

    } else {

        console.error(
            "❌ CRÍTICO: EmailJS no se cargó. " +
            "Revisa el script de EmailJS en el <head>."
        );
    }
})();


// ============================================================
// 2. SHOPPING CART
// ============================================================

class ShoppingCart {

    constructor() {

        // ----------------------------------------------------
        // IMPORTANTE:
        // Se conserva EXACTAMENTE la clave original.
        // No usamos findCartKey().
        // ----------------------------------------------------

        this.STORAGE_KEY = 'yiSellCart';

        this.items = this.loadCart();

        this.TAX_RATE = 0.00;

        // ----------------------------------------------------
        // CONFIGURACIÓN EmailJS
        // ----------------------------------------------------

        this.EMAILJS_SERVICE_ID = "service_56lcpfp";
        this.EMAILJS_TEMPLATE_ID = "template_7eo6ywr";

        this.orderConfirmed = false;

        console.log(
            `🛒 Carrito iniciado. ` +
            `Storage: "${this.STORAGE_KEY}" | ` +
            `Items: ${this.items.length}`
        );

        this.debugCart("CONSTRUCTOR");

        this.init();
    }


    // ========================================================
    // 3. CARGAR CARRITO
    // ========================================================

    loadCart() {

        try {

            const stored = localStorage.getItem(this.STORAGE_KEY);

            if (!stored) {
                console.log("🛒 No existe carrito guardado. Se inicia vacío.");
                return [];
            }

            const parsed = JSON.parse(stored);

            if (!Array.isArray(parsed)) {

                console.error(
                    "❌ El contenido de yiSellCart no es un array."
                );

                return [];
            }

            console.log(
                `✅ ${parsed.length} línea(s) cargadas desde localStorage.`
            );

            return parsed;

        } catch (error) {

            console.error(
                "❌ Error leyendo yiSellCart:",
                error
            );

            return [];
        }
    }


    // ========================================================
    // 4. DEBUG DEL CARRITO
    // ========================================================

    debugCart(action = "DEBUG") {

        console.group(`🛒 DEBUG CARRITO — ${action}`);

        console.log("Storage Key:", this.STORAGE_KEY);
        console.log("Items:", this.items);
        console.log("Cantidad de líneas:", this.items.length);
        console.log(
            "Cantidad total:",
            this.items.reduce(
                (sum, item) => sum + (Number(item.qty) || 0),
                0
            )
        );

        console.log(
            "Subtotal:",
            this.getSubtotal()
        );

        console.log(
            "Total:",
            this.getTotal()
        );

        console.log(
            "localStorage:",
            localStorage.getItem(this.STORAGE_KEY)
        );

        console.groupEnd();
    }


    // ========================================================
    // 5. INIT
    // ========================================================

    init() {

        this.render();

        this.updateCartCount();

        this.bindEvents();

        this.debugCart("INIT");
    }


    // ========================================================
    // 6. EVENTOS
    // ========================================================

    bindEvents() {

        // ----------------------------------------------------
        // ADD TO CART
        // ----------------------------------------------------

        document.addEventListener('click', (e) => {

            const btn = e.target.closest('.add-to-cart');

            if (!btn) return;

            e.preventDefault();

            const p = btn.closest('.product');

            if (!p) {

                console.error(
                    "❌ Botón Add to Cart sin elemento .product."
                );

                return;
            }

            const item = {

                id: p.dataset.id,

                name: p.dataset.name,

                price: parseFloat(p.dataset.price) || 0
            };


            console.log(
                "➕ Agregando producto:",
                item
            );


            this.add(item);


            const originalText =
                btn.innerText || 'Add to Cart';

            btn.innerText = 'Added ✓';

            btn.disabled = true;


            setTimeout(() => {

                btn.innerText = originalText;

                btn.disabled = false;

            }, 1500);

        });


        // ----------------------------------------------------
        // CHECKOUT
        // ----------------------------------------------------

        const checkoutBtn =
            document.getElementById('checkout-btn');

        if (checkoutBtn) {

            checkoutBtn.addEventListener(
                'click',
                () => this.openCheckout()
            );
        }


        // ----------------------------------------------------
        // CLOSE MODAL
        // ----------------------------------------------------

        const closeBtn =
            document.querySelector('.close');

        if (closeBtn) {

            closeBtn.addEventListener(
                'click',
                () => this.closeCheckout()
            );
        }


        window.addEventListener('click', (e) => {

            if (e.target.id === 'checkoutModal') {

                this.closeCheckout();
            }

        });


        // ----------------------------------------------------
        // CONFIRMAR PEDIDO / EMAILJS
        // ----------------------------------------------------

        const confirmBtn =
            document.getElementById('confirmDataBtn');

        if (confirmBtn) {

            confirmBtn.addEventListener(
                'click',
                () => this.handleOrderConfirmation()
            );
        }


        // ----------------------------------------------------
        // INFINITEPAY
        // ----------------------------------------------------

        const payInfiniteBtn =
            document.getElementById('payInfinitePay');

        if (payInfiniteBtn) {

            payInfiniteBtn.addEventListener(
                'click',
                () => this.processInfinitePay()
            );
        }


        // ----------------------------------------------------
        // STRIPE
        // ----------------------------------------------------

        const payStripeBtn =
            document.getElementById('payStripe');

        if (payStripeBtn) {

            payStripeBtn.addEventListener(
                'click',
                () => this.processStripe()
            );
        }


        // ----------------------------------------------------
        // PIX
        // ----------------------------------------------------

        const copyPixBtn =
            document.getElementById('copyPixBtn');

        if (copyPixBtn) {

            copyPixBtn.addEventListener(
                'click',
                () => this.copyToClipboard(
                    '41a2bc9e-5854-43ab-bc8a-b9f13addd96d',
                    copyPixBtn
                )
            );
        }


        // ----------------------------------------------------
        // ETH
        // ----------------------------------------------------

        const copyEthBtn =
            document.getElementById('copyEthBtn');

        if (copyEthBtn) {

            copyEthBtn.addEventListener(
                'click',
                () => this.copyToClipboard(
                    '0xacaCD7D5CD04D7E7Dcf4155C3FA6c2124f1B090C',
                    copyEthBtn
                )
            );
        }
    }


    // ========================================================
    // 7. SAVE
    // ========================================================

    save() {

        try {

            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this.items)
            );

            console.log(
                `💾 Carrito guardado en "${this.STORAGE_KEY}".`
            );

            this.updateCartCount();

            this.debugCart("SAVE");

        } catch (error) {

            console.error(
                "❌ Error guardando carrito:",
                error
            );
        }
    }


    // ========================================================
    // 8. ADD
    // ========================================================

    add(item) {

        console.log(
            "➕ ADD antes:",
            this.items
        );


        const existing =
            this.items.find(
                i => i.id == item.id
            );


        if (existing) {

            existing.qty += 1;

            console.log(
                `🔄 Producto existente. Nueva cantidad: ${existing.qty}`
            );

        } else {

            this.items.push({
                ...item,
                qty: 1
            });

            console.log(
                "🆕 Producto nuevo agregado."
            );
        }


        this.save();

        this.render();

        this.debugCart("ADD DESPUÉS");
    }


    // ========================================================
    // 9. UPDATE QUANTITY
    // ========================================================

    updateQty(id, qty) {

        console.log(
            "✏️ UPDATE QTY:",
            id,
            qty
        );


        const item =
            this.items.find(
                i => i.id == id
            );


        if (!item) {

            console.error(
                "❌ No se encontró producto:",
                id
            );

            return;
        }


        item.qty =
            Math.max(
                1,
                parseInt(qty) || 1
            );


        this.save();

        this.render();

        this.debugCart("UPDATE QTY");
    }


    // ========================================================
    // 10. REMOVE
    // ========================================================

    remove(id) {

        console.log(
            "🗑️ REMOVE:",
            id
        );


        const before =
            this.items.length;


        this.items =
            this.items.filter(
                i => i.id != id
            );


        const after =
            this.items.length;


        console.log(
            `🗑️ Líneas: ${before} → ${after}`
        );


        this.save();

        this.render();

        this.debugCart("REMOVE");
    }


    // ========================================================
    // 11. CLEAR CART
    // ========================================================

    clearCart() {

        console.log(
            "🧹 CLEAR CART"
        );


        this.items = [];

        this.orderConfirmed = false;

        this.save();

        this.render();

        this.debugCart("CLEAR CART");
    }


    // ========================================================
    // 12. SUBTOTAL
    // ========================================================

    getSubtotal() {

        return this.items.reduce(
            (sum, i) =>
                sum +
                (
                    parseFloat(i.price) *
                    Number(i.qty)
                ),
            0
        );
    }


    // ========================================================
    // 13. TAXES
    // ========================================================

    getTaxes() {

        return this.getSubtotal() *
            this.TAX_RATE;
    }


    // ========================================================
    // 14. TOTAL
    // ========================================================

    getTotal() {

        return (
            this.getSubtotal() +
            this.getTaxes()
        );
    }


    // ========================================================
    // 15. CART COUNT
    // ========================================================

    updateCartCount() {

        const count =
            this.items.reduce(
                (sum, item) =>
                    sum + Number(item.qty || 0),
                0
            );


        const el =
            document.querySelector('#cart-count');


        if (el) {

            el.innerText = count;
        }


        console.log(
            "🔢 Cart count:",
            count
        );
    }


    // ========================================================
    // 16. RENDER CARRITO
    // ========================================================

    render() {

        const tbody =
            document.querySelector(
                '#cartTable tbody'
            );


        if (!tbody) {

            console.warn(
                "⚠️ #cartTable tbody no existe en esta página."
            );

            return;
        }


        const totalEl =
            document.getElementById(
                'cartTotal'
            );


        const checkoutBtn =
            document.getElementById(
                'checkout-btn'
            );


        const emptyMsg =
            document.getElementById(
                'empty-cart-msg'
            );


        const table =
            document.getElementById(
                'cartTable'
            );


        tbody.innerHTML = '';


        // ----------------------------------------------------
        // CARRITO VACÍO
        // ----------------------------------------------------

        if (this.items.length === 0) {

            if (emptyMsg)
                emptyMsg.style.display = 'block';

            if (table)
                table.style.display = 'none';

            if (checkoutBtn)
                checkoutBtn.disabled = true;

            if (totalEl)
                totalEl.textContent =
                    'Total: R$ 0,00';

            return;
        }


        // ----------------------------------------------------
        // CARRITO CON PRODUCTOS
        // ----------------------------------------------------

        if (emptyMsg)
            emptyMsg.style.display = 'none';

        if (table)
            table.style.display = 'table';

        if (checkoutBtn)
            checkoutBtn.disabled = false;


        this.items.forEach(item => {

            const price =
                parseFloat(item.price) || 0;


            const qty =
                Number(item.qty) || 1;


            const row =
                document.createElement('tr');


            row.innerHTML = `

                <td>
                    ${item.name}
                </td>

                <td>
                    R$ ${price
                        .toFixed(2)
                        .replace('.', ',')}
                </td>

                <td>

                    <input
                        type="number"
                        value="${qty}"
                        min="1"
                        onchange="cart.updateQty('${item.id}', this.value)"
                    >

                </td>

                <td>
                    R$ ${(price * qty)
                        .toFixed(2)
                        .replace('.', ',')}
                </td>

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


        if (totalEl) {

            totalEl.textContent =
                `Total: R$ ${this
                    .getSubtotal()
                    .toFixed(2)
                    .replace('.', ',')}`;
        }


        console.log(
            "🎨 Render carrito completado."
        );
    }


    // ========================================================
    // 17. OPEN CHECKOUT
    // ========================================================

    openCheckout() {

        if (this.items.length === 0) {

            alert(
                'Seu carrinho está vazio!'
            );

            return;
        }


        const modal =
            document.getElementById(
                'checkoutModal'
            );


        if (!modal) {

            alert(
                'Erro: Modal de checkout não encontrado no HTML'
            );

            return;
        }


        this.orderConfirmed = false;


        // ----------------------------------------------------
        // PASO 1 / PASO 2
        // ----------------------------------------------------

        const step1 =
            document.getElementById(
                'checkoutStep1'
            );


        const step2 =
            document.getElementById(
                'checkoutStep2'
            );


        if (step1)
            step1.style.display = 'block';


        if (step2)
            step2.style.display = 'none';


        // ----------------------------------------------------
        // ESTADO EMAILJS
        // ----------------------------------------------------

        const emailStatusDot =
            document.getElementById(
                'emailStatusDot'
            );


        const emailStatusText =
            document.getElementById(
                'emailStatusText'
            );


        if (emailStatusDot)
            emailStatusDot.className =
                'status-dot pending';


        if (emailStatusText)
            emailStatusText.textContent =
                'Estado do envio: pendente';


        const confirmBtn =
            document.getElementById(
                'confirmDataBtn'
            );


        if (confirmBtn) {

            confirmBtn.disabled = false;

            confirmBtn.textContent =
                'Confirmar y Enviar Datos';

            confirmBtn.style.backgroundColor =
                '';
        }


        this.renderOrderSummary();


        modal.style.display = 'block';


        console.log(
            "🧾 Checkout abierto."
        );
    }


    // ========================================================
    // 18. ORDER SUMMARY
    // ========================================================

    renderOrderSummary() {

        const itemsDiv =
            document.getElementById(
                'orderItems'
            );


        if (!itemsDiv) {

            console.warn(
                "⚠️ #orderItems no existe."
            );

            return;
        }


        const subtotal =
            this.getSubtotal();


        const taxes =
            this.getTaxes();


        const total =
            this.getTotal();


        let html = '';


        this.items.forEach(item => {

            html += `

                <div class="summary-line">

                    <span>
                        ${item.qty}x ${item.name}
                    </span>

                    <span>
                        R$ ${(parseFloat(item.price) *
                            item.qty)
                            .toFixed(2)
                            .replace('.', ',')}
                    </span>

                </div>
       