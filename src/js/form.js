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
