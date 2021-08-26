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

$(document).ready(function () {
  Object.keys(data).forEach((key, i) => {
    // console.log(data[key]);
    // console.log(data[key].closeVac);

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

setTimeout(() => {
  $(".link-vak").click(function () {
    let pos = $(this).data("position");
    // console.log($(this));
    // console.log("data[pos]---", data[pos].inside);

    Object.keys(data[pos].inside).forEach((key) => {
      // console.log("----------", data[pos].inside[key].p);
      // console.log("----------", data[pos].inside[key].title);
      $("#vacansie-title").text(data[pos].position);
      $("#vacansie-description").text(data[pos].description);

      $(".need").append(`<span class="desc-subtitle">${
        data[pos].inside[key].title
      }</span>
      <ul class="position-requirements">
      ${data[pos].inside[key].p.map((el) => `<li>${el}</li>`).join("")}</ul>`);
    });

    $(".desc").addClass("active");
    $("body").addClass("hid");
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
  $(".need").empty();
  $(".desc").removeClass("active");
  $("body").removeClass("hid");
  document.querySelector(".form-v").reset();
  $(".form-input-wrap input").removeClass("valid error");
  $(".file-return-d").text(" ");
});
