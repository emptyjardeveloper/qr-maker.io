const upload = document.getElementById('fileInput')
if (upload) {
    upload.addEventListener('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (event) {
            const image = new Image();
            image.onload = function () {
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0, image.width, image.height);

                const imageData = context.getImageData(0, 0, image.width, image.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                if (!code) {
                    document.getElementById('result').textContent = "No QR code found!"
                    document.getElementById('copy-btn').classList.remove("hidden-copy-btn")
                    close()
                }
                document.getElementById('result').textContent = code.data;
            }
            image.src = event.target.result;
            document.getElementById('copy-btn').classList.add("show-copy-btn")
        }

        reader.readAsDataURL(file);
    })
}

function copyText(el, btn) {
    var content = document.getElementById(el);
    var textToCopy = content.innerText;

    // Create a temporary textarea element to copy the text to clipboard
    let tempInput = document.createElement('textarea');
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);

    // Select the text inside the textarea
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); /* For mobile devices */

    // Copy the selected text to the clipboard
    document.execCommand('copy');

    // Remove the temporary textarea
    document.body.removeChild(tempInput);

    // Change button text to "Text Copied"
    let copyBtn = document.getElementById(btn);
    let originalBtnText = '<i class="fa fa-clone"></i>';
    copyBtn.innerText = 'Text copied to clipboard';

    // Revert button text to original after 3 seconds
    setTimeout(function () {
        copyBtn.innerHTML = originalBtnText;
    }, 1500);
}

function getChecksum() {
    let raw = document.getElementById('rawCode').textContent
    let placeholder = document.getElementById('checksum-placeholder')
    placeholder.innerText = raw + crc16_ccitt_false(raw)

}

document.getElementById("drawQr").addEventListener("click", function () {
    let rawData = document.getElementById('sourceCode').textContent
    let checksum = crc16_ccitt_false(rawData)
    // let QRParser = parseQRIS(rawData + checksum)

    // Encode the data in URI format
    var encodedData = encodeURIComponent(rawData);

    var QrUrl = "https://quickchart.io/chart?cht=qr&chs=250x250&chl=" + encodedData;
    var imgElement = document.getElementById("img");

    fetch(QrUrl).then(res => res.blob()).then(blob => {
        const url = URL.createObjectURL(blob)
        imgElement.setAttribute("src", url);
    })

    let title = document.getElementById('title').value
    let unique = document.getElementById('unique').value
    let titleholder = document.getElementById('title-placeholder')
    let uniqueholder = document.getElementById('unique-placeholder')
    if (title != "") {
        titleholder.innerText = title
        titleholder.style.display = "flex"
    }

    if (unique != "") {
        uniqueholder.innerText = "NMID " + unique
    }

    var modal = document.getElementById('modal');
    modal.style.display = 'flex';

    //Convert HTML to PNG
    // let content = document.getElementById("qrImage")
    // html2canvas(content).then(function (canvas) {
    //     // Export the canvas to its data URI representation
    //     var base64image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

    //     // const link = document.createElement('a');
    //     // link.setAttribute("download", `info.png`);
    //     // link.setAttribute("href", base64image);
    //     // link.click();
    //     let down = document.getElementById("download")
    //     down.setAttribute('download', 'info.png')
    //     down.setAttribute('href', base64image)
    // });

    var closeBtn = document.querySelector('.close');

    // Function to close the modal when clicking the close button or outside the modal
    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            titleholder.innerText = ""
            uniqueholder.innerText = ""
            titleholder.style.display = "none"
        }
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
        titleholder.innerText = ""
        uniqueholder.innerText = ""
        titleholder.style.display = "none"
    });
})

// Function to restart the page
function restartPage() {
    location.reload();
}

// document.getElementById("downloadBtn").addEventListener("click", function () {
//     var imgSrc = document.getElementById("img").src;
//     var fileName = "img.png";

//     // Create a link element
//     var downloadLink = document.createElement("a");
//     downloadLink.href = imgSrc;
//     downloadLink.download = fileName;

//     // Append the link to the body
//     document.body.appendChild(downloadLink);

//     // Trigger the click event of the link
//     downloadLink.click();

//     // Clean up
//     document.body.removeChild(downloadLink);
// });

function crc16_ccitt_false(data) {
    var crc = 0xFFFF;
    for (var i = 0; i < data.length; i++) {
        crc ^= (data.charCodeAt(i) << 8);
        for (var j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc &= 0xFFFF;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
}

// function parseQRIS(qrisString) {
//     let result = [];
//     let currentIndex = 0;

//     while (currentIndex < qrisString.length) {
//         const objectId = qrisString.slice(currentIndex, currentIndex + 2);
//         currentIndex += 2;

//         const objectLength = parseInt(qrisString.slice(currentIndex, currentIndex + 2));
//         currentIndex += 2;

//         const objectValue = qrisString.slice(currentIndex, currentIndex + objectLength);
//         currentIndex += objectLength;

//         result.push({ objectId, objectLength, objectValue });
//     }

//     return result;
// }