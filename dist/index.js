(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require, exports, module);
  } else {
    root.CountUp = factory();
  }
})(this, function (require, exports, module) {
  /*

      countUp.js
      (c) 2014-2015 @inorganik
      Licensed under the MIT license.

  */

  // target = id of html element or var of previously selected html element where counting occurs
  // startVal = the value you want to begin at
  // endVal = the value you want to arrive at
  // decimals = number of decimal places, default 0
  // duration = duration of animation in seconds, default 2
  // options = optional object of options (see below)

  var CountUp = function (
    target,
    startVal,
    endVal,
    decimals,
    duration,
    options
  ) {
    var lastTime = 0;
    var vendors = ["webkit", "moz", "ms", "o"];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame =
        window[vendors[x] + "RequestAnimationFrame"];
      window.cancelAnimationFrame =
        window[vendors[x] + "CancelAnimationFrame"] ||
        window[vendors[x] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    }

    // default options
    this.options = {
      useEasing: true, // toggle easing
      useGrouping: true, // 1,000,000 vs 1000000
      separator: ",", // character to use as a separator
      decimal: ".", // character to use as a decimal
    };
    // extend default options with passed options object
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        this.options[key] = options[key];
      }
    }
    if (this.options.separator === "") this.options.useGrouping = false;
    if (!this.options.prefix) this.options.prefix = "";
    if (!this.options.suffix) this.options.suffix = "";

    this.d =
      typeof target === "string" ? document.getElementById(target) : target;
    this.startVal = Number(startVal);
    this.endVal = Number(endVal);
    this.countDown = this.startVal > this.endVal;
    this.frameVal = this.startVal;
    this.decimals = Math.max(0, decimals || 0);
    this.dec = Math.pow(10, this.decimals);
    this.duration = Number(duration) * 1000 || 2000;
    var self = this;

    this.version = function () {
      return "1.6.0";
    };

    // Print value to target
    this.printValue = function (value) {
      var result = !isNaN(value) ? self.formatNumber(value) : "--";
      if (self.d.tagName == "INPUT") {
        this.d.value = result;
      } else if (self.d.tagName == "text" || self.d.tagName == "tspan") {
        this.d.textContent = result;
      } else {
        this.d.innerHTML = result;
      }
    };

    // Robert Penner's easeOutExpo
    this.easeOutExpo = function (t, b, c, d) {
      return (c * (-Math.pow(2, (-10 * t) / d) + 1) * 1024) / 1023 + b;
    };
    this.count = function (timestamp) {
      if (!self.startTime) self.startTime = timestamp;

      self.timestamp = timestamp;

      var progress = timestamp - self.startTime;
      self.remaining = self.duration - progress;

      // to ease or not to ease
      if (self.options.useEasing) {
        if (self.countDown) {
          self.frameVal =
            self.startVal -
            self.easeOutExpo(
              progress,
              0,
              self.startVal - self.endVal,
              self.duration
            );
        } else {
          self.frameVal = self.easeOutExpo(
            progress,
            self.startVal,
            self.endVal - self.startVal,
            self.duration
          );
        }
      } else {
        if (self.countDown) {
          self.frameVal =
            self.startVal -
            (self.startVal - self.endVal) * (progress / self.duration);
        } else {
          self.frameVal =
            self.startVal +
            (self.endVal - self.startVal) * (progress / self.duration);
        }
      }

      // don't go past endVal since progress can exceed duration in the last frame
      if (self.countDown) {
        self.frameVal =
          self.frameVal < self.endVal ? self.endVal : self.frameVal;
      } else {
        self.frameVal =
          self.frameVal > self.endVal ? self.endVal : self.frameVal;
      }

      // decimal
      self.frameVal = Math.round(self.frameVal * self.dec) / self.dec;

      // format and print value
      self.printValue(self.frameVal);

      // whether to continue
      if (progress < self.duration) {
        self.rAF = requestAnimationFrame(self.count);
      } else {
        if (self.callback) self.callback();
      }
    };
    // start your animation
    this.start = function (callback) {
      self.callback = callback;
      self.rAF = requestAnimationFrame(self.count);
      return false;
    };
    // toggles pause/resume animation
    this.pauseResume = function () {
      if (!self.paused) {
        self.paused = true;
        cancelAnimationFrame(self.rAF);
      } else {
        self.paused = false;
        delete self.startTime;
        self.duration = self.remaining;
        self.startVal = self.frameVal;
        requestAnimationFrame(self.count);
      }
    };
    // reset to startVal so animation can be run again
    this.reset = function () {
      self.paused = false;
      delete self.startTime;
      self.startVal = startVal;
      cancelAnimationFrame(self.rAF);
      self.printValue(self.startVal);
    };
    // pass a new endVal and start animation
    this.update = function (newEndVal) {
      cancelAnimationFrame(self.rAF);
      self.paused = false;
      delete self.startTime;
      self.startVal = self.frameVal;
      self.endVal = Number(newEndVal);
      self.countDown = self.startVal > self.endVal;
      self.rAF = requestAnimationFrame(self.count);
    };
    this.formatNumber = function (nStr) {
      nStr = nStr.toFixed(self.decimals);
      nStr += "";
      var x, x1, x2, rgx;
      x = nStr.split(".");
      x1 = x[0];
      x2 = x.length > 1 ? self.options.decimal + x[1] : "";
      rgx = /(\d+)(\d{3})/;
      if (self.options.useGrouping) {
        while (rgx.test(x1)) {
          x1 = x1.replace(rgx, "$1" + self.options.separator + "$2");
        }
      }
      return self.options.prefix + x1 + x2 + self.options.suffix;
    };

    // format startVal on initialization
    self.printValue(self.startVal);
  };

  // Example:
  // var numAnim = new countUp("SomeElementYouWantToAnimate", 0, 99.99, 2, 2.5);
  // numAnim.start();
  // numAnim.update(135);
  // with optional callback:
  // numAnim.start(someMethodToCallOnComplete);

  return CountUp;
});

$.validator.addMethod(
  "email",
  function (value, element, param) {
    if (this.optional(element)) {
      //This is not a 'required' element and the input is empty
      return true;
    }

    if (/^([a-zA-Z0-9_\-\.]+){2,30}@([a-zA-Z0-9-]+.[a-zA-Z0-9-]+)$/.test(value)) {
      return true;
    }

    return false;
  },
  "Некорректный email"
);

