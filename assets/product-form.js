class ProductForm extends Cart {
    constructor(subscriptionOptions) {
        super(product);
        this.state = {
            numberOfCatsSelected: 1,
            productWeight: 10,
            rechargeInterval: 0,
            purchaseType: "one-time-purchase",
            selectedVariantId: selected_variant.id,
            allVariants: product.variants,
            selectedBeingEditingVariantLine: null,
            sellingPlans: product.selling_plan_groups[0].selling_plans
        }

        this.subscribeAndSaveFormBlock = document.querySelector(".template-new #subscribe-and-save-form-block");
        this.numberOfCatsCheckboxes = document.querySelectorAll(".template-new input[name='number-of-cats']");
        this.numberOfCatsManualCounters = document.querySelectorAll(".template-new button[name='number-of-cats-manual-counter']");
        this.productPriceBlock = document.querySelector(".template-new .product__price");
        this.oneTimePurchaseProductWeightValue = document.querySelectorAll(".template-new .product__weight");
        this.oneTimePurchaseProductWeightCounters = document.querySelectorAll(".template-new button[name='product-weight-counter']");
        this.subscriptionOptions = subscriptionOptions;
    }

    init() {
        const savedSubProduct = JSON.parse(localStorage.getItem('subProduct'));
        
        if (savedSubProduct) {
            const {weight, interval, line} = savedSubProduct;
            this.showSelectedSubscription(weight, interval, line);
            localStorage.removeItem('subProduct');
        }

        // adding listener to toggle between subscribe and onetime purchase options
        const subscriptionSwitcher = document.querySelector(".template-new .subscription-switcher");
        const catSelectorWrapper = document.querySelector(".template-new .cat-counter");

        subscriptionSwitcher.addEventListener('click', () => {
            if (this.state.purchaseType == "one-time-purchase") {
                // if subsribe and save is chosen
                this.state.purchaseType = "subscribe-and-save";
                subscriptionSwitcher.classList.add("active");
                this.subscribeAndSaveFormBlock.removeAttribute('style');
                catSelectorWrapper.style.display = "flex";
                
                const productPageWrapper = document.querySelector(".product-wrap.template-new")
                productPageWrapper.classList.add("sub-save");
                
                const quantityCounter = document.querySelector(".template-new .quantity__counter")
                quantityCounter.style.display = "none"

                const infoMsg = document.querySelector(".template-new .info-cancelation") 
                infoMsg.textContent = "Skip or cancel a subscription anytime, and we'll remind you before each shipment, so orders are worry-free!"
                
                this.renderSubAndSaveOptions(2);

                let selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs");
                this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id;

                const catCounterCount = document.querySelector(".template-new .cat-counter__count");
                let text = this.state.numberOfCatsSelected == 1 ? " Cat" : " Cats";
                catCounterCount.textContent = this.state.numberOfCatsSelected + text;

                const catCounters = document.querySelectorAll(".template-new button[name=cat-counter__action]");
                catCounters[0].removeAttribute("disabled");
                catCounters[1].removeAttribute("disabled");
                if (this.state.numberOfCatsSelected == 8) catCounters[1].setAttribute("disabled", "true");
                if (this.state.numberOfCatsSelected == 1) catCounters[0].setAttribute("disabled", "true");

                const miniFormQuantity = document.querySelector(".template-new .mini-form .quantity__counter");
                miniFormQuantity.style.display = "none";

            } else {
                // if one time purchase is chosen
                this.state.selectedBeingEditingVariantLine = null;
                this.state.purchaseType = "one-time-purchase";
                subscriptionSwitcher.classList.remove("active");
                this.subscribeAndSaveFormBlock.setAttribute('style', "display: none");
                catSelectorWrapper.style.display = "none";
                const productPageWrapper = document.querySelector(".product-wrap.template-new")
                productPageWrapper.classList.remove("sub-save");
                this.state.productWeight = this.state.numberOfCatsSelected * 10;

                const quantityCounter = document.querySelector(".template-new .quantity__counter")
                quantityCounter.style.display = "flex"

                const infoMsg = document.querySelector(".template-new .info-cancelation") 
                infoMsg.innerHTML = `<span style="text-decoration:underline;cursor:pointer" onclick="productForm.switchToSubscription()">Make this a subscription</span> and save <span class="subscriptionBenefit">18%</span> plus free shipping, skip or cancel anytime.`

                let selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == `${this.state.productWeight}lbs`);
                        
                this.productPriceBlock.innerHTML = `
                    ${this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100)}
                `

                if (this.state.productWeight == 10) this.addFreeShippingText(selectedVariantIndex);

                this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id;
                this.showSavingsValue("cat_" + this.state.numberOfCatsSelected, this.state.productWeight);
                const miniFormQuantity = document.querySelector(".template-new .mini-form .quantity__counter");
                miniFormQuantity.style.display = "flex";

                this.oneTimePurchaseProductWeightValue.forEach(productW => productW.textContent = (this.state.numberOfCatsSelected * 10) + 'lbs');
                this.state.productWeight = this.state.numberOfCatsSelected * 10;

                this.oneTimePurchaseProductWeightCounters.forEach(button => {
                    if (button.dataset.action == "increment") {
                        if (this.state.numberOfCatsSelected == 8) button.setAttribute('disabled', "true");
                        if (this.state.numberOfCatsSelected < 8) button.removeAttribute('disabled');
                    }

                    if (button.dataset.action == "decrement") {
                        if (this.state.numberOfCatsSelected == 1) button.setAttribute('disabled', "true");
                        if (this.state.numberOfCatsSelected > 1) button.removeAttribute('disabled');
                    }
                })
            }
        })

        // adding listeners to change number of cats by counter
        const catCounters = document.querySelectorAll(".template-new button[name=cat-counter__action]");
        catCounters.forEach(catCounter => {
            catCounter.onclick = ({target}) => {
                const { action } = target.dataset;

                if (action == 'increment') {
                    this.state.numberOfCatsSelected += 1;
                    
                    if (this.state.numberOfCatsSelected == 8) catCounter.setAttribute('disabled', "true");
                    if (this.state.numberOfCatsSelected > 1) catCounters[0].removeAttribute('disabled');
                }

                if (action == 'decrement') {
                    this.state.numberOfCatsSelected -= 1;

                    if (this.state.numberOfCatsSelected == 1) catCounter.setAttribute('disabled', "true");
                    if (this.state.numberOfCatsSelected < 8) catCounters[1].removeAttribute('disabled');
                }

                const catCounterCount = document.querySelector(".template-new .cat-counter__count");
                let text = this.state.numberOfCatsSelected == 1 ? " Cat" : " Cats";
                catCounterCount.textContent = this.state.numberOfCatsSelected + text;
                this.state.productWeight = this.state.numberOfCatsSelected * 10;
                this.renderSubAndSaveOptions(2);
            }
        })

        // adding listeners to change the product weight by counter
        this.oneTimePurchaseProductWeightCounters.forEach(counter => {
            counter.addEventListener('click', ({target}) => {
                const weightDecrementor1 = this.oneTimePurchaseProductWeightCounters[0];
                const weightIncrementor1 = this.oneTimePurchaseProductWeightCounters[1];
                const weightDecrementor2 = this.oneTimePurchaseProductWeightCounters[2];
                const weightIncrementor2 = this.oneTimePurchaseProductWeightCounters[3];
                const { action } = target.dataset;
                
                if (action === 'increment') {
                    this.state.productWeight += 10;
                    this.oneTimePurchaseProductWeightValue.forEach(productW => productW.textContent = this.state.productWeight + 'lbs')

                    if (this.state.productWeight > 10) {
                        weightDecrementor1.removeAttribute('disabled');
                        weightDecrementor2.removeAttribute('disabled');
                    }

                    if (this.state.productWeight + 10 > 80) {
                        weightIncrementor1.setAttribute('disabled', true);
                        weightIncrementor2.setAttribute('disabled', true);
                    }
                }

                if (action === 'decrement') {
                    if (this.state.productWeight - 10 === 0) return;
                    
                    this.state.productWeight -= 10;
                    this.oneTimePurchaseProductWeightValue.forEach(productW => productW.textContent = this.state.productWeight + 'lbs');

                    if (this.state.productWeight === 10) {
                        weightDecrementor1.setAttribute('disabled', true);
                        weightDecrementor2.setAttribute('disabled', true);
                    }

                    if (this.state.productWeight < 80) {
                        weightIncrementor1.removeAttribute('disabled');
                        weightIncrementor2.removeAttribute('disabled');
                    }
                }

                this.showSavingsValue("cat_" + this.state.productWeight / 10, this.state.productWeight);
                this.state.numberOfCatsSelected = this.state.productWeight / 10;
                let selectedVariantIndex = this.state.allVariants.findIndex(variant => 
                    variant.title == `${this.state.productWeight}lbs`
                );
                this.productPriceBlock.innerHTML = this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100)
                this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id;

                if (this.state.productWeight == 10) this.addFreeShippingText(selectedVariantIndex);
            })
        })

        const addToCartButton = document.querySelector(".template-new .add-to-cart-button");
        addToCartButton.addEventListener('click', () => this.addProductToCart());

        const productSelectorActiveItem = document.querySelector(".template-new .product-selector__active-item");
        const productSelectorItems = document.querySelector(".template-new .product-selector__items");

        productSelectorActiveItem.addEventListener("click", function () {
            productSelectorItems.classList.toggle("open");
        })

        subscriptionSwitcher.click();
    }

    async addProductToCart() {
        const cartItems = await this.getItems();

        if (this.state.purchaseType == "subscribe-and-save") {
            let canAdd = true;

            const filteredVariants = cartItems.items.filter((item) => item.id == this.state.selectedVariantId);
            filteredVariants.forEach(item => {
                if (item.properties._interval == this.state.rechargeInterval) {
                    canAdd = false;
                }
            })

            if (!canAdd) {
                this.toggleCart();
                return;
            }

            let sellingPlanId = "";
            this.state.sellingPlans.forEach(sellingPlan => {
                if (sellingPlan.name.includes(this.state.rechargeInterval)) {
                    sellingPlanId = sellingPlan.id;
                }
            });

            const formData = {
                id: this.state.selectedVariantId,
                quantity: 1,
                selling_plan: sellingPlanId,
                properties: {
                    _interval: this.state.rechargeInterval
                }
            }

            if (this.state.selectedBeingEditingVariantLine) {
                this.changeItem({line: Number(this.state.selectedBeingEditingVariantLine), quantity: 0})
                    .then(async () => {
                        this.state.selectedBeingEditingVariantLine = null;
                        this.addItem(formData).then((res) => this.toggleCart());
                        const addToCartText = document.querySelector(".template-new .add-to-cart-text");
                        addToCartText.textContent = "Add to cart";
                    });
            } else {
                this.addItem(formData).then((res) => this.toggleCart())
            }

        }
        
        if (this.state.purchaseType == "one-time-purchase") {
            const formData = {
                items: [{
                    id: this.state.selectedVariantId,
                    quantity: 1
                }]
            }

            const itemIndex = cartItems.items.findIndex((item) => item.id == this.state.selectedVariantId)
        
            if (itemIndex < 0) {
                this.addItem(formData).then((res) => this.toggleCart());
            } else {
                this.toggleCart();
            }
        }
    }

    changeSubAndSaveOption(interval, weight, index, price, cat) {
        this.state.rechargeInterval = interval;
        this.state.productWeight = weight;

        const selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs");
        this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id;

        const activeBox = document.querySelector(".template-new .product-selector__active-item");
        const activeElement = activeBox.querySelector(".template-new .product-selector__item");
        const clickedElement = document.querySelector(`.template-new #product_item_${index}`);
        const productOptions = document.querySelector(".template-new .product-selector__items");

        activeBox.append(clickedElement);
        productOptions.prepend(activeElement);
        productOptions.classList.toggle("open");
        this.productPriceBlock.innerHTML = this.formatter.format(price);
        this.showSavingsValue("cat_" + this.state.numberOfCatsSelected, weight);
    }

    renderSubAndSaveOptionTemplate(cat, selectByDefault) {
        let defaultSelectedOption = selectByDefault;
        let html = ``;
        let numberToText = {
            1: "One",
            2: "Two",
            3: "Three",
            4: "Four"        
        }

        if (this.subscriptionOptions[cat].length == 1) {
            defaultSelectedOption = 1;
        }

        for (let index in this.subscriptionOptions[cat]) {
            const option = this.subscriptionOptions[cat][index];

            if ((this.subscriptionOptions[cat].length - 1) == index) {
                this.state.rechargeInterval = option.interval;
                this.state.productWeight = option.weight;
                this.productPriceBlock.innerHTML = this.formatter.format(option.pricePerDelivery);
                this.showSavingsValue(cat, option.weight);
                let selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs");
                this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id;
            }

            let interval = "Every " + option.interval + " Months";
            let bagText = option.weight == 10 ? "Bag" : "Bags";
            if (option.interval == 1) interval = "Every Month"
            if (option.interval == 2) interval = "Every Other Month"

            html += `
                <div 
                    id="product_item_${index}" 
                    style="order:${index}" 
                    class="product-selector__item" 
                    onclick="productForm.changeSubAndSaveOption(${option.interval}, ${option.weight}, ${index}, ${option.pricePerDelivery}, '${cat}')"
                >
                    <div class="weight">
                        <span class="paragraph variant-b">${interval}</span>
                        <span class="paragraph variant-c">${numberToText[option.interval]} Month Supply</span>
                    </div>
                    <div class="price">
                        ${option.eco ? `
                            <div class="eco-variant">
                                <span>Best Value</span>
                                <span>ECO</span>
                            </div>
                        ` : ''}

                        <span class="paragraph variant-b">
                            ${this.formatter.format(option.perBagPrice)} per 10lbs
                        </span>
                        <span class="paragraph variant-c">
                            ${this.formatter.format(option.pricePerDelivery)}
                        </span>

                        <span class="heading variant-b">
                            ${this.formatter.format(option.pricePerDelivery)} for ${option.weight} pounds delivered ${interval}
                        </span>
                        <span class="heading variant-c">
                            ${option.weight} pounds delivered ${interval}
                        </span>
                    </div>
                </div>   
            `
        }
        
        const subscribeAndSaveOptionsWrapper = document.querySelector(".template-new #subscribe-and-save-options");
        const productSelectorActiveItem = document.querySelector(".template-new .product-selector__active-item")
        subscribeAndSaveOptionsWrapper.innerHTML = html;
        
        const arrowImage = document.createElement("img");
        arrowImage.src = materialArrow;
        arrowImage.classList.add("arrow-image");
        
        productSelectorActiveItem.innerHTML = ""

        productSelectorActiveItem.append(subscribeAndSaveOptionsWrapper.children[subscribeAndSaveOptionsWrapper.children.length - 1]);
        
        if (this.subscriptionOptions[cat].length == 1) {
            subscribeAndSaveOptionsWrapper.style.display = "none";
        } else {
            subscribeAndSaveOptionsWrapper.style.display = "flex";
            productSelectorActiveItem.append(arrowImage);
        }
    }

    renderSubAndSaveOptions(defOption = 1) {
        this.renderSubAndSaveOptionTemplate(`cat_${this.state.numberOfCatsSelected}`, defOption)
    }

    showSelectedSubscription(weight, interval, line) {
        const cartWrapper = document.querySelector(".template-new .ajax-cart__wrapper");
        cartWrapper.classList.remove('open');
        document.body.removeAttribute('style');

        this.state.selectedBeingEditingVariantLine = line;
        this.state.purchaseType = "subscribe-and-save";
        this.state.productWeight = parseInt(weight);
        
        for (let cat in this.subscriptionOptions) {
            this.subscriptionOptions[cat].forEach((element, index) => {
                if (element.weight === parseInt(weight) && element.interval === Number(interval)) {
                    this.renderSubAndSaveOptionTemplate(cat, (Number(index)+1));
                    this.state.numberOfCatsSelected = Number(cat.split("_")[1]);
                    
                    this.renderSubAndSaveOptions();

                    const catCounterCount = document.querySelector(".template-new .cat-counter__count");
                    let text = this.state.numberOfCatsSelected == 1 ? " Cat" : " Cats";
                    catCounterCount.textContent = this.state.numberOfCatsSelected + text;

                    const catCounters = document.querySelectorAll(".template-new button[name=cat-counter__action]");
                    if (this.state.numberOfCatsSelected == 8) catCounters[1].setAttribute('disabled', "true");
                    if (this.state.numberOfCatsSelected < 8) catCounters[1].removeAttribute('disabled');
                    if (this.state.numberOfCatsSelected == 1) catCounters[0].setAttribute('disabled', "true");
                    if (this.state.numberOfCatsSelected > 1) catCounters[0].removeAttribute('disabled');

                    const addToCartText = document.querySelector(".template-new .add-to-cart-text");
                    addToCartText.textContent = "Update Subscription";
                }
            });
        }
        
    }

    showSavingsValue(cat, weight) {
        const savingsMapping = {
            'cat_1': {
                '10': '18%',
                '20': '45.5%',
                '40': '52.8%',
            },
            'cat_2': {
                '20': '18%',
                '40': '28.9%',
            },
            'cat_3': {
                '30': '18%',
                '60': '22.7%',
            },
            'cat_4': {
                '40': '18%',
            },
            'cat_5': {
                '50': '18%',
            },
            'cat_6': {
                '60': '18%',
            },
            'cat_7': {
                '70': '18%',
            },
            'cat_8': {
                '80': '18%',
            },
        };
        
        const savingValue = savingsMapping[cat] && savingsMapping[cat][weight];
        if (savingValue) {
            this.setSavingValues('', savingValue);
        }
    }

    setSavingValues(dollar, percentage) {
        if (this.state.purchaseType == "one-time-purchase") {
            const subscriptionBenefit = document.querySelector(".template-new .subscriptionBenefit");
            subscriptionBenefit.textContent = percentage;
        } else {
            const percantageSavings = document.querySelector(".template-new #percent-saving");
            percantageSavings.textContent = percentage
        }
    }

    switchToSubscription() {
        const subscriptionSwitcher = document.querySelector(".template-new .subscription-switcher");
        this.state.numberOfCatsSelected = this.state.productWeight / 10;
        subscriptionSwitcher.click();
    }

    addFreeShippingText(selectedVariantIndex) {
        const text = `
            <span>${this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100)}</span>
            <span class="free-shipping">+$3.00 shipping</span>
        `
        this.productPriceBlock.innerHTML = text;
    }
}

