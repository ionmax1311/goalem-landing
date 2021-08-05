// start animation func

// counter up

var options = {
  useEasing: false,
  useGrouping: true,
  separator: ",",
  decimal: ".",
};

var statistics = $(".counter-up");

function slideNull() {
  $("#home-slider").removeClass("active");
  $(".header-in").removeClass("active");

  $(".footer").css("display", "none");
  $(".swiper-pagination").css("display", "none");
}
function slideOne() {
  $("#home-slider").addClass("active");
  $(".header-in").addClass("active");

  $(".footer").css("display", "block");
  $(".swiper-pagination").css("display", "block");

  setTimeout(function () {
    $(".result-graph-in").addClass("active");
  }, 700);
}
function slideTwo() {
  setTimeout(function () {
    $(".overlay").addClass("active");
  }, 500);
  setTimeout(function () {
    $(".over-hidden").addClass("active");
  }, 700);

  setTimeout(function () {
    $(".stage").addClass("active");
  }, 1700);
}
function counterUpDevelop() {
  setTimeout(function () {
    statistics.each(function (index) {
      var value = $(statistics[index]).html();

      var statisticAnimation = new CountUp(
        statistics[index],
        0,
        value,
        0,
        0.8,
        options
      );
      statisticAnimation.start();
    });
  }, 500);
}
function slideTree() {
  $(".footer").css("display", "block");
}

// swiper

var menu = ["", "", "", "", ""];

var swiper;

function resizeScrenn() {
  // if ($(window).width() >= 1380) {
  if ($(window).width() >= 1201) {
    if ($(".swiper-container").length > 0) {
      swiper = new Swiper(".swiper-container", {
        direction: "vertical",
        loop: false,
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + '">' + menu[index] + "</span>";
          },
        },

        scrollbar: ".swiper-scrollbar",
        // grabCursor: true,
        speed: 1000,
        paginationClickable: true,
        parallax: true,
        autoplay: false,
        effect: "slide",
        mousewheelControl: true,
        mousewheel: true,
        allowTouchMove: false,
      });
      document.querySelectorAll(".menu-in li").forEach(function (elem) {
        elem.addEventListener("click", function (e) {
          e.preventDefault();
          let curIndex = elem.getAttribute("data-index");
          swiper.slideTo(curIndex, 1000, false);
          $(".menu").removeClass("active");
          if (curIndex != 0) {
            $(".swiper-pagination").css("display", "block");
            $(".footer").css("display", "block");
            $("#home-slider").addClass("active");
            $(".header-in").addClass("active");
          }
        });
      });

      $(".link-vak-all").click(function () {
        swiper.slideTo(3, 1000, false);
        $(".swiper-pagination").css("display", "block");
        $(".footer").css("display", "block");
        $("#home-slider").addClass("active");
        $(".header-in").addClass("active");
      });

      $(".btn-send-resume").click(function () {
        swiper.slideTo(4, 1000, false);
        $(".swiper-pagination").css("display", "block");
        $(".footer").css("display", "block");
        $("#home-slider").addClass("active");
        $(".header-in").addClass("active");
      });

      $(".logo").click(function () {
        swiper.slideTo(0, 1000, false);
        $(".swiper-pagination").css("display", "none");
        $(".footer").css("display", "none");
        $("#home-slider").removeClass("active");
        $(".header-in").removeClass("active");
        $(".menu").removeClass("active");
      });
      var flag1 = true;
      swiper.on("slideChange", function () {
        if (this.activeIndex === 0) {
          slideNull();
        }
        if (this.activeIndex === 1) {
          slideOne();
        }
        if (this.activeIndex === 1 && flag1 === true) {
          counterUpDevelop();
          flag1 = false;
        }
        if (this.activeIndex === 2) {
          slideTwo();
        }
        if (this.activeIndex === 3) {
          slideTree();
        }
      });

      $(".scroll-down,.btn-more").click(function (e) {
        e.preventDefault();

        swiper.slideNext();
      });
    }
  } else {
    // swiper.destroy();  или
    // swiper.autoplay.stop();
  }
}

resizeScrenn();

$(window).resize(function () {
  resizeScrenn();
});

// get scroll
var flag = false;
$(document).ready(function () {
  $(document).scroll(function () {
    var s_top = $("html, body").scrollTop();

    var one = $("#one-slide").offset().top;
    var two = $("#two-slide").offset().top - 100;
    var three = $("#three-slide").offset().top;
    var four = $("#four-slide").offset().top;
    if (s_top > one) {
      $("#home-slider").removeClass("active");
      $(".header-in").removeClass("active");

      $(".footer").css("display", "none");
    }
    if (s_top > two) {
      $("#home-slider").addClass("active");
      $(".header-in").addClass("active");
      $(".footer").css("display", "block");
      setTimeout(function () {
        $(".result-graph-in").addClass("active");
      }, 700);
    }
    if (s_top > two && flag === false) {
      setTimeout(function () {
        statistics.each(function (index) {
          var value = $(statistics[index]).html();

          var statisticAnimation = new CountUp(
            statistics[index],
            0,
            value,
            0,
            0.8,
            options
          );
          statisticAnimation.start();
        });
      }, 500);

      flag = true;
    }
    if (s_top > three) {
      setTimeout(function () {
        $(".overlay").addClass("active");
      }, 500);
      setTimeout(function () {
        $(".over-hidden").addClass("active");
      }, 700);

      setTimeout(function () {
        $(".stage").addClass("active");
      }, 1700);
    }
    if (s_top > four) {
      // slideTree();
    }
  });
});

$(document).ready(function () {
  setTimeout(() => {
    $(".swiper-wrapper").removeClass("hid");
    $(".menu,.desc").addClass("transition");
  }, 0);
});
