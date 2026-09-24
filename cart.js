// ============================================================
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
            "Revisa que el script de EmailJS esté cargado antes de cart.js."
        );
    }

})();


// ============================================================
// 2. SHOPPING CART
// ============================================================

class ShoppingCart {

    constructor() {

        // ====================================================
        // IMPORTANTE
        // ====================================================
        // Esta es la clave ORIGINAL del carrito.
        // NO usar findCartKey().
        // NO cambiar a yiCart, cart, shoppingCart, etc.
        // ====================================================

        this.STORAGE_KEY = 'yiSellCart';

        this.items = this.loadCart();

        this.TAX_RATE = 0.00;


        // ====================================================
        // CONFIGURACIÓN EMAILJS
        // ====================================================

 this.EMAILJS_SERVICE_ID = "service_56lcpfp un";

        this.EMAILJS_TEMPLATE_ID = "template_7eo6ywr";


        // Estado del pedido

        this.orderConfirmed = false;


        console.log(
            `🛒 Carrito iniciado | Storage: "${this.STORAGE_KEY}" | Items: ${this.items.length}`
        );


        this.debugCart("CONSTRUCTOR");

        this.init();
    }


    // ========================================================
    // 3. CARGAR CARRITO
    // ========================================================

    loadCart() {

        try {

            const stored =
                localStorage.getItem(
                    this.STORAGE_KEY
                );


            if (!stored) {

                console.log(
                    "🛒 No existe carrito guardado. Se inicia vacío."
                );

                return [];
            }


            const parsed =
                JSON.parse(stored);


            if (!Array.isArray(parsed)) {

                console.error(
                    "❌ yiSellCart no contiene un array."
                );

                return [];
            }


            // Normalizamos los datos sin cambiar
            // la estructura del carrito original.

            return parsed.map(item => ({

                id: item.id,

                name: item.name || '',

                price:
                    Number.parseFloat(item.price) || 0,

                qty:
                    Math.max(
                        1,
                        Number.parseInt(item.qty, 10) || 1
                    )

            }));

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

        console.group(
            `🛒 DEBUG CARRITO — ${action}`
        );


        console.log(
            "Storage Key:",
            this.STORAGE_KEY
        );


        console.log(
            "Items:",
            this.items
        );


        console.log(
            "Cantidad de líneas:",
            this.items.length
        );


        console.log(
            "Cantidad total:",
            this.items.reduce(
                (sum, item) =>
                    sum + (Number(item.qty) || 0),
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
            localStorage.getItem(
                this.STORAGE_KEY
            )
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


        // ====================================================
        // ADD TO CART
        // ====================================================

        document.addEventListener(
            'click',
            (e) => {

                const btn =
                    e.target.closest(
                        '.add-to-cart'
                    );


                if (!btn) return;


                e.preventDefault();


                const product =
                    btn.closest(
                        '.product'
                    );


                if (!product) {

                    console.error(
                        "❌ .add-to-cart no está dentro de .product."
                    );

                    return;
                }


                const item = {

                    id:
                        product.dataset.id,

                    name:
                        product.dataset.name,

                    price:
                        Number.parseFloat(
                            product.dataset.price
                        ) || 0

                };


                if (!item.id) {

                    console.error(
                        "❌ El producto no tiene data-id.",
                        product
                    );

                    return;
                }


                console.log(
                    "➕ Agregando producto:",
                    item
                );


                this.add(item);


                const originalText =
                    btn.innerText ||
                    'Add to Cart';


                btn.innerText =
                    'Added ✓';


                btn.disabled = true;


                setTimeout(
                    () => {

                        btn.innerText =
                            originalText;

                        btn.disabled = false;

                    },
                    1500
                );

            }
        );


        // ====================================================
        // CHECKOUT
        // ====================================================

        const checkoutBtn =
            document.getElementById(
                'checkout-btn'
            );


        if (
            checkoutBtn &&
            !checkoutBtn.dataset.bound
        ) {

            checkoutBtn.dataset.bound =
                'true';


            checkoutBtn.addEventListener(
                'click',
                () => this.openCheckout()
            );
        }


        // ====================================================
        // CLOSE MODAL
        // ====================================================

        const closeBtn =
            document.getElementById(
                'closeModal'
            ) ||
            document.querySelector(
                '.close'
            );


        if (
            closeBtn &&
            !closeBtn.dataset.bound
        ) {

            closeBtn.dataset.bound =
                'true';


            closeBtn.addEventListener(
                'click',
                () => this.closeCheckout()
            );
        }


        window.addEventListener(
            'click',
            (e) => {

                if (
                    e.target.id ===
                    'checkoutModal'
                ) {

                    this.closeCheckout();
                }

            }
        );


        // ====================================================
        // CONFIRMAR PEDIDO / EMAILJS
        // ====================================================

        const confirmBtn =
            document.getElementById(
                'confirmDataBtn'
            );


        if (
            confirmBtn &&
            !confirmBtn.dataset.bound
        ) {

            confirmBtn.dataset.bound =
                'true';


            confirmBtn.addEventListener(
                'click',
                () =>
                    this.handleOrderConfirmation()
            );
        }


        // ====================================================
        // INFINITEPAY
        // ====================================================

        const payInfiniteBtn =
            document.getElementById(
                'payInfinitePay'
            );


        if (
            payInfiniteBtn &&
            !payInfiniteBtn.dataset.bound
        ) {

            payInfiniteBtn.dataset.bound =
                'true';


            payInfiniteBtn.addEventListener(
                'click',
                () =>
                    this.processInfinitePay()
            );
        }


        // ====================================================
        // STRIPE
        // ====================================================

        const payStripeBtn =
            document.getElementById(
                'payStripe'
            );


        if (
            payStripeBtn &&
            !payStripeBtn.dataset.bound
        ) {

            payStripeBtn.dataset.bound =
                'true';


            payStripeBtn.addEventListener(
                'click',
                () =>
                    this.processStripe()
            );
        }


        // ====================================================
        // PIX
        // ====================================================

        const copyPixBtn =
            document.getElementById(
                'copyPixBtn'
            );


        if (
            copyPixBtn &&
            !copyPixBtn.dataset.bound
        ) {

            copyPixBtn.dataset.bound =
                'true';


            copyPixBtn.addEventListener(
                'click',
                () =>
                    this.copyToClipboard(
                        '41a2bc9e-5854-43ab-bc8a-b9f13addd96d',
                        copyPixBtn
                    )
            );
        }


        // ====================================================
        // ETH
        // ====================================================

        const copyEthBtn =
            document.getElementById(
                'copyEthBtn'
            );


        if (
            copyEthBtn &&
            !copyEthBtn.dataset.bound
        ) {

            copyEthBtn.dataset.bound =
                'true';


            copyEthBtn.addEventListener(
                'click',
                () =>
                    this.copyToClipboard(
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
                JSON.stringify(
                    this.items
                )
            );


            this.updateCartCount();


            console.log(
                `💾 Carrito guardado en "${this.STORAGE_KEY}".`
            );

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

            existing.qty =
                (Number(existing.qty) || 0) +
                1;


            console.log(
                `🔄 Producto existente. Nueva cantidad: ${existing.qty}`
            );

        } else {

            this.items.push({

                id:
                    item.id,

                name:
                    item.name || '',

                price:
                    Number.parseFloat(
                        item.price
                    ) || 0,

                qty: 1

            });


            console.log(
                "🆕 Producto nuevo agregado."
            );
        }


        this.save();

        this.render();

        this.debugCart(
            "ADD DESPUÉS"
        );
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
                "❌ Producto no encontrado:",
                id
            );

            return;
        }


        item.qty =
            Math.max(
                1,
                Number.parseInt(
                    qty,
                    10
                ) || 1
            );


        this.save();

        this.render();

        this.debugCart(
            "UPDATE QTY"
        );
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


        console.log(
            `🗑️ Líneas: ${before} → ${this.items.length}`
        );


        this.save();

        this.render();

        this.debugCart(
            "REMOVE"
        );
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

        this.debugCart(
            "CLEAR CART"
        );
    }


    // ========================================================
    // 12. SUBTOTAL
    // ========================================================

    getSubtotal() {

        return this.items.reduce(
            (sum, item) => {

                const price =
                    Number.parseFloat(
                        item.price
                    ) || 0;


                const qty =
                    Number.parseInt(
                        item.qty,
                        10
                    ) || 0;


                return sum +
                    (
                        price *
                        qty
                    );

            },
            0
        );
    }


    // ========================================================
    // 13. TAXES
    // ========================================================

    getTaxes() {

        return (
            this.getSubtotal() *
            this.TAX_RATE
        );
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
                    sum +
                    (
                        Number(
                            item.qty
                        ) || 0
                    ),
                0
            );


        const el =
            document.querySelector(
                '#cart-count'
            );


        if (el) {

            el.innerText =
                count;
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


        // ====================================================
        // CARRITO VACÍO
        // ====================================================

        if (
            this.items.length === 0
        ) {

            if (emptyMsg)
                emptyMsg.style.display =
                    'block';


            if (table)
                table.style.display =
                    'none';


            if (checkoutBtn)
                checkoutBtn.disabled =
                    true;


            if (totalEl)
                totalEl.textContent =
                    'Total: R$ 0,00';


            return;
        }


        // ====================================================
        // CARRITO CON PRODUCTOS
        // ====================================================

        if (emptyMsg)
            emptyMsg.style.display =
                'none';


        if (table)
            table.style.display =
                'table';


        if (checkoutBtn)
            checkoutBtn.disabled =
                false;


        this.items.forEach(
            item => {

                const price =
                    Number.parseFloat(
                        item.price
                    ) || 0;


                const qty =
                    Number.parseInt(
                        item.qty,
                        10
                    ) || 1;


                const row =
                    document.createElement(
                        'tr'
                    );


                const safeId =
                    String(
                        item.id
                    ).replace(
                        /'/g,
                        "\\'"
                    );


                row.innerHTML = `

                    <td>
                        ${item.name}
                    </td>

                    <td>
                        R$ ${price
                            .toFixed(2)
                            .replace(
                                '.',
                                ','
                            )}
                    </td>

                    <td>

                        <input
                            type="number"
                            value="${qty}"
                            min="1"
                            onchange="cart.updateQty('${safeId}', this.value)"
                        >

                    </td>

                    <td>
                        R$ ${(price * qty)
                            .toFixed(2)
                            .replace(
                                '.',
                                ','
                            )}
                    </td>

                    <td>

                        <button
                            class="btn-remove"
                            onclick="cart.remove('${safeId}')"
                        >
                            Remover
                        </button>

                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );


        if (totalEl) {

            totalEl.textContent =
                `Total: R$ ${this
                    .getSubtotal()
                    .toFixed(2)
                    .replace(
                        '.',
                        ','
                    )}`;
        }


        console.log(
            "🎨 Render carrito completado."
        );
    }


    // ========================================================
    // 17. OPEN CHECKOUT
    // ========================================================

    openCheckout() {

        if (
            this.items.length === 0
        ) {

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


        this.orderConfirmed =
            false;


        const step1 =
            document.getElementById(
                'checkoutStep1'
            );


        const step2 =
            document.getElementById(
                'checkoutStep2'
            );


        if (step1)
            step1.style.display =
                'block';


        if (step2)
            step2.style.display =
                'none';


        const emailStatusDot =
            document.getElementById(
                'emailStatusDot'
            );


        const emailStatusText =
            document.getElementById(
                'emailStatusText'
            );


        if (emailStatusDot) {

            emailStatusDot.className =
                'status-dot pending';
        }


        if (emailStatusText) {

            emailStatusText.textContent =
                'Estado del envío: pendiente';
        }


        const confirmBtn =
            document.getElementById(
                'confirmDataBtn'
            );


        if (confirmBtn) {

            confirmBtn.disabled =
                false;

            confirmBtn.textContent =
                'Confirmar y Enviar Datos';
        }


        this.renderOrderSummary();


        modal.style.display =
            'block';


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


        let html = '';


        this.items.forEach(
            item => {

                const price =
                    Number.parseFloat(
                        item.price
                    ) || 0;


                const qty =
                    Number.parseInt(
                        item.qty,
                        10
                    ) || 1;


                html += `

                    <div class="summary-line">

                        <span>
                            ${qty}x ${item.name}
                        </span>

                        <span>
                            R$ ${(price * qty)
                                .toFixed(2)
                                .replace(
                                    '.',
                                    ','
                                )}
                        </span>

                    </div>

                `;
            }
        );


        itemsDiv.innerHTML =
            html;


        const subtotalEl =
            document.getElementById(
                'subtotal'
            );


        const taxesEl =
            document.getElementById(
                'taxes'
            );


        const totalEl =
            document.getElementById(
                'finalTotal'
            );


        if (subtotalEl) {

            subtotalEl.textContent =
                `R$ ${this
                    .getSubtotal()
                    .toFixed(2)
                    .replace(
                        '.',
                        ','
                    )}`;
        }


        if (taxesEl) {

            taxesEl.textContent =
                `R$ ${this
                    .getTaxes()
                    .toFixed(2)
                    .replace(
                        '.',
                        ','
                    )}`;
        }


        if (totalEl) {

            totalEl.textContent =
                `R$ ${this
                    .getTotal()
                    .toFixed(2)
                    .replace(
                        '.',
                        ','
                    )}`;
        }
    }


    // ========================================================
    // 19. FORM DATA
    // ========================================================

    getFormData() {

        return {

            name:
                document
                    .getElementById(
                        'customerName'
                    )
                    ?.value
                    .trim() || '',


            telefono:
                document
                    .getElementById(
                        'phone'
                    )
                    ?.value
                    .trim() || '',


            email:
                document
                    .getElementById(
                        'email'
                    )
                    ?.value
                    .trim() || '',


            items:
                this.items.map(
                    item => ({

                        id:
                            item.id,

                        name:
                            item.name,

                        price:
                            Number.parseFloat(
                                item.price
                            ) || 0,

                        qty:
                            Number.parseInt(
                                item.qty,
                                10
                            ) || 1

                    })
                ),


            subtotal:
                this.getSubtotal(),


            taxes:
                this.getTaxes(),


            total:
                this.getTotal()
        };
    }


    // ========================================================
    // 20. VALIDACIÓN
    // ========================================================

    validateForm() {

        const name =
            document
                .getElementById(
                    'customerName'
                )
                ?.value
                .trim() || '';


        const phone =
            document
                .getElementById(
                    'phone'
                )
                ?.value
                .trim() || '';


        const email =
            document
                .getElementById(
                    'email'
                )
                ?.value
                .trim() || '';


        let isValid =
            true;


        document
            .querySelectorAll(
                '.error-msg'
            )
            .forEach(
                el => {

                    el.style.display =
                        'none';

                    el.textContent =
                        '';

                }
            );


        if (
            name.length < 3
        ) {

            const err =
                document.getElementById(
                    'nameError'
                );


            if (err) {

                err.textContent =
                    'El nombre debe tener al menos 3 caracteres.';

                err.style.display =
                    'block';
            }


            isValid =
                false;
        }


        if (
            phone
                .replace(
                    /\D/g,
                    ''
                )
                .length < 8
        ) {

            const err =
                document.getElementById(
                    'phoneError'
                );


            if (err) {

                err.textContent =
                    'Ingresa un teléfono válido (mínimo 8 dígitos).';

                err.style.display =
                    'block';
            }


            isValid =
                false;
        }


        if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
                .test(email)
        ) {

            const err =
                document.getElementById(
                    'emailError'
                );


            if (err) {

                err.textContent =
                    'Ingresa un correo electrónico válido.';

                err.style.display =
                    'block';
            }


            isValid =
                false;
        }


        return isValid;
    }


    // ========================================================
    // 21. ENVIAR A EMAILJS
    // ========================================================

    async sendCheckoutEmail(
        data
    ) {

        if (
            typeof emailjs ===
            'undefined'
        ) {

            alert(
                '❌ EmailJS no está cargado. ' +
                'Revisa el <script> de EmailJS antes de cart.js.'
            );

            return false;
        }


        if (
            !this.EMAILJS_SERVICE_ID ||
            !this.EMAILJS_TEMPLATE_ID
        ) {

            alert(
                '❌ Falta configurar Service ID o Template ID de EmailJS.'
            );

            return false;
        }


        // ====================================================
        // IMPORTANTE
        // ====================================================
        // Tu plantilla EmailJS utiliza EXACTAMENTE:
        //
        // {{nombre}}
        // {{telefono}}
        // {{email}}
        // {{total}}
        //
        // Por eso enviamos exactamente esos cuatro campos.
        // ====================================================

        const templateParams = {

            nombre:
                data.name,

            telefono:
                data.telefono,

            email:
                data.email,

            total:
                `R$ ${Number(
                    data.total
                )
                    .toFixed(2)
                    .replace(
                        '.',
                        ','
                    )}`

        };


        console.log(
            "📤 EmailJS Service ID:",
            this.EMAILJS_SERVICE_ID
        );


        console.log(
            "📤 EmailJS Template ID:",
            this.EMAILJS_TEMPLATE_ID
        );


        console.log(
            "📤 Datos enviados a EmailJS:",
            templateParams
        );


        try {

            const response =
                await emailjs.send(

                    this.EMAILJS_SERVICE_ID,

                    this.EMAILJS_TEMPLATE_ID,

                    templateParams

                );


            console.log(
                "✅ EmailJS respondió correctamente:",
                response
            );


            return true;


        } catch (error) {

            console.error(
                "❌ ERROR EMAILJS:",
                error
            );


            const errorText =
                error?.text ||
                error?.message ||
                'Error desconocido de EmailJS.';


            if (
                String(
                    errorText
                )
                    .toLowerCase()
                    .includes(
                        'service id not found'
                    )
            ) {

                alert(
                    '❌ EmailJS rechazó el Service ID.\n\n' +

                    'Service ID utilizado:\n' +

                    this.EMAILJS_SERVICE_ID +

                    '\n\n' +

                    'El carrito NO fue eliminado.\n' +

                    'Verifica en EmailJS > Email Services ' +

                    'que este Service ID exista exactamente.'
                );

            } else {

                alert(
                    '❌ Error al enviar a EmailJS:\n\n' +
                    errorText
                );
            }


            return false;
        }
    }


    // ========================================================
    // 22. CONFIRMAR PEDIDO
    // ========================================================

    async handleOrderConfirmation() {

        if (
            !this.validateForm()
        ) {

            alert(
                '⚠️ Corrige los datos marcados en rojo antes de continuar.'
            );

            return;
        }


        if (
            this.items.length === 0
        ) {

            alert(
                '⚠️ El carrito está vacío.'
            );

            return;
        }


        const btn =
            document.getElementById(
                'confirmDataBtn'
            );


        if (
            !btn ||
            btn.disabled
        ) {

            return;
        }


        const originalText =
            btn.textContent;


        const data =
            this.getFormData();


        btn.disabled =
            true;


        btn.textContent =
            '⏳ Enviando datos...';


        console.log(
            "📦 Pedido preparado:",
            data
        );


        const emailSent =
            await this.sendCheckoutEmail(
                data
            );


        // ====================================================
        // SI EMAILJS FALLA
        // ====================================================
        // NO vaciar carrito.
        // NO avanzar al pago.
        // NO destruir pedido.
        // ====================================================

        if (!emailSent) {

            btn.disabled =
                false;

            btn.textContent =
                originalText;

            return;
        }


        // ====================================================
        // EMAIL ENVIADO CORRECTAMENTE
        // ====================================================

        const step1 =
            document.getElementById(
                'checkoutStep1'
            );


        const step2 =
            document.getElementById(
                'checkoutStep2'
            );


        if (step1)
            step1.style.display =
                'none';


        if (step2)
            step2.style.display =
                'block';


        const dot =
            document.getElementById(
                'emailStatusDot'
            );


        const txt =
            document.getElementById(
                'emailStatusText'
            );


        if (dot) {

            dot.className =
                'status-dot ok';
        }


        if (txt) {

            txt.textContent =
                '✅ Estado: Datos recibidos correctamente';
        }


        this.orderConfirmed =
            true;


        // Guardamos el último pedido
        // solamente después del envío exitoso.

        localStorage.setItem(
            'lastOrder',
            JSON.stringify(
                data
            )
        );


        this.renderOrderSummary();


        console.log(
            "✅ Pedido confirmado y registrado."
        );
    }


    // ========================================================
    // 23. INFINITEPAY
    // ========================================================

    processInfinitePay() {

        if (
            !this.orderConfirmed
        ) {

            alert(
                '⚠️ Primero haz clic en "Confirmar y Enviar Datos".'
            );

            return;
        }


        const btn =
            document.getElementById(
                'payInfinitePay'
            );


        if (
            !btn ||
            btn.disabled
        ) {

            return;
        }


        const data =
            this.getFormData();


        const valor =
            Number(
                data.total
            )
                .toFixed(2)
                .replace(
                    '.',
                    ','
                );


        localStorage.setItem(
            'lastOrder',
            JSON.stringify(
                data
            )
        );


        btn.disabled =
            true;


        btn.textContent =
            'Redirigiendo...';


        this.clearCart();


        window.location.href =
            `https://link.infinitepay.io/yakelin-yisel/${valor}`;
    }


    // ========================================================
    // 24. STRIPE
    // ========================================================

    async processStripe() {

        if (
            !this.orderConfirmed
        ) {

            alert(
                '⚠️ Primero confirma y envía los datos del pedido.'
            );

            return;
        }


        const btn =
            document.getElementById(
                'payStripe'
            );


        if (
            !btn ||
            btn.disabled
        ) {

            return;
        }


        btn.disabled =
            true;


        btn.textContent =
            'Processando...';


        try {

            const data =
                this.getFormData();


            const response =
                await fetch(
                    'https://yi-sell.onrender.com/create-checkout-session',
                    {

                        method:
                            'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                items:
                                    data.items.map(
                                        item => ({

                                            name:
                                                item.name,

                                            price:
                                                Number.parseFloat(
                                                    item.price
                                                ) || 0,

                                            qty:
                                                Number.parseInt(
                                                    item.qty,
                                                    10
                                                ) || 1

                                        })
                                    ),


                                customer: {

                                    name:
                                        data.name,

                                    email:
                                        data.email

                                },


                                metadata: {

                                    phone:
                                        data.telefono

                                }

                            })

                    }
                );


            if (
                !response.ok
            ) {

                let errorMessage =
                    'Erro no servidor';


                try {

                    const errorData =
                        await response.json();


                    errorMessage =
                        errorData.error ||
                        errorMessage;

                } catch (_) {}


                throw new Error(
                    errorMessage
                );
            }


            const session =
                await response.json();


            localStorage.setItem(
                'lastOrder',
                JSON.stringify(
                    data
                )
            );


            this.clearCart();


            window.location.href =
                session.url;


        } catch (error) {

            console.error(
                '❌ Erro Stripe:',
                error
            );


            alert(
                'Erro ao processar pagamento: ' +
                error.message
            );


            btn.disabled =
                false;


            btn.textContent =
                'Pagar com Cartão';
        }
    }


    // ========================================================
    // 25. COPY TO CLIPBOARD
    // ========================================================

    copyToClipboard(
        text,
        btn
    ) {

        if (!btn)
            return;


        const originalText =
            btn.textContent;


        const success =
            () => {

                btn.textContent =
                    '✅ ¡COPIADO!';


                setTimeout(
                    () => {

                        btn.textContent =
                            originalText;

                    },
                    2000
                );
            };


        const fallback =
            () => {

                const textarea =
                    document.createElement(
                        'textarea'
                    );


                textarea.value =
                    text;


                textarea.style.position =
                    'fixed';


                textarea.style.left =
                    '-9999px';


                document.body.appendChild(
                    textarea
                );


                textarea.select();


                try {

                    document.execCommand(
                        'copy'
                    );


                    success();

                } catch (error) {

                    console.error(
                        '❌ Error copiando:',
                        error
                    );


                    btn.textContent =
                        '❌ Error al copiar';
                }


                document.body.removeChild(
                    textarea
                );
            };


        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {

            navigator.clipboard
                .writeText(text)
                .then(success)
                .catch(fallback);

        } else {

            fallback();
        }
    }


    // ========================================================
    // 26. CLOSE CHECKOUT
    // ========================================================

    closeCheckout() {

        const modal =
            document.getElementById(
                'checkoutModal'
            );


        if (modal) {

            modal.style.display =
                'none';
        }
    }

}


// ============================================================
// 27. INICIALIZACIÓN GLOBAL
// ============================================================

const cart =
    new ShoppingCart();