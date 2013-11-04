(function () {
  var $slideout = $("#slideout");
  $("#slideclick").on("click", function () {
    if ($slideout.hasClass("popped")) {
      $slideout.animate({left: "-222px"}, {queue: false, duration: 500}).removeAttr("class");
    } else {
      $slideout.animate({left: "0px" }, {queue: false, duration: 500}).addClass("popped");
    }
  });
  $("ul ul").hide();
  $("ul li.expanded > a").removeAttr("href");
  $("ul li.expanded > a").click(function () {
    $(this).parent().find("ul").toggle("slow");
    $("i.icon-folder-close").toggleClass("icon-folder-open");
  });
  $(".item").on("click", function () {
    $slideout.animate({left: "-222px"}, {queue: false, duration: 500}).removeAttr("class");
  });
})();