$.validator.addMethod(
  "phone",
  function (value) {
    return /^\+?3?8?(0(66|95|99|50|67|68|96|97|98|63|73|93|39|91|92|94)\d{7})$/.test(
      value
    );
  },
  "Некорректный телефон"
);

// $(".upload").rules("add", {
//   required: true,
// });

function clearInput() {
  document.querySelector(".form-v").reset();
  $(".desc .form-input-wrap input").removeClass("valid,error");
}

$(".form-c").validate({
  rules: {
    name: {
      required: true,
      minlength: 1,
      maxlength: 100,
    },
    phone: {
      required: true,
      minlength: 10,
      phone: true,
    },
    email: {
      required: true,
      email: true,
    },
    // attachment[]: {
    //   required: true,
    // },
  },
});

$(".form-v").validate({
  rules: {
    name: {
      required: true,
      minlength: 1,
      maxlength: 100,
    },
    phone: {
      required: true,
      minlength: 10,
      phone: true,
    },
    email: {
      required: true,
      email: true,
    },
    // attachment[]: {
    //   required: true,
    // },
  },
});

// function validateSize(file) {
//   var fileSize = $("#file-c").get(0).files.size / 1024 / 1024; // in MB
//   if (fileSize > 5) {
//     $(".input-file-c").addClass("error");
//     console.log("File size >>>>> 2 MB");
//   } else {
//     $(".input-file-c").removeClass("error");
//     $(".input-file-c").addClass("valid");
//   }
// }

function checkFileInput(params) {
  if ($("#file-c").get(0).files.length === 0) {
    $(".input-file-c").addClass("error");
    // $(".input-file-c").removeClass("valid");
  } else {
    $(".input-file-c").removeClass("error");
    $(".input-file-c").addClass("valid");
  }
}

// $("body").bind("change", function () {
//   // alert("This file size is: " + this.files[0].size / 1024 / 1024 + "MiB");
// });

$("#file-c").change(function () {
  checkFileInput();
  // console.log("change--c");
  let curF = this.files[0].size / 1024 / 1024;
  if (curF > 5) {
    // console.log(
    //   "File size >>>>>>>> 5 MB--",
    //   this.files[0].size / 1024 / 1024 + "MiB"
    // );
    $(".input-file-c").removeClass("valid size");
    $("#file-c").addClass("error");
    // $("#upload-c .file-return-c").text("5 MB ");
    // $(file).val(''); //for clearing with Jquery
  } else {
    // console.log("File size <<<<<<<<<< 5 MB");

    $(".input-file-c").removeClass("error");
    $(".input-file-c").addClass("valid size");
  }
});

function checkFileInput2(params) {
  if ($("#file").get(0).files.length === 0) {
    $(".input-file-d").addClass("error");
  } else {
    $(".input-file-d").removeClass("error");
    $(".input-file-d").addClass("valid");
  }
}

$("#file").change(function () {
  checkFileInput2();
  // console.log("change");
  let curF = this.files[0].size / 1024 / 1024;
  if (curF > 5) {
    // console.log(
    //   "File size >>>>>>>> 5 MB--",
    //   this.files[0].size / 1024 / 1024 + "MiB"
    // );
    $(".input-file-d").removeClass("valid size");
    $("#file").addClass("error");
    // $("#upload .file-return-v").text("5 MB ");
    // $(file).val(''); //for clearing with Jquery
  } else {
    // console.log("File size <<<<<<<<<< 5 MB");

    $(".input-file-d").removeClass("error");
    $(".input-file-d").addClass("valid size");
  }
});

$("#phone-c,#phone").bind("change keyup input click", function () {
  if (this.value.match(/[^0-9]/g)) {
    this.value = this.value.replace(/[^0-9,\+]/g, "");
  }
});

$(".btn-cont").click(function () {
  // checkFileInput();
  $("#file-c").addClass("error");
  if ($(".input-file-c").hasClass("size")) {
    $("#file-c").addClass("valid");
    $("#file-c").removeClass("error");
  } else {
    $("#file-c").addClass("error");
    $("#file-c").removeClass("valid");
  }
  // let str = $("#phone-c").val();
  // str.replace(/\D/g, " ");

  // console.log($("#phone-c").val());
  // console.log(str);

  if ($(".form-c").valid() || $(".input-file-c .size").length > 0) {
    var form = new ProcessForm();
    form.init();

    $(".ty-c").addClass("active");

    setTimeout(() => {
      document.querySelector(".form-c").reset();
      $(".file-return-c").text(" ");
      $("label.error").hide();
      $(".error").removeClass("error");
      $(".valid").removeClass("valid");
      $(".input-file").removeClass("valid");
    }, 500);

    setTimeout(() => {
      $(".ty-c").removeClass("active");
    }, 7000);
  }
});

$(".btn-v").click(function () {
  // checkFileInput2();
  $("#file").addClass("error");
  if ($(".input-file-d").hasClass("size")) {
    $("#file").removeClass("error");
  } else {
    $("#file").addClass("error");
    $("#file").removeClass("valid");
  }

  if ($(".form-v").valid() || $(".input-file-d .size").length > 0) {
    var form1 = new ProcessForm2();
    form1.init2();

    $(".ty-v").addClass("active");

    setTimeout(() => {
      document.querySelector(".form-v").reset();
      $(".file-return-d").text(" ");
      $("label.error").hide();
      $(".error").removeClass("error");
      $(".valid").removeClass("valid");
      $(".input-file").removeClass("valid");
    }, 500);

    setTimeout(() => {
      $(".ty-v").removeClass("active");
    }, 7000);
  }
});

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


    $(".vacancies-wrap").mouseenter(function () {
      swiper.mousewheel.disable()
    })


    $(".vacancies-wrap").mouseleave(function (event) {
      swiper.mousewheel.enable()
    })

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

$(".menu-in li").click(function () {
  var target = $(this).attr("id");
  $("html, body").animate(
    { scrollTop: $("#" + target + "-slide").offset().top - 60 },
    500
  );
  $(".menu").removeClass("active");
  $("body").removeClass("hid");
});

$(".btn-send-resume").click(function () {
  $("html, body").animate(
    { scrollTop: $("#" + "five-slide").offset().top - 60 },
    500
  );
});

$(".btn-more,.scroll-down").click(function () {
  $("html, body").animate(
    { scrollTop: $("#" + "two-slide").offset().top - 60 },
    500
  );
});

$(".link-vak-all").click(function () {
  $("html, body").animate(
    { scrollTop: $("#" + "four-slide").offset().top - 60 },
    500
  );
});

$(".logo").click(function () {
  $("html, body").animate(
    { scrollTop: $("#" + "one-slide").offset().top - 60 },
    500
  );
});

