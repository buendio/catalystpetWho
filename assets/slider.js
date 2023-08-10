const owlReviews = $('.slider-reviews');

owlReviews.owlCarousel({
    loop: true,
    margin: 30,
    items: 3,
    nav: false,
    responsive: {
        0: {
            items : 1,
        },
        600: {
            items : 2,
        },
        900 : {
            items : 3,
        },
    }
})

$('.reviews-customNextBtn').click(function() {
    owlReviews.trigger('prev.owl.carousel');
})


$('.reviews-customPrevBtn').click(function() {
    owlReviews.trigger('next.owl.carousel');
})

const owlHowItWorks = $('.slider-how-it-works');

owlHowItWorks.owlCarousel({
    loop: false,
    margin: 30,
    nav: false,
    items: 3,
    responsive: {
        0: {
            items : 1,
        },
        768 : {
            items : 2,
        },
        1024 : {
            items : 3,
        }
    }
})

$('.how-it-works-customNextBtn').click(function() {
    owlHowItWorks.trigger('prev.owl.carousel');
})


$('.how-it-works-customPrevBtn').click(function() {
    owlHowItWorks.trigger('next.owl.carousel');
})