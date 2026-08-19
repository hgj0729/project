$(function () {

    // Family Site 버튼 클릭
    $(".family-btn").click(function () {

        // 패밀리 리스트를 한번 클릭하면 열고,
        // 다시 클릭하면 닫음
        $(".family-list").stop().slideToggle(300);

    });

});