setTimeout(function () {
  $(".desc .logo").click(function () {
    $("html, body").animate(
      { scrollTop: $("#" + "one-slide").offset().top - 60 },
      500
    );
    $(".desc").removeClass("active");
    $("body").removeClass("hid");

    document.querySelector(".form-v").reset();
    $(".form-input-wrap input").removeClass("valid error");
  });
}, 0);

// checkbox

$("#check-c").click(function () {
  var checked_status = this.checked;
  if (checked_status == true) {
    $(".btn-cont").addClass("active");
  } else {
    $(".btn-cont").removeClass("active");
  }
});

$("#check").click(function () {
  var checked_status = this.checked;
  if (checked_status == true) {
    $(".btn-vac").addClass("active");
  } else {
    $(".btn-vac").removeClass("active");
  }
});

// menu

$(".burger").click(function () {
  $(".menu").addClass("active");
  $("body").addClass("hid");
});

$(".close-menu").click(function () {
  $(".menu").removeClass("active");
  $("body").removeClass("hid");
});

// show-all-vac , overflow scroll-all-vac, link-hide-all-vac

$(".link-show-all-vac").on("click", function (e) {
  e.preventDefault();

  $(".hide-vac").slideDown(400);
  $(this).css("display", "none");
  $(".link-hide-all-vac").css("display", "block");

  $(".swiper-slide-four").addClass("scrollable-content");

  /*-----*/

  $(".scrollable-content .vacancies").removeClass("mid");

  /*-----*/

  $(".scrollable-content").on("mousewheel", function (e) {
    e.stopPropagation();
  });
  $("#four-slide .swiper-image").addClass("top");
});

$(".link-hide-all-vac").click(function (e) {
  e.preventDefault();

  $(".scrollable-content").off("mousewheel");

  $(".hide-vac").slideUp(400);
  $(this).css("display", "none");
  $(".link-show-all-vac").css("display", "block");

  /*-----*/

  $(".scrollable-content .vacancies").addClass("mid");

  /*-----*/

  setTimeout(function () {
    $(".swiper-slide-four").removeClass("scrollable-content");
  }, 500);

  $("#four-slide .swiper-image").removeClass("top");
});

// file input

var fileInput = document.querySelector(".input-file-d"),
  button = document.querySelector(".btn-file-d"),
  the_return = document.querySelector(".file-return-d");

button.addEventListener("keydown", function (event) {
  if (event.keyCode == 13 || event.keyCode == 32) {
    fileInput.focus();
  }
});
button.addEventListener("click", function (event) {
  fileInput.focus();
  return false;
});

fileInput.addEventListener("change", function (event) {
  let FileSize = this.files[0].size / 1024 / 1024; // in MB
  if (FileSize > 5) {
    the_return.innerHTML = "загрузите файл размером до 5 mb";
    the_return.style.color = "red";
    this.value = null;
  } else {
    // the_return.innerHTML = this.value;
    the_return.style.color = "#585858";
  }
});

var fileInputC = document.querySelector(".input-file-c"),
  buttonC = document.querySelector(".btn-file-c"),
  the_returnC = document.querySelector(".file-return-c");

buttonC.addEventListener("keydown", function (event) {
  if (event.keyCode == 13 || event.keyCode == 32) {
    fileInputC.focus();
  }
});
buttonC.addEventListener("click", function (event) {
  fileInputC.focus();
  return false;
});

fileInputC.addEventListener("change", function (event) {
  let FileSize = this.files[0].size / 1024 / 1024; // in MB
  console.log("FileSize--cont", FileSize);
  if (FileSize > 5) {
    the_returnC.innerHTML = "загрузите файл размером до 5 mb";
    the_returnC.style.color = "red";
    this.value = null;
  } else {
    // the_returnC.innerHTML = this.value;
    the_returnC.style.color = "#585858";
  }
});

function positionPagination() {
  let wrap = document.querySelector(".swiper-wrapper");
  let positionPagination = wrap.offsetLeft + wrap.offsetWidth;
  let pagination = document.querySelector(".swiper-pagination");
  pagination.style.left = positionPagination + "px";
}

window.onload = function () {
  positionPagination();
};

window.onresize = function () {
  positionPagination();
};

// load vacancies list

const randomLinearGradient = () => {
  const randomRBAColor = () => Math.round(Math.random() * 255)
  return `linear-gradient(109.18deg, rgba(${randomRBAColor()},${randomRBAColor()},${randomRBAColor()}, 0.1), rgba(${randomRBAColor()},${randomRBAColor()},${randomRBAColor()}, 0.1))`
}

