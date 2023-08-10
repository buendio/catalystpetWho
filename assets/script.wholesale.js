function incrementQty(productId) {
    const inputQty = document.getElementById('qty-' + productId);
    inputQty.value = parseInt(inputQty.value) + 1;
    changePrice(productId, inputQty.value);
}

function decrementQty(productId) {
    const inputQty = document.getElementById('qty-' + productId);

    if (inputQty.value > 1) {
        inputQty.value = parseInt(inputQty.value) - 1;
        changePrice(productId, inputQty.value);
    }
}

function changePrice(productId, qty) {
    const productPriceWrapper = document.getElementById('product-price-' + productId);
    productPriceWrapper.innerHTML = '$' + (qty * parseFloat(productPriceWrapper.dataset.price / 100)).toFixed(2);
}

function handleSubmit(event, form) {
    event.preventDefault();

    const inputQty = form.elements.quantity.value;
    const productId = form.elements.id.value;
    
    const frequency = form.elements.selling_plan.value.split(":");
    const sellingPlan = frequency[0];
    const rechargeInterval = parseInt(frequency[1]);

    const formData = {
        id: productId,
        quantity: inputQty,
        selling_plan: sellingPlan,
        properties: {
            _interval: rechargeInterval
        }
    }

    modalCart.addItem(formData).then(() => modalCart.toggleCart());
}