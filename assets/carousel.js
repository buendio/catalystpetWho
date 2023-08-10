 $(document).ready(function() {
    var carousel = $("#product-carousel-images");
    var thumbs = $("#thumbs");
    var syncedSecondary = true;
    var userInteracted = false; // Add a flag to track user interaction

    carousel.owlCarousel({
      items: 1,
      slideSpeed: 2000,
      nav: false,
      autoplay: true,
      dots: false,
      loop: true,
      responsiveRefreshRate: 200,
    }).on("changed.owl.carousel", syncPosition)
      .on("dragged.owl.carousel", function() {
        userInteracted = true;
        stopVideos();
      });

    thumbs.on("initialized.owl.carousel", function() {
      thumbs.find(".owl-item").eq(0).addClass("current");
    }).owlCarousel({
      items: 6,
      dots: true,
      nav: false,
      smartSpeed: 200,
      slideSpeed: 500,
      slideBy: 6,
      responsiveRefreshRate: 100,
    }).on("changed.owl.carousel", syncPosition2)

    function syncPosition(el) {
      if (userInteracted) {
         carousel.trigger('stop.owl.autoplay');
      }

      var count = el.item.count - 1;
      var current = Math.round(el.item.index - el.item.count / 2 - 0.5);

      if (current < 0) {
        current = count;
      }
      if (current > count) {
        current = 0;
      }
      //to this
      thumbs
        .find(".owl-item")
        .removeClass("current")
        .eq(current)
        .addClass("current");
      var onscreen = thumbs.find(".owl-item.active").length - 1;
      var start = thumbs
      .find(".owl-item.active")
      .first()
      .index();
      var end = thumbs
      .find(".owl-item.active")
      .last()
      .index();

      if (current > end) {
        thumbs.data("owl.carousel").to(current, 100, true);
      }
      if (current < start) {
        thumbs.data("owl.carousel").to(current - onscreen, 100, true);
      }
    }

    function syncPosition2(el) {
      if (syncedSecondary) {
        var number = el.item.index;
        carousel.data("owl.carousel").to(number, 100, true);
      }
    }

    function stopVideos() {
      const carouselVideos = document.querySelectorAll(".carousel-video");
      carouselVideos.forEach(video => {
        video.pause()
        video.currentTime = 0;
        }
      );
    }

    thumbs.on("click", ".owl-item", function(e) {
      e.preventDefault();
      var number = $(this).index();
      carousel.trigger('stop.owl.autoplay');
      carousel.data("owl.carousel").to(number, 300, true);
      stopVideos()
    });

    carousel.on('click', 'video', function(e) {
      carousel.trigger('stop.owl.autoplay'); 
    });
  });