$(document).ready(function () {

  const activeVacancies = Object.values(data).filter(item => !item.closeVac && item.visibility)

  activeVacancies.forEach((vacancy, i) => {
    $(".hero-cards #link-vak-all").before(`
    <div class="item link-vak" data-position="${vacancy.buttonData}" style="background: ${randomLinearGradient()}">
      <div class="item-top">
        <img src="${vacancy.icon}" alt="icon">
          <div class="item-text">
            <div class="item-title">${vacancy.position}</div>
            <span>Опыт работы: ${vacancy.experience}</span>
          </div>

      </div>
      <a href="javascript:void(0)" class="link-vak link-top" data-position="${vacancy.buttonData}">
        Смотреть вакансию <img src="./img/arr-r-green.svg" alt="icon" class="arr-r">
      </a>
      <div class="number">${++i}</div>
    </div>
    `)
  })

  Object.keys(data).forEach((key, i) => {
    if (data[key].closeVac) {
      $(this).addClass("btn-vac-close");
      console.log();
    }

    $(".vacancies-wrap .first").append(`<li>
    <div class="left">
      <div class="wrap-img">
        <img src="${data[key].icon}" alt="icon" />
      </div>
  
      <div class="vacancies-pos">
        <span class="title">${data[key].position}</span>
        <span class="subtitle">Опыт работы: ${data[key].experience}</span>
      </div>
    </div>
    <div class="right">
      <div>
        <span class="text">${data[key].officeLocation}</span>
        <span class="text">${data[key].collaborationVariant}</span>
      </div>

    
        <button type="button" class= "${
          data[key].closeVac
            ? `btn-fill vacancies-close link-vak`
            : `btn-fill link-vak`
        }"  data-position="${data[key].buttonData}" data-position="${
      data[key].buttonData
    }">
        Открыть подробности
        <svg width="20" height="10" viewBox="0 0 20 10" fill="" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19.7709 4.44699C19.7706 4.44676 19.7704 4.44648 19.7702 4.44625L15.688 0.383747C15.3821 0.0794115 14.8875 0.0805441 14.5831 0.386403C14.2787 0.692224 14.2799 1.18687 14.5857 1.49125L17.3265 4.21875H0.78125C0.349766 4.21875 0 4.56851 0 5C0 5.43148 0.349766 5.78125 0.78125 5.78125H17.3264L14.5857 8.50875C14.2799 8.81312 14.2788 9.30777 14.5831 9.61359C14.8875 9.91949 15.3822 9.92054 15.688 9.61625L19.7702 5.55375C19.7704 5.55351 19.7706 5.55324 19.7709 5.55301C20.0769 5.24761 20.0759 4.75136 19.7709 4.44699Z"
            fill="white" />
        </svg>
      </button>
      
     
    </div>
  </li>`);
  });

  Object.keys(dataHide).forEach((key) => {
    // console.log(dataHide[key]);

    $(".vacancies-wrap .hide-vac").append(`<li>
    <div class="left">
      <div class="wrap-img">
        <img src="${dataHide[key].icon}" alt="icon" />
      </div>

      <div class="vacancies-pos">
        <span class="title">${dataHide[key].position}</span>
        <span class="subtitle">Опыт работы: ${dataHide[key].experience}</span>
      </div>
    </div>
    <div class="right">
      <div>
        <span class="text">${dataHide[key].officeLocation}</span>
        <span class="text">${dataHide[key].collaborationVariant}</span>
      </div>
      <button type="button" class= "${
        dataHide[key].closeVac
          ? `btn-fill vacancies-close link-vak-hide`
          : `btn-fill link-vak-hide`
      }" data-position="${dataHide[key].buttonData}">
        Открыть подробности
        <svg width="20" height="10" viewBox="0 0 20 10" fill="" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M19.7709 4.44699C19.7706 4.44676 19.7704 4.44648 19.7702 4.44625L15.688 0.383747C15.3821 0.0794115 14.8875 0.0805441 14.5831 0.386403C14.2787 0.692224 14.2799 1.18687 14.5857 1.49125L17.3265 4.21875H0.78125C0.349766 4.21875 0 4.56851 0 5C0 5.43148 0.349766 5.78125 0.78125 5.78125H17.3264L14.5857 8.50875C14.2799 8.81312 14.2788 9.30777 14.5831 9.61359C14.8875 9.91949 15.3822 9.92054 15.688 9.61625L19.7702 5.55375C19.7704 5.55351 19.7706 5.55324 19.7709 5.55301C20.0769 5.24761 20.0759 4.75136 19.7709 4.44699Z"
            fill="white" />
        </svg>
      </button>
    </div>
  </li>`);
  });

  if (Object.keys(dataHide).length != 0) {
    // console.log("true");
    $(".link-show-all-vac").css("display", "block");
  } else {
    // console.log("falser");
    $(".link-show-all-vac").css("display", "none");
  }

  $(".vacancies-close").text("Вакансия закрыта");
});

// show desc vacancies click

const openVacancy = (vacancyName, isOpenedByClickButton) => {

  if (isOpenedByClickButton) {
    const params = new URLSearchParams(location.search);
    params.set('vacancy', data[vacancyName].id);
    window.history.replaceState({}, '', `${location.pathname}?${params}`);
  }

  Object.keys(data[vacancyName].inside).forEach((key) => {
    $("#vacansie-title").text(data[vacancyName].position);
    $("#vacansie-description").text(data[vacancyName].description);

    $(".need").append(`<span class="desc-subtitle">${
        data[vacancyName].inside[key].title
    }</span>
      <ul class="position-requirements">
      ${data[vacancyName].inside[key].p.map((el) => `<li>${el}</li>`).join("")}</ul>`);
  });

  $(".desc").addClass("active");
  $("body").addClass("hid");
}


const openVacancyByQueryParameter = () => {
  const queryParameters = new URLSearchParams(window.location.search.substring(1));
  const vacancy = queryParameters.get("vacancy");
  if (vacancy) {
    Object.keys(data).forEach(item => {
      if(data[item].id === +vacancy && !data[item].closeVac) {
        openVacancy(item)
      }
    })
  }
}

setTimeout(() => {
  openVacancyByQueryParameter()
}, 0);


setTimeout(() => {
  $(".link-vak").click(function () {
    let pos = $(this).data("position");
    openVacancy(pos, true)
  });
}, 0);

setTimeout(() => {
  $(".link-vak-hide").click(function () {
    let pos = $(this).data("position");
    // console.log($(this));

    Object.keys(dataHide[pos].inside).forEach((key) => {
      $(".need").append(`<span class="desc-subtitle">${
        dataHide[pos].inside[key].title
      }</span>
      <ul class="position-requirements">
      ${dataHide[pos].inside[key].p.map((el) => `<li>${el}</li>`).join("")}
    
      </ul>
      `);
    });

    $(".desc").addClass("active");
    $("body").addClass("hid");
  });
}, 0);

$(".close-desc").click(function () {
  window.history.pushState({}, document.title, '/');
  $(".need").empty();
  $(".desc").removeClass("active");
  $("body").removeClass("hid");
  document.querySelector(".form-v").reset();
  $(".form-input-wrap input").removeClass("valid error");
  $(".file-return-d").text(" ");
});
/*!
 * Форма обратной связи (https://itchief.ru/lessons/php/feedback-form-for-website)
 * Copyright 2016-2018 Alexander Maltsev
 * Licensed under MIT (https://github.com/itchief/feedback-form/blob/master/LICENSE)
 */

"use strict";

var ProcessForm = function (config) {
  var _config = {
    selector: "#feedback-form", // селектор формы обратной связи
    isCaptcha: false, // наличие капчи
    isAgreement: false, // наличие пользовательского соглашения
    isAttachments: true, // наличие блока для прикрепления файлов
    customFileText: "",
    maxSizeFile: 5.5, // максмальный размер файла в мегабайтах
    validFileExtensions: ["jpg", "jpeg", "doc", "pdf", "png"],
    codeFragmentAttachment:
      '<div class="form-group">' +
      '<div class="custom-file">' +
      '<input name="attachment[]" type="file" class="custom-file-input" id="validatedCustomFile" lang="ru">' +
      '<label class="custom-file-label" for="validatedCustomFile">Выберите файл...</label>' +
      '<div class="invalid-feedback"></div>' +
      "</div>" +
      "</div>",
  };
  for (var prop in config) {
    _config[prop] = config[prop];
  }
  this.getConfig = function () {
    return _config;
  };
  this.getForm = function () {
    return $(_config.selector)[0];
  };
  this.setIsCaptcha = function (value) {
    _config.isCaptcha = value;
  };
  this.setIsAgreement = function (value) {
    _config.isAgreement = value;
  };
  this.setIsAttachments = function (value) {
    _config.isAttachments = value;
  };
};

