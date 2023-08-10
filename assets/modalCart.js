class Cart {
    constructor() {
        this.formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 2
        });
    }

    async fetchAPI(api, formData) {
        const response = await fetch(`/cart/${api}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        return await response.json();
    }

    addItem(formData) {
        return this.fetchAPI('add.js', formData);
    }

    changeItem(formData) {
        return this.fetchAPI('change.js', formData);
    }

    async getItems() {
        const response =  await fetch(`/cart.js`);
        return response.json();
    }

    async getProduct(handle) {
        const response =  await fetch(`/products/${handle}.js`);
        return response.json();
    }

    renderCartItems(cart) {
        const cartSubTotal = document.querySelector(".subtotal__price");
        cartSubTotal.innerHTML = this.formatter.format((cart.total_price) / 100);
        
        const numberOfItemsInTheCartContainer = document.getElementById("number-of-items-of-the-cart");
        numberOfItemsInTheCartContainer.textContent = cart.item_count + `${cart.item_count > 1 ? ' items' : ' item'}`;

        const headerCartCount = document.getElementById("header-cart-count");
        headerCartCount.textContent = cart.item_count;
        
        const ajaxCartFooterMessage = document.querySelector('.footer__free-shipping-message');


        if (cart.total_price > 1699) {
            ajaxCartFooterMessage.style.display = 'block';
            ajaxCartFooterMessage.textContent = "YOU'RE QUALIFIED FOR FREE SHIPPING"
        } else {
            ajaxCartFooterMessage.style.display = 'block';
            ajaxCartFooterMessage.textContent = "ADD ONE MORE BAG FOR FREE SHIPPING"
        }

        if (cart.total_price == 0) {
            ajaxCartFooterMessage.style.display = 'block';
            const a = document.createElement("a");
            a.href = "/products/cat-litter-healthy-cat-formula";
            a.textContent = "ADD A SUBSCRIPTION FOR FREE SHIPPING";
            a.style.color = "#037847";
            ajaxCartFooterMessage.textContent = "";
            ajaxCartFooterMessage.append(a);
        }
        
        const fragment = document.createDocumentFragment();

        cart.items.forEach((product, index) => {
            const isSubscription = Boolean(product.properties?._interval);
            const variantId = product.variant_id

            const div = document.createElement("div");
            div.classList.add("ajax-cart__product");

            let template = `
                <div class="product__image-wrapper">
                    <img class="product__image" src="${product.featured_image.url?.replace('.png', '_240x.png')}" alt="" />
                </div>
            `

            if (product.product_type == 'Cat Litter' && !isSubscription) {
                template += `
                    <div class="product__details-wrapper">
                        <div class="product__details">
                            <span>One time purchase</span>
                            <h5>${product.product_title}</h5>
                            
                            <div class="product__variant-changer">
                                <button data-action="decrease" onclick="modalCart.changeWeight('decrease', '${product.variant_title}', ${Number(index) + 1}, '${product.handle}')">
                                    <img src="${cartMinusIcon}" alt="" />
                                </button>
                                <input value="${parseInt(product.variant_title)}lbs" type="text" disabled />
                                <button onclick="modalCart.changeWeight('increase', '${product.variant_title}', ${Number(index) + 1}, '${product.handle}')">
                                    <img src="${cartPlusIcon}" alt="" />
                                </button>
                            </div>
                        </div>

                        <div class="product__actions">
                            <img class="actions__remove" onclick="modalCart.deleteItem(${Number(index) + 1})" src="${cartTrashIcon}" alt="" />
                            <div class="actions__price">
                                ${this.formatter.format((product.price) / 100)}
                            </div>
                        </div>
                    </div>
                `
            }

            if (product.product_type == 'Cat Litter' && isSubscription) {
                div.classList.add("ajax-cart__product--subscription");

                template += `
                    <div class="product__details-wrapper">
                        <div class="product__details">
                            <span>Subscription</span>
                            <h5>${product.product_title.replace(" 5.00% Off Auto renew", "")}</h5>

                            <div class="product__prices">
                                <div>
                                    <span>${parseInt(product.variant_title)}lb</span>
                                    <span>${this.showInterval(product.properties._interval)}</span>
                                </div>
                                <div>
                                    <span>${this.formatter.format((product.price) / 100)}</span>
                                    <span>${this.showMonthlyPrice(product.properties._interval, product.price)}</span>
                                </div>
                            </div>
                        </div>

                        <div class="product__actions">
                            <img class="actions__remove" onclick="modalCart.deleteItem(${Number(index) + 1})" src="${cartTrashIcon}" alt="" />
                            <div class="actions__edit" onclick="modalCart.editSubscription('${product.variant_title}', '${product.properties._interval}', '${Number(index) + 1}', '${product.handle}')">
                                <img src="${cartEditIcon}" alt="" />
                                <span>Edit</span>
                            </div>
                        </div>
                    </div>
                `
            }

            if (product.product_type != 'Cat Litter') {
                template += `
                    <div class="product__details-wrapper">
                        <div class="product__details">
                            <span>One time purchase</span>
                            <h5>${product.product_title}</h5>
                            
                            <div class="product__variant-changer">
                                <button
                                    data-action="decrease"
                                    data-line="${index}"
                                    data-qty="${product.quantity}"
                                    onclick="modalCart.changeQty(this)"
                                >
                                    <img src="${cartMinusIcon}" alt="" />
                                </button>
                                <input value="${product.quantity}" type="text" disabled />
                                <button
                                    data-action="increase"
                                    data-line="${index}"
                                    data-qty="${product.quantity}"
                                    onclick="modalCart.changeQty(this)"
                                >
                                    <img src="${cartPlusIcon}" alt="" />
                                </button>
                            </div>
                        </div>

                        <div class="product__actions">
                            <img class="actions__remove" onclick="modalCart.deleteItem(${Number(index) + 1})" src="${cartTrashIcon}" alt="" />
                            <div class="actions__price">
                                ${this.formatter.format((product.price) / 100)}
                            </div>
                        </div>
                    </div>
                `
            }

            div.innerHTML = template;
            fragment.append(div);
        })

        const cartProductsContainer = document.querySelector(".ajax-cart__products");
        cartProductsContainer.innerHTML = "";
        cartProductsContainer.prepend(fragment);
    }

    async changeQty(btn) {
        const action = btn.dataset.action;
        const line = parseInt(btn.dataset.line);
        let qty = parseInt(btn.dataset.qty);
 
        if (action == "increase") {
            qty++;
        } else {
            qty--;
        }

        const formData = {
            line: line + 1,
            quantity: qty
        }

        this.changeItem(formData).then(() => this.updateCart());
    }

    async changeWeight(action, weight, line, handle) {
        const selectedProduct = await this.getProduct(handle);

        let newTitle = ""
        let isSubscription = false;

        if (action == "increase") {
            newTitle = parseInt(weight) + 10 + "lbs"
        } else {
            newTitle = parseInt(weight) - 10 + "lbs"
        }

        if (weight.includes("one-time-purchase")) {
            newTitle += ' one-time-purchase';
        }

        const variants = selectedProduct.variants;
        let variantIndex = variants.findIndex(({title}) => title == newTitle);            
        let variantId = variants[variantIndex].id;

        const formData = {
            items: [{
                id: variantId,
                quantity: 1
            }]
        }

        this.changeItem({line: line, quantity: 0}).then(() => {
            this.addItem(formData).then((res) => this.updateCart());
        })
    }

    addUpsell(variantId) { 

        if(variantId) {
            const formData = {
                items: [{
                    id: variantId,
                    quantity: 1
                }]
            }
    
            this.addItem(formData).then((res) => this.updateCart());
        }

    }

    editSubscription(weight, interval, line, handle) {
        if (!window.location.pathname.includes('products')) {
            const data = {
                weight, 
                interval, 
                line
            }
            localStorage.setItem('subProduct', JSON.stringify(data));
            window.location.href = `/products/${handle.slice(0, -2)}`;
        } else {
            productForm.showSelectedSubscription(weight, interval, line);
        }

    }

    showInterval(num = 0) {
        const interval = {
            month_0: "",
            month_1: "Every Month",
            month_2: "Every 2 Months",
            month_4: "Every 4 Months",
        }

        return interval[`month_${num}`];
    }

    showMonthlyPrice(freq, price) {
        return this.formatter.format((price / freq) / 100) + "/month";
    }

    async updateCart() {
        const cartData = await this.getItems();
        await this.renderCartItems(cartData);
    }

    deleteItem(line) {
        this.changeItem({line: line,quantity: 0}).then(res => this.renderCartItems(res))
    }

    async toggleCart() {
        const cartWrapper = document.querySelector(".ajax-cart__wrapper");

        await this.updateCart();
        cartWrapper.classList.toggle("open");

        if (window.matchMedia('(min-width: 601px)').matches) {
            if (cartWrapper.classList.contains('open')) {
                document.body.setAttribute('style', 'overflow: hidden');
            } else {
                document.body.removeAttribute('style');
            }
        }
    }
}

const modalCart = new Cart();