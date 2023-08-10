class ProductFormOld extends Cart {
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

        this.oneTimePurchaseFormBlock = document.querySelector(".template-old #one-time-purchase-form-block");
        this.subscribeAndSaveFormBlock = document.querySelector(".template-old #subscribe-and-save-form-block");

        this.numberOfCatsCheckboxes = document.querySelectorAll(".template-old input[name='number-of-cats']");
        this.numberOfCatsManualCounters = document.querySelectorAll(".template-old button[name='number-of-cats-manual-counter']");
        this.numberOfCatsManualCounterValue = document.querySelector(".template-old #number-of-cats-manual-value");
        this.numberOfCatsManualCounterWrapper = document.querySelector(".template-old #number-of-cats-manual-counter-wrapper");
        
        this.oneTimePurchaseProductPrice = document.querySelector(".template-old #one-time-purchase-product-price");
        this.oneTimePurchaseProductWeightValue = document.querySelector(".template-old #one-time-purchase-product-weight-value");
        this.oneTimePurchaseProductWeightCounters = document.querySelectorAll(".template-old button[name='product-weight-counter']");
        this.freeSheepingBlock = document.querySelector(".template-old #free-sheeping-block");
        this.subscriptionOptions = subscriptionOptions;
    }

    init() {
        const savedSubProduct = JSON.parse(localStorage.getItem('subProduct'));
        
        if (savedSubProduct) {
            const {weight, interval, line} = savedSubProduct;
            this.showSelectedSubscription(weight, interval, line);
            localStorage.removeItem('subProduct');
        }

        // Adding listeners to toggle between subscribe and onetime purchase options
        const purchaseTypeCheckboxes = document.querySelectorAll(".template-old input[name='purchase-type']")
        purchaseTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', ({target}) => {

                if (target.id == "subscribe-and-save") {
                    this.state.purchaseType = target.id;
                    this.oneTimePurchaseFormBlock.setAttribute('style', "display: none");
                    this.subscribeAndSaveFormBlock.removeAttribute('style');
                    this.renderSubAndSaveOptions();
                }

                if (target.id == "one-time-purchase") {
                    this.state.selectedBeingEditingVariantLine = null;
                    this.state.purchaseType = target.id;
                    this.subscribeAndSaveFormBlock.setAttribute('style', "display: none");
                    this.oneTimePurchaseFormBlock.removeAttribute('style');
                    this.calculateWeightAndPrice();
                }


                this.showSavingsValue(`cat_${this.state.numberOfCatsSelected}`, this.state.productWeight);

                let selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs");
                this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id
            })
        })

        // adding listeners to change number of cats by selection
        this.numberOfCatsCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', ({target}) => {
                const { value } = target.dataset;   
                this.state.numberOfCatsSelected = Number(value);
                this.numberOfCatsManualCounterWrapper.classList.remove('active');
                this.calculateWeightAndPrice();

                if (this.state.purchaseType === "subscribe-and-save") {
                    this.renderSubAndSaveOptions();
                }
            })
        })

        // adding listeners to change number of cats by counter
        this.numberOfCatsManualCounters.forEach(counter => {
            counter.addEventListener('click', ({target}) => {
                this.numberOfCatsManualCounterWrapper.classList.add('active');
                this.numberOfCatsCheckboxes.forEach(checkbox => checkbox.checked = false);

                const numberOfCatsManualDecrementor = this.numberOfCatsManualCounters[0];
                const numberOfCatsManualIncrementor = this.numberOfCatsManualCounters[1];
                const { action } = target.dataset;
                
                if (action === 'increment') {
                    if (this.state.numberOfCatsSelected < 4) {
                        this.state.numberOfCatsSelected = parseInt(this.numberOfCatsManualCounterValue.textContent);
                    }
                    
                    this.state.numberOfCatsSelected += 1;
                    this.numberOfCatsManualCounterValue.textContent = this.state.numberOfCatsSelected;
                    this.calculateWeightAndPrice();
        
                    if (this.state.numberOfCatsSelected > 4) {
                        numberOfCatsManualDecrementor.removeAttribute('disabled');
                    }

                    if (this.state.numberOfCatsSelected + 1 === 9) {
                        numberOfCatsManualIncrementor.setAttribute('disabled', true);
                    }
                }

                if (action === 'decrement') {
                    if (this.state.numberOfCatsSelected < 4) {
                        this.state.numberOfCatsSelected = parseInt(this.numberOfCatsManualCounterValue.textContent);
                    }
                    
                    this.state.numberOfCatsSelected -=  1;
                    this.numberOfCatsManualCounterValue.textContent = this.state.numberOfCatsSelected;
                    this.calculateWeightAndPrice();

                    if (this.state.numberOfCatsSelected === 4) {
                        numberOfCatsManualDecrementor.setAttribute('disabled', true);
                    };

                    if (this.state.numberOfCatsSelected < 8) {
                        numberOfCatsManualIncrementor.removeAttribute('disabled');
                    };
                }

                if (this.state.purchaseType === "subscribe-and-save") {
                    this.renderSubAndSaveOptions();
                }
            })
        })

        // adding listener to change the state and target class when counter itself is clicked
        this.numberOfCatsManualCounterValue.addEventListener('click', () => {
            this.numberOfCatsManualCounterWrapper.classList.add('active');
            this.numberOfCatsCheckboxes.forEach(checkbox => checkbox.checked = false);

            this.state.numberOfCatsSelected = parseInt(this.numberOfCatsManualCounterValue.textContent);;
            this.calculateWeightAndPrice();
            
            if (this.state.purchaseType === "subscribe-and-save") {
                this.renderSubAndSaveOptions();
            }
        });

        // adding listeners to change the product weight by counter
        this.oneTimePurchaseProductWeightCounters.forEach(counter => {
            counter.addEventListener('click', ({target}) => {
                const weightDecrementor = this.oneTimePurchaseProductWeightCounters[0];
                const weightIncrementor = this.oneTimePurchaseProductWeightCounters[1];
                const { action } = target.dataset;
                
                if (action === 'increment') {
                    this.state.productWeight +=  10;
                    this.oneTimePurchaseProductWeightValue.textContent = this.state.productWeight + 'lbs';
                    
                    if (this.state.productWeight > 10) {
                        weightDecrementor.removeAttribute('disabled');
                    }

                    if (this.state.productWeight + 10 > 80) {
                        weightIncrementor.setAttribute('disabled', true);
                    }
                }

                if (action === 'decrement') {
                    if (this.state.productWeight - 10 === 0) return;
                    
                    this.state.productWeight -=  10;
                    this.oneTimePurchaseProductWeightValue.textContent = this.state.productWeight + 'lbs';

                    if (this.state.productWeight === 10) {
                        weightDecrementor.setAttribute('disabled', true);
                    }

                    if (this.state.productWeight < 80) {
                        weightIncrementor.removeAttribute('disabled');
                    }
                }
                

                let selectedVariantIndex;

                if (this.state.productWeight ===  10 && this.state.purchaseType === "one-time-purchase") {
                    this.freeSheepingBlock.setAttribute("style", "display: none");
                    selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == "10lbs");
                    this.addFreeShippingText(selectedVariantIndex);
                };

                if (this.state.productWeight > 10 && this.state.purchaseType === "one-time-purchase") {
                    
                    selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == `${this.state.productWeight}lbs`)
                    
                    this.oneTimePurchaseProductPrice.innerHTML = `
                        ${this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100)}
                    `
                } 

                if (this.state.purchaseType === "subscribe-and-save") {
                    selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs")
                    this.oneTimePurchaseProductPrice.textContent = this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100);
                }
                
                this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id
            })
        })

        const oneTimePurchaseAddToCartButton = document.querySelector(".template-old #one-time-purchase-add-to-cart");
        oneTimePurchaseAddToCartButton.addEventListener('click', () => this.addOneTimePurchaseProductToCart());
        
        const subscribeAndSaveAddtoCart = document.querySelector(".template-old #subscribe-and-save-add-to-cart");
        subscribeAndSaveAddtoCart.addEventListener('click', () => this.addSubscriptionProductToCart());

        purchaseTypeCheckboxes[0].click();
    }

    async addSubscriptionProductToCart() {
        let canAdd = true;

        const cartItems = await this.getItems();
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
                    this.addItem(formData).then((res) => this.toggleCart())
                });
        } else {
            this.addItem(formData).then((res) => this.toggleCart())
        }

        const subscribeAndSaveAddtoCart = document.querySelector(".template-old #subscribe-and-save-add-to-cart");
        subscribeAndSaveAddtoCart.textContent = "Add To Cart"
    }

    async addOneTimePurchaseProductToCart() {
        const formData = {
            items: [{
                id: this.state.selectedVariantId,
                quantity: 1
            }]
        }

        const cartItems = await this.getItems();
        const itemIndex = cartItems.items.findIndex((item) => item.id == this.state.selectedVariantId)
        
        if (itemIndex < 0) {
            this.addItem(formData).then((res) => this.toggleCart());
        } else {
            this.toggleCart();
        }

    }

    calculateWeightAndPrice() {
        const weightDecrementor = this.oneTimePurchaseProductWeightCounters[0];

        this.oneTimePurchaseProductWeightValue.textContent = (this.state.numberOfCatsSelected * 10) + 'lbs';
        this.state.productWeight = this.state.numberOfCatsSelected * 10;

        if (this.state.productWeight > 10) {
            weightDecrementor.removeAttribute('disabled');
        }

        if (this.state.productWeight == 10) {
            weightDecrementor.setAttribute('disabled', true);
        }

        let selectedVariantIndex;

        if (this.state.numberOfCatsSelected === 1 && this.state.purchaseType === "one-time-purchase") {
            selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == "10lbs")
            this.freeSheepingBlock.setAttribute("style", "display: none");
            this.addFreeShippingText(selectedVariantIndex);
            this.showSavingsValue(`cat_${this.state.numberOfCatsSelected}`, this.state.productWeight);
        } 
        
        if (this.state.numberOfCatsSelected > 1 && this.state.purchaseType === "one-time-purchase") {
            selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == `${this.state.productWeight}lbs`)
            
            this.oneTimePurchaseProductPrice.innerHTML = `
                ${this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100)}
            `
            this.showSavingsValue(`cat_${this.state.numberOfCatsSelected}`, this.state.productWeight);
        }
        
        if (this.state.purchaseType === "subscribe-and-save") {
            selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs");
            
            const oneTimePurchaseIndex = this.state.allVariants.findIndex(variant => variant.title == `${this.state.productWeight}lbs`);
            this.oneTimePurchaseProductPrice.textContent = this.formatter.format(
                (this.state.allVariants[oneTimePurchaseIndex].price) / 100
            );
        }
        
        this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id;
    }

    changeSubAndSaveOption(interval, weight, cat) {
        this.state.rechargeInterval = interval
        this.state.productWeight = weight

        const selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == this.state.productWeight + "lbs");
             
        this.state.selectedVariantId = this.state.allVariants[selectedVariantIndex].id

        this.showSavingsValue(cat, weight)
    }

    renderSubAndSaveOptionTemplate(cat, selectByDefault) {
        let html = ``;

        for (let index in this.subscriptionOptions[cat]) {
            const option = this.subscriptionOptions[cat][index];
            const reversedIndex = Number(index) - this.subscriptionOptions[cat].length;


            let selectedVariantIndex = this.state.allVariants.findIndex(variant => variant.title == option.weight + "lbs");
            let selectedVariant = this.state.allVariants[selectedVariantIndex];
            let selectedVariantPriceAfterDiscount = (selectedVariant.price - (selectedVariant.price * 0.18)) / 100;

            if ((Number(index)+1) === selectByDefault || reversedIndex === selectByDefault) {
                this.state.rechargeInterval = option.interval;
                this.state.productWeight = option.weight;
                this.state.selectedVariantId = selectedVariant.id;
            }

            html += `
              <li class="options__item">
                <input 
                    onchange="productFormOld.changeSubAndSaveOption(${option.interval}, ${option.weight}, '${cat}')" 
                    class="options_selector"  
                    name="sub-options" 
                    id="sub-option-${option.weight}" 
                    type="radio" 
                    hidden
                    ${(Number(index)+1) === selectByDefault ? 'checked' : ""}
                    ${reversedIndex === selectByDefault ? 'checked' : ""}
                />
                <label class="label--simple full" for="sub-option-${option.weight}">
                    ${option.eco ? `
                        <div class="eco-box eco-updated">
                            <div class="tooltip">
                                <img src="${ecoImg}" alt="" />
                                <div class="text__updated">
                                    Fewer shipments = a lower carbon footprint.
                                </div>
                                <div class="square"></div>
                            </div>
                            <span class="eco-label">Eco</span>
                            <span class="eco-label-updated"> <img src="${ecoUpdateImg}" alt="" /></span>
                        </div>
                    ` : ''}
                    <div class="weight">
                        <span class="heading">${option.weight}lbs</span>
                        <span class="paragraph">Every ${option.interval === 1 ? "" : option.interval} Month${option.interval > 1 ? "s" : ""}</span>
                    </div>
                    <div class="price">
                        <span class="paragraph">
                            ${this.formatter.format(selectedVariantPriceAfterDiscount / option.interval)}/month
                        </span>
                        <span class="heading">
                            ${this.formatter.format(selectedVariantPriceAfterDiscount)}
                        </span>
                    </div>
                </label>
              </li>   
            `
        }

        const subscribeAndSaveOptionsWrapper = document.querySelector(".template-old #subscribe-and-save-options");
        subscribeAndSaveOptionsWrapper.innerHTML = html;
        
        this.showSavingsValue(cat, this.state.productWeight);
    }

    renderSubAndSaveOptions() {
        this.renderSubAndSaveOptionTemplate(`cat_${this.state.numberOfCatsSelected}`, -1)
    }

    showSelectedSubscription(weight, interval, line) {
        const subscribeAndSaveAddtoCart = document.querySelector(".template-old #subscribe-and-save-add-to-cart");
        subscribeAndSaveAddtoCart.textContent = "Update Cart"

        const cartWrapper = document.querySelector(".template-old .ajax-cart__wrapper");
        cartWrapper.classList.remove('open');
        document.body.removeAttribute('style');

        this.state.selectedBeingEditingVariantLine = line;
        this.state.purchaseType = "subscribe-and-save";
        this.state.productWeight = parseInt(weight);

        const purchaseTypeCheckboxes = document.querySelectorAll(".template-old input[name='purchase-type']")
        purchaseTypeCheckboxes[0].checked = true;

        this.oneTimePurchaseFormBlock.setAttribute('style', "display: none");
        this.subscribeAndSaveFormBlock.removeAttribute('style');
        
        for (let cat in this.subscriptionOptions) {
            this.subscriptionOptions[cat].forEach((element, index) => {
                if (element.weight === parseInt(weight) && element.interval === Number(interval)) {
                    this.renderSubAndSaveOptionTemplate(cat, (Number(index)+1));

                    this.state.numberOfCatsSelected = Number(cat.split("_")[1]);

                    if (this.state.numberOfCatsSelected <= 3) {
                        this.numberOfCatsCheckboxes.forEach(checkbox => {
                            const { value } = checkbox.dataset;

                            if (Number(value) === this.state.numberOfCatsSelected) {
                                checkbox.checked = true;
                            }
                        })
                    } else {
                        const numberOfCatsManualDecrementor = this.numberOfCatsManualCounters[0];
                        const numberOfCatsManualIncrementor = this.numberOfCatsManualCounters[1];

                        this.numberOfCatsManualCounterWrapper.classList.add('active');
                        this.numberOfCatsCheckboxes.forEach(checkbox => checkbox.checked = false);
                        this.numberOfCatsManualCounterValue.textContent = this.state.numberOfCatsSelected;

                        if (this.state.numberOfCatsSelected > 4) {
                            numberOfCatsManualDecrementor.removeAttribute('disabled');
                        }

                        if (this.state.numberOfCatsSelected + 1 === 9) {
                            numberOfCatsManualIncrementor.setAttribute('disabled', true);
                        }
                    }
                }
            });
        }
    }

    showSavingsValue(cat, weight = null) {

        const savingsMapping = {
            'cat_1': {
                '10': '18%',
                '20': '46%',
                '40': '53%',
            },
            'cat_2': {
                '20': '18%',
                '40': '29%',
            },
            'cat_3': {
                '30': '18%',
                '60': '23%',
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
        const highestSavingValue = savingsMapping[cat] && savingsMapping[cat][Object.keys(savingsMapping[cat])[Object.keys(savingsMapping[cat]).length - 1]];
        
        if (savingValue) {
            this.setSavingValues('', savingValue, highestSavingValue);
        }
    }

    addFreeShippingText(selectedVariantIndex) {
        const text = `
            <span>${this.formatter.format((this.state.allVariants[selectedVariantIndex].price) / 100)}</span>
            <span style="font-size: 14px" class="free-shipping">+$3.00 shipping</span>
        `
        this.oneTimePurchaseProductPrice.innerHTML = text;
    }

    setSavingValues(dollar, percentage, highestSavingValue) {
        const dollarSavings = document.querySelector(".template-old #dollars_saving");
        dollarSavings.textContent = dollar 

        const percantageSavings = document.querySelector(".template-old #percantage_saving");
        percantageSavings.textContent = percentage       

        const percentageSavingsOneTime = document.querySelector(".template-old #percantage_saving_onetime");
        percentageSavingsOneTime.textContent = highestSavingValue
    }
}


const productFormOld = new ProductFormOld(subscriptionOptions);
productFormOld.init();