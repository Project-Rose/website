$(document).ready(function () {
    $(".confirm-twttr").on("click", function(evt) {
        evt.preventDefault();
        var code = $(".twttr-code-value").val();
        if (code.length < 6 || code.length > 6) {
            alert("Code is invalid, it has to be at least 6 numbers long.");
            return;
        }

        window.location.href="/tvii/checkForTWRedirect?code=" + code;
    })

    $(".confirm-tumblr").on("click", function(evt) {
        evt.preventDefault();
        var code = $(".tumblr-code-value").val();
        if (code.length < 6 || code.length > 6) {
            alert("Code is invalid, it has to be at least 6 numbers long.");
            return;
        }

        window.location.href="/tvii/checkForTBRedirect?code=" + code;
    })
});