ProcessForm.prototype = (function () {
  // переключить во включенное или выключенное состояние кнопку submit
  var _changeStateSubmit = function (form, state) {
    $(form).find('[type="submit"]').prop("disabled", state);
  };

  // изменение состояния кнопки submit в зависимости от состояния checkbox agree
  var _changeAgreement = function (form, state) {
    _changeStateSubmit(form, state);
  };

  // обновление капчи
  var _refreshCaptcha = function (form) {
    var captchaImg = $(form).find(".img-captcha"),
      captchaSrc = captchaImg.attr("data-src"),
      captchaPrefix = captchaSrc.indexOf("?id") !== -1 ? "&rnd=" : "?rnd=",
      captchaNewSrc = captchaSrc + captchaPrefix + new Date().getTime();
    captchaImg.attr("src", captchaNewSrc);
  };

  // изменение состояния элемента формы (success, error, clear)
  var _setStateValidaion = function (input, state, message) {
    input = $(input);
    if (state === "error") {
      input
        .removeClass("is-valid")
        .addClass("is-invalid")
        .siblings(".invalid-feedback")
        .text(message);
    } else if (state === "success") {
      input.removeClass("is-invalid").addClass("is-valid");
    } else {
      input.removeClass("is-valid is-invalid");
    }
  };

  // метод, возвращающий результат проверки расширения файла допустимому
  var _validateFileExtension = function (filename, validFileExtensions) {
    // получаем расширение файла
    var fileExtension = filename.slice(
      ((filename.lastIndexOf(".") - 1) >>> 0) + 2
    );
    // если есть расширение, то проверяем соотвествует ли оно допустимому
    if (fileExtension) {
      for (var i = 0; i <= validFileExtensions.length; i++) {
        if (validFileExtensions[i] === fileExtension.toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  };

  // валилация формы
  var _validateForm = function (form) {
    var valid = true;
    $(form)
      .find("input, textarea")
      .not('[type="file"], [name="agree"]')
      .each(function () {
        if (this.checkValidity()) {
          _setStateValidaion(this, "success");
        } else {
          _setStateValidaion(this, "error", this.validationMessage);
          valid = false;
        }
      });
    return valid;
  };

  var _showForm = function (_this) {
    var form = _this.getForm(),
      $form = $(form);
    if (!$form.find(".form-error").hasClass("d-none")) {
      $form.find(".form-error").addClass("d-none");
    }
    $form
      .siblings(".form-result-success")
      .addClass("d-none")
      .removeClass("d-flex");
    form.reset();
    $form.find("input, textarea").each(function () {
      _setStateValidaion(this, "clear");
    });
    if (_this.getConfig().isCaptcha) {
      _refreshCaptcha(form);
    }
    if (_this.getConfig().isAgreeCheckbox) {
      _changeStateSubmit(form, true);
    } else {
      _changeStateSubmit(form, false);
    }
    if (_this.getConfig().isAttachments) {
      $(".attachments").html(_this.getConfig().codeFragmentAttachment);
    }
    if ($(_this.getConfig().selector + " .progress-bar").length) {
      $(_this.getConfig().selector + " .progress-bar")
        .attr("aria-valuenow", "0")
        .width("0")
        .find(".sr-only")
        .text("0%");
    }
  };

  // изменение элемента input с type="file"
  var _changeInputFile = function (e, _this) {
    $(e.currentTarget)
      .removeClass("is-invalid is-valid")
      .parent()
      .find(".invalid-feedback")
      .text("");

    // условия для добавления нового элемента input с type="file"
    var isSelectFile = e.currentTarget.files.length > 0;
    var isNextInput =
      $(e.currentTarget).closest(".custom-files").next(".custom-files")
        .length === 0;
    var isMaxInput =
      $(_this.getConfig().selector + ' input[name="attachment[]"]').length <
      $(_this.getConfig().selector + " .attachments").attr("data-counts");
    if (isSelectFile && isNextInput && isMaxInput) {
      $(e.currentTarget)
        .closest(".form-group")
        .after(_this.getConfig().codeFragmentAttachment);
    }
    // если файл выбран, то выполняем следующие действия...
    if (e.currentTarget.files.length > 0) {
      // получим файл
      var file = e.currentTarget.files[0];
      // if ($(e.target).next("label").length > 0) {
      //   $(e.target).next("label").text(file.name);
      // }
      // проверим размер и расширение файла
      if (file.size > _this.getConfig().maxSizeFile * 1024 * 1024) {
        $(e.currentTarget)
          .addClass("is-invalid")
          .parent()
          .find(".invalid-feedback")
          .text(
            "*Файл не будет отправлен, т.к. его размер больше " +
              _this.getConfig().maxSizeFile * 1024 +
              "Кбайт"
          );
        // console.log(
        //   "*Файл не будет отправлен, т.к. его размер больше " +
        //     _this.getConfig().maxSizeFile * 1024 +
        //     "Кбайт"
        // );
      } else if (
        !_validateFileExtension(
          file.name,
          _this.getConfig().validFileExtensions
        )
      ) {
        $(e.currentTarget)
          .addClass("is-invalid")
          .parent()
          .find(".invalid-feedback")
          .text(
            "*Файл не будет отправлен, т.к. его тип не соответствует разрешённому"
          );
      } else {
        $(e.currentTarget).addClass("is-valid");

        if ($(e.currentTarget).next("p")) {
          $(e.currentTarget).next("p").text("");
        }
      }
    } else {
      // если после изменения файл не выбран, то сообщаем об этом пользователю
      $(e.currentTarget)
        .next("p")
        .text("* Файл не будет отправлен, т.к. он не выбран");
      $(e.target).next("label").text("Выберите файл...");
    }
  };

  var _changeStateImages = function (config, state) {
    if (!config.isAttachments) {
      return;
    }
    var files = $(config.selector).find('[name="attachment[]"]'),
      index = 0;
    for (var i = 0; i < files.length; i++) {
      // получить список файлов элемента input с type="file"
      var fileList = files[i].files;
      // если элемент не содержит файлов, то перейти к следующему
      if (fileList.length > 0) {
        // получить первый файл из списка
        var file = fileList[0];
        // проверить тип файла и размер
        if (
          !_validateFileExtension(file.name, config.validFileExtensions) &&
          file.size < config.maxSizeFile * 1024 * 1024
        ) {
          $(files[i]).prop("disabled", state);
          $(files[i]).attr("data-index", "-1");
          console.log();
        } else {
          $(files[i]).attr("data-index", index++);
        }
      } else {
        $(files[i]).prop("disabled", state);
        $(files[i]).attr("data-index", "-1");
      }
    }
  };

  // собираем данные для отправки на сервер
  var _collectData = function (_this, config) {
    _changeStateImages(config, true);
    var output = new FormData(_this);
    _changeStateImages(config, false);
    return output;
  };

  // отправка формы
  var _sendForm = function (_this, config) {
    if (!_validateForm(_this)) {
      if ($(_this).find(".is-invalid").length > 0) {
        $(_this).find(".is-invalid")[0].focus();
      }
      return;
    }
    if (!$(_this).find(".form-error").hasClass("d-none")) {
      $(_this).find(".form-error").addClass("d-none");
    }

    var form = $("#feedback-form")[0];
    let data = new FormData(form);
    $.ajax({
      context: _this,
      type: "POST",
      url: $(_this).attr("action"),
      // data: _collectData(_this, config), // данные для отправки на сервер
      data: data,
      contentType: false,
      processData: false,
      cache: false,
      beforeSend: function () {
        _changeStateSubmit(_this, true);
      },
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if ($(config.selector + " .progress").hasClass("d-none")) {
          $(config.selector + " .progress").removeClass("d-none");
        }
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            function (event) {
              // если известно количество байт для пересылки
              if (event.lengthComputable) {
                // получаем общее количество байт для пересылки
                var total = event.total;
                // получаем какое количество байт уже отправлено
                var loaded = event.loaded;
                // определяем процент отправленных данных на сервер
                var progress = ((loaded * 100) / total).toFixed(1);
                // обновляем состояние прогресс бара Bootstrap
                var progressBar = $(config.selector + " .progress-bar");
                progressBar.attr("aria-valuenow", progress);
                progressBar.width(progress + "%");
                progressBar.find(".sr-only").text(progress + "%");
              }
            },
            false
          );
        }
        return myXhr;
      },
    })
      .done(
        _success,
        console.log("_collectData(_this, config)", _collectData(_this, config))
      )
      .fail(_error);
  };

  // при получении успешного ответа от сервера
  var _success = function (data) {
    var _this = this;
    if ($(this).find(".progress").length) {
      $(this)
        .find(".progress")
        .addClass("d-none")
        .find(".progress-bar")
        .attr("aria-valuenow", "0")
        .width("0")
        .find(".sr-only")
        .text("0%");
    }

    // при успешной отправки формы
    if (data.result === "success") {
      $(this)
        .parent()
        .find(".form-result-success")
        .removeClass("d-none")
        .addClass("d-flex");
      return;
    }
    // если произошли ошибки при отправке
    $(this).find(".form-error").removeClass("d-none");
    _changeStateSubmit(this, false);

    // выводим ошибки которые прислал сервер
    for (var error in data) {
      if (!data.hasOwnProperty(error)) {
        continue;
      }
      switch (error) {
        case "captcha":
          _refreshCaptcha($(this));
          _setStateValidaion(
            $(this).find('[name="' + error + '"]'),
            "error",
            data[error]
          );
          break;
        case "attachment":
          $.each(data[error], function (key, value) {
            console.log(
              '[name="attachment[]"][data-index="' + key + '"],--',
              data[error]
            );
            _setStateValidaion(
              $(_this).find('[name="attachment[]"][data-index="' + key + '"]'),
              "error",
              value
            );
          });
          break;
        case "log":
          $.each(data[error], function (key, value) {
            console.log(value);
          });
          break;
        default:
          _setStateValidaion(
            $(this).find('[name="' + error + '"]'),
            "error",
            data[error]
          );
      }
      // устанавливаем фокус на 1 невалидный элемент
      if ($(this).find(".is-invalid").length > 0) {
        $(this).find(".is-invalid")[0].focus();
      }
    }
  };

  // если не получили успешный ответ от сервера
  var _error = function (request) {
    $(this).find(".form-error").removeClass("d-none");
  };

  // функция для инициализации
  var _init = function () {
    this.setIsCaptcha($(this.getForm()).find(".captcha").length > 0); // имеется ли у формы секция captcha
    this.setIsAgreement($(this.getForm()).find(".agreement").length > 0); // имеется ли у формы секция agreement
    this.setIsAttachments($(this.getForm()).find(".attachments").length > 0); // имеется ли у формы секция attachments
    _setupListener(this);
  };

  // устанавливаем обработчики событий
  var _setupListener = function (_this) {
    $(document).on(
      "change",
      _this.getConfig().selector + ' [name="agree"]',
      function () {
        _changeAgreement(_this.getForm(), !this.checked);
      }
    );
    $(document).on("submit", _this.getConfig().selector, function (e) {
      e.preventDefault();
      _sendForm(_this.getForm(), _this.getConfig());
    });
    $(document).on(
      "click",
      _this.getConfig().selector + " .refresh-captcha",
      function (e) {
        e.preventDefault();
        _refreshCaptcha(_this.getForm());
      }
    );
    $(document).on(
      "click",
      '[data-reloadform="' + _this.getConfig().selector + '"]',
      function (e) {
        e.preventDefault();
        _showForm(_this);
      }
    );
    if (_this.getConfig().isAttachments) {
      //$('#' + this.idForm + ' .countFiles').text(this.countFiles);
      // добавление нового элемента input с type="file"
      $(document).on(
        "change",
        _this.getConfig().selector + ' input[name="attachment[]"]',
        function (e) {
          _changeInputFile(e, _this);
        }
      );
    }
  };
  return {
    init: _init,
  };
})();

