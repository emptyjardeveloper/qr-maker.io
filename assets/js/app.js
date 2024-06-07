let swiper = new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 0,
    effect: 'fade',
    allowTouchMove: false,
    initialSlide: 3,
    fadeEffect: {
        crossFade: true
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        renderBullet: function (index, className) {
            var icons = ['fa fa-qrcode', 'fa fa-puzzle-piece', 'fa fa-terminal', 'fa fa-file-image-o']; // Different texts for each button
            var texts = ['Scanner', 'Customize', 'Checksum', 'Draw QRIS']; // Different texts for each button
            return '<span class="' + className + ' nav-btn"><i class="' + icons[index] + '"></i> ' + texts[index] + ' </span>';
        },
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});


let btn = document.getElementsByClassName("btn");
let msg = document.getElementsByClassName("display");
for (let i = 0; i < btn.length; i++) {
    btn[i].addEventListener("click", function () {
        for (let x = 0; x < msg.length; x++) {
            if (msg[x] != msg[i]) {
                msg[x].classList.add("hidden");
                btn[x].classList.remove("focusBtn");
                btn[x].classList.add("integrationButtonToggle");
            }

            msg[i].classList.remove("hidden");
            btn[i].classList.add("focusBtn");
            btn[i].classList.remove("integrationButtonToggle");
        }
    });
}