const CLASSNAME = "-visible";
const TIMEOUT = 3000;
const $target = $(".title");

// ページ読み込み時に一度だけアニメーションを実行
setTimeout(() => {
  $target.addClass(CLASSNAME);
}, 500);

// リピートアニメーションは10秒ごとに実行
setInterval(() => {
  $target.removeClass(CLASSNAME);
  setTimeout(() => {
    $target.addClass(CLASSNAME);
  }, 100);
}, 10000);
