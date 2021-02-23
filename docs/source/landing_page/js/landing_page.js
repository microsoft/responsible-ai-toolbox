$(document).ready(function () {
  // executes when HTML-Document is loaded and DOM is ready
  console.log("document is ready");

  $(document).click(function (event) {
    var clickover = $(event.target);
    var _opened = $(".navbar-collapse").hasClass("show");
    if (_opened === true && !clickover.hasClass("navbar-toggler")) {
      $(".navbar-toggler").click();
    }
  });
});