var subscriptionOptions = {
    cat_1: [
        {
            weight: 10,
            pricePerDelivery: 19,
            interval: 1,
            perBagPrice: 19
        },
        {
            weight: 20,
            pricePerDelivery: 28.50,
            interval: 2,
            perBagPrice: 14.25
        },
        {
            weight: 40,
            pricePerDelivery: 49.40,
            interval: 4,
            eco: true,
            perBagPrice: 12.35
        }

    ],
    cat_2: [
        {
            weight: 20,
            pricePerDelivery: 28.50,
            interval: 1,
            perBagPrice: 14.25
        },
        {
            weight: 40,
            pricePerDelivery: 49.40,
            interval: 2,
            eco: true,
            perBagPrice: 12.35
        }
    ],
    cat_3: [
        {
            weight: 30,
            pricePerDelivery: 39.30,
            interval: 1,
            perBagPrice: 13.10
        },
        {
            weight: 60,
            pricePerDelivery: 74.10,
            interval: 2,
            eco: true,
            perBagPrice: 12.35
        }
    ],
    cat_4: [
        {
            weight: 40,
            pricePerDelivery: 49.40,
            interval: 1,
            eco: true,
            perBagPrice: 12.35
        }
    ],
    cat_5: [
        {
            weight: 50,
            pricePerDelivery: 61.75,
            interval: 1,
            eco: true,
            perBagPrice: 12.35
        }
    ],
    cat_6: [
        {
            weight: 60,
            pricePerDelivery: 74.10,
            interval: 1,
            eco: true,
            perBagPrice: 12.35
        }
    ],
    cat_7: [
        {
            weight: 70,
            pricePerDelivery: 86.45,
            interval: 1,
            eco: true,
            perBagPrice: 12.35
        }
    ],
    cat_8: [
        {
            weight: 80,
            pricePerDelivery: 98.80,
            interval: 1,
            eco: true,
            perBagPrice: 12.35
        }
    ],
}

/* Google Optimize script */
function implementManyExperiments(value, name) {

    if(name == '') {

        if(value == '1') { }

    }

}
     
// gtag('event', 'optimize.callback', {
//     callback: implementManyExperiments
// });

const productForm = new ProductForm(subscriptionOptions);
productForm.init();