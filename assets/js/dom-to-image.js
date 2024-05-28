document.getElementById("download").addEventListener("click", function () {
    var node = document.getElementById("qrContainer");
    domtoimage.toJpeg(node, { quality: 1 }).then(function (dataUrl) {
        var link = document.createElement("a");
        link.download = "qr-code.png";
        link.href = dataUrl;
        link.click();
    });
});

document.getElementById("download-merge").addEventListener("click", function () {
    var node = document.getElementById("qrContainer-merge");
    domtoimage.toJpeg(node, { quality: 1 }).then(function (dataUrl) {
        var link = document.createElement("a");
        link.download = "qr-code.png";
        link.href = dataUrl;
        link.click();
    });
});