/*!
 * Форма обратной связи (https://itchief.ru/lessons/php/feedback-form-for-website)
 * Copyright 2016-2018 Alexander Maltsev
 * Licensed under MIT (https://github.com/itchief/feedback-form/blob/master/LICENSE)
 */

"use strict";

var ProcessForm2 = function (config) {
  var _config = {
    selector: "#feedback-form2", // селектор формы обратной связи
    isCaptcha: false, // наличие капчи
    isAgreement: true, // наличие пользовательского соглашения
    isAttachments: true, // наличие блока для прикрепления файлов
    customFileText: "",
    maxSizeFile: 5.5, // максмальный размер файла в мегабайтах
    validFileExtensions: ["doc", "pdf"],
    codeFragmentAttachment:
      '<div class="form-group">' +
      '<div class="custom-file">' +
      '<input name="attachment[]" type="file" class="custom-file-input" id="validatedCustomFile" lang="ru">' +
      '<label class="custom-file-label" for="validatedCustomFile">Выберите файл...</label>' +
      '<div class="invalid-feedback"></div>' +
      "</div>" +
      "</div>",
  };
  for (var prop in config) {
    _config[prop] = config[prop];
  }
  this.getConfig = function () {
    return _config;
  };
  this.getForm = function () {
    return $(_config.selector)[0];
  };
  this.setIsCaptcha = function (value) {
    _config.isCaptcha = value;
  };
  this.setIsAgreement = function (value) {
    _config.isAgreement = value;
  };
  this.setIsAttachments = function (value) {
    _config.isAttachments = value;
  };
};

ProcessForm2.prototype = (function () {
  // переключить во включенное или выключенное состояние кнопку submit
  var _changeStateSubmit = function (form, state) {
    $(form).find('[type="submit"]').prop("disabled", state);
  };

  // изменение состояния кнопки submit в зависимости от состояния checkbox agree
  var _changeAgreement = function (form, state) {
    _changeStateSubmit(form, state);
  };

  // обновление капчи
  var _refreshCaptcha = function (form) {
    var captchaImg = $(form).find(".img-captcha"),
      captchaSrc = captchaImg.attr("data-src"),
      captchaPrefix = captchaSrc.indexOf("?id") !== -1 ? "&rnd=" : "?rnd=",
      captchaNewSrc = captchaSrc + captchaPrefix + new Date().getTime();
    captchaImg.attr("src", captchaNewSrc);
  };

  // изменение состояния элемента формы (success, error, clear)
  var _setStateValidaion = function (input, state, message) {
    input = $(input);
    if (state === "error") {
      input
        .removeClass("is-valid")
        .addClass("is-invalid")
        .siblings(".invalid-feedback")
        .text(message);
    } else if (state === "success") {
      input.removeClass("is-invalid").addClass("is-valid");
    } else {
      input.removeClass("is-valid is-invalid");
    }
  };

  // метод, возвращающий результат проверки расширения файла допустимому
  var _validateFileExtension = function (filename, validFileExtensions) {
    // получаем расширение файла
    var fileExtension = filename.slice(
      ((filename.lastIndexOf(".") - 1) >>> 0) + 2
    );
    // если есть расширение, то проверяем соотвествует ли оно допустимому
    if (fileExtension) {
      for (var i = 0; i <= validFileExtensions.length; i++) {
        if (validFileExtensions[i] === fileExtension.toLowerCase()) {
          return true;
        }
      }
    }
    return false;
  };

  // валилация формы
  var _validateForm = function (form) {
    var valid = true;
    $(form)
      .find("input, textarea")
      .not('[type="file"], [name="agree"]')
      .each(function () {
        if (this.checkValidity()) {
          _setStateValidaion(this, "success");
        } else {
          _setStateValidaion(this, "error", this.validationMessage);
          valid = false;
        }
      });
    return valid;
  };

  var _showForm = function (_this) {
    var form = _this.getForm(),
      $form = $(form);
    if (!$form.find(".form-error").hasClass("d-none")) {
      $form.find(".form-error").addClass("d-none");
    }
    $form
      .siblings(".form-result-success")
      .addClass("d-none")
      .removeClass("d-flex");
    form.reset();
    $form.find("input, textarea").each(function () {
      _setStateValidaion(this, "clear");
    });
    if (_this.getConfig().isCaptcha) {
      _refreshCaptcha(form);
    }
    if (_this.getConfig().isAgreeCheckbox) {
      _changeStateSubmit(form, true);
    } else {
      _changeStateSubmit(form, false);
    }
    if (_this.getConfig().isAttachments) {
      $(".attachments").html(_this.getConfig().codeFragmentAttachment);
    }
    if ($(_this.getConfig().selector + " .progress-bar").length) {
      $(_this.getConfig().selector + " .progress-bar")
        .attr("aria-valuenow", "0")
        .width("0")
        .find(".sr-only")
        .text("0%");
    }
  };

  // изменение элемента input с type="file"
  var _changeInputFile = function (e, _this) {
    $(e.currentTarget)
      .removeClass("is-invalid is-valid")
      .parent()
      .find(".invalid-feedback")
      .text("");

    // условия для добавления нового элемента input с type="file"
    var isSelectFile = e.currentTarget.files.length > 0;
    var isNextInput =
      $(e.currentTarget).closest(".custom-files").next(".custom-files")
        .length === 0;
    var isMaxInput =
      $(_this.getConfig().selector + ' input[name="attachment[]"]').length <
      $(_this.getConfig().selector + " .attachments").attr("data-counts");
    if (isSelectFile && isNextInput && isMaxInput) {
      $(e.currentTarget)
        .closest(".form-group")
        .after(_this.getConfig().codeFragmentAttachment);
    }
    // если файл выбран, то выполняем следующие действия...
    if (e.currentTarget.files.length > 0) {
      // получим файл
      var file = e.currentTarget.files[0];
      // if ($(e.target).next("label").length > 0) {
      //   $(e.target).next("label").text(file.name);
      // }
      // проверим размер и расширение файла
      if (file.size > _this.getConfig().maxSizeFile * 1024 * 1024) {
        $(e.currentTarget)
          .addClass("is-invalid")
          .parent()
          .find(".invalid-feedback")
          .text(
            "*Файл не будет отправлен, т.к. его размер больше " +
              _this.getConfig().maxSizeFile * 1024 +
              "Кбайт"
          );
      } else if (
        !_validateFileExtension(
          file.name,
          _this.getConfig().validFileExtensions
        )
      ) {
        $(e.currentTarget)
          .addClass("is-invalid")
          .parent()
          .find(".invalid-feedback")
          .text(
            "*Файл не будет отправлен, т.к. его тип не соответствует разрешённому"
          );
      } else {
        $(e.currentTarget).addClass("is-valid");

        if ($(e.currentTarget).next("p")) {
          $(e.currentTarget).next("p").text("");
        }
      }
    } else {
      // если после изменения файл не выбран, то сообщаем об этом пользователю
      $(e.currentTarget)
        .next("p")
        .text("* Файл не будет отправлен, т.к. он не выбран");
      $(e.target).next("label").text("Выберите файл...");
    }
  };

  var _changeStateImages = function (config, state) {
    if (!config.isAttachments) {
      return;
    }
    var files = $(config.selector).find('[name="attachment[]"]'),
      index = 0;
    for (var i = 0; i < files.length; i++) {
      // получить список файлов элемента input с type="file"
      var fileList = files[i].files;
      // если элемент не содержит файлов, то перейти к следующему
      if (fileList.length > 0) {
        // получить первый файл из списка
        var file = fileList[0];
        // проверить тип файла и размер
        if (
          !_validateFileExtension(file.name, config.validFileExtensions) &&
          file.size < config.maxSizeFile * 1024 * 1024
        ) {
          $(files[i]).prop("disabled", state);
          $(files[i]).attr("data-index", "-1");
        } else {
          $(files[i]).attr("data-index", index++);
        }
      } else {
        $(files[i]).prop("disabled", state);
        $(files[i]).attr("data-index", "-1");
      }
    }
  };

  // собираем данные для отправки на сервер
  var _collectData = function (_this, config) {
    _changeStateImages(config, true);
    var output = new FormData(_this);
    _changeStateImages(config, false);
    return output;
  };

  // отправка формы
  var _sendForm = function (_this, config) {
    if (!_validateForm(_this)) {
      if ($(_this).find(".is-invalid").length > 0) {
        $(_this).find(".is-invalid")[0].focus();
      }
      return;
    }
    if (!$(_this).find(".form-error").hasClass("d-none")) {
      $(_this).find(".form-error").addClass("d-none");
    }

    var form = $("#feedback-form2")[0];
    let data = new FormData(form);
    $.ajax({
      context: _this,
      type: "POST",
      url: $(_this).attr("action"),
      // data: _collectData(_this, config), // данные для отправки на сервер
      data: data,
      contentType: false,
      processData: false,
      cache: false,
      beforeSend: function () {
        _changeStateSubmit(_this, true);
      },
      xhr: function () {
        var myXhr = $.ajaxSettings.xhr();
        if ($(config.selector + " .progress").hasClass("d-none")) {
          $(config.selector + " .progress").removeClass("d-none");
        }
        if (myXhr.upload) {
          myXhr.upload.addEventListener(
            "progress",
            function (event) {
              // если известно количество байт для пересылки
              if (event.lengthComputable) {
                // получаем общее количество байт для пересылки
                var total = event.total;
                // получаем какое количество байт уже отправлено
                var loaded = event.loaded;
                // определяем процент отправленных данных на сервер
                var progress = ((loaded * 100) / total).toFixed(1);
                // обновляем состояние прогресс бара Bootstrap
                var progressBar = $(config.selector + " .progress-bar");
                progressBar.attr("aria-valuenow", progress);
                progressBar.width(progress + "%");
                progressBar.find(".sr-only").text(progress + "%");
              }
            },
            false
          );
        }
        return myXhr;
      },
    })
      .done(
        _success,
        console.log("_collectData(_this, config)", _collectData(_this, config))
      )
      .fail(_error);
  };

  // при получении успешного ответа от сервера
  var _success = function (data) {
    var _this = this;
    if ($(this).find(".progress").length) {
      $(this)
        .find(".progress")
        .addClass("d-none")
        .find(".progress-bar")
        .attr("aria-valuenow", "0")
        .width("0")
        .find(".sr-only")
        .text("0%");
    }

    // при успешной отправки формы
    if (data.result === "success") {
      $(this)
        .parent()
        .find(".form-result-success")
        .removeClass("d-none")
        .addClass("d-flex");
      return;
    }
    // если произошли ошибки при отправке
    $(this).find(".form-error").removeClass("d-none");
    _changeStateSubmit(this, false);

    // выводим ошибки которые прислал сервер
    for (var error in data) {
      if (!data.hasOwnProperty(error)) {
        continue;
      }
      switch (error) {
        case "captcha":
          _refreshCaptcha($(this));
          _setStateValidaion(
            $(this).find('[name="' + error + '"]'),
            "error",
            data[error]
          );
          break;
        case "attachment":
          $.each(data[error], function (key, value) {
            console.log('[name="attachment[]"][data-index="' + key + '"]');
            _setStateValidaion(
              $(_this).find('[name="attachment[]"][data-index="' + key + '"]'),
              "error",
              value
            );
          });
          break;
        case "log":
          $.each(data[error], function (key, value) {
            console.log(value);
          });
          break;
        default:
          _setStateValidaion(
            $(this).find('[name="' + error + '"]'),
            "error",
            data[error]
          );
      }
      // устанавливаем фокус на 1 невалидный элемент
      if ($(this).find(".is-invalid").length > 0) {
        $(this).find(".is-invalid")[0].focus();
      }
    }
  };

  // если не получили успешный ответ от сервера
  var _error = function (request) {
    $(this).find(".form-error").removeClass("d-none");
  };

  // функция для инициализации
  var _init2 = function () {
    this.setIsCaptcha($(this.getForm()).find(".captcha").length > 0); // имеется ли у формы секция captcha
    this.setIsAgreement($(this.getForm()).find(".agreement").length > 0); // имеется ли у формы секция agreement
    this.setIsAttachments($(this.getForm()).find(".attachments").length > 0); // имеется ли у формы секция attachments
    _setupListener(this);
  };

  // устанавливаем обработчики событий
  var _setupListener = function (_this) {
    $(document).on(
      "change",
      _this.getConfig().selector + ' [name="agree"]',
      function () {
        _changeAgreement(_this.getForm(), !this.checked);
      }
    );
    $(document).on("submit", _this.getConfig().selector, function (e) {
      e.preventDefault();
      _sendForm(_this.getForm(), _this.getConfig());
    });
    $(document).on(
      "click",
      _this.getConfig().selector + " .refresh-captcha",
      function (e) {
        e.preventDefault();
        _refreshCaptcha(_this.getForm());
      }
    );
    $(document).on(
      "click",
      '[data-reloadform="' + _this.getConfig().selector + '"]',
      function (e) {
        e.preventDefault();
        _showForm(_this);
      }
    );
    if (_this.getConfig().isAttachments) {
      //$('#' + this.idForm + ' .countFiles').text(this.countFiles);
      // добавление нового элемента input с type="file"
      $(document).on(
        "change",
        _this.getConfig().selector + ' input[name="attachment[]"]',
        function (e) {
          _changeInputFile(e, _this);
        }
      );
    }
  };
  return {
    init2: _init2,
  };
})();
