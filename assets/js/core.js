document.cookie = "data-master=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
document.cookie = "data-client:length=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
document.cookie = "data-client:value=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
function qrReader(container) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);

            const imageData = context.getImageData(0, 0, image.width, image.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (!code) {
                document.getElementById(container).textContent = "No QR code found!";
                document.getElementById("copy-btn").classList.remove("show-copy-btn");
                document.getElementById("qrCodeSource").value = ""
            }

            let fixCode = code.data.toString().trim();
            document.getElementById("qrCodeSource").value = fixCode
            document.getElementById(container).textContent = fixCode

            document.getElementById("copy-btn").classList.add("show-copy-btn");
        };
        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function qrMergerReader() {
    document.cookie = "data-master=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

    // document.getElementById("client-qr-container").style.display = "none"
    // document.getElementById("border").style.display = "none"

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);

            const imageData = context.getImageData(0, 0, image.width, image.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            const container = document.getElementById("master-status-alert");
            const alert = document.getElementById("alert-text");
            const alertIcon = document.getElementById("alert-icon");

            if (!code) {
                alert.innerText = "No QR Code Found!";
                alertIcon.classList.add("fa-exclamation-circle");
                alertIcon.classList.remove("fa-check-circle");
                container.classList.add("error");
                container.classList.remove("success");
                document.cookie = "data-client:length=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
                document.cookie = "data-client:value=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            }

            let fixCode = code.data.toString().trim();

            let parseData = parseQRIS(fixCode);
            let uniQR = false;

            for (let i = 0; i < parseData.length; i++) {
                if (parseData[i].objectId == 51) {
                    uniQR = true;
                    document.cookie = "data-master=" + fixCode;
                    // document.getElementById("client-qr-container").style.display = "flex"
                    // document.getElementById("border").style.display = "block"
                }
            }

            if (uniQR == true) {
                alert.innerText = "Ready to merge!";
                alertIcon.classList.add("fa-check-circle");
                alertIcon.classList.remove("fa-exclamation-circle");
                container.classList.add("success");
                container.classList.remove("error");
            }

            if (uniQR == false) {
                alert.innerText = "Unique code not found!";
                alertIcon.classList.add("fa-exclamation-circle");
                alertIcon.classList.remove("fa-check-circle");
                container.classList.add("error");
                container.classList.remove("success");
            }
        };
        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

document.getElementById("mergeBtn").addEventListener("click", function () {
    if (getCookie("data-master") === "" && getCookie("data-client:length") === "" && getCookie("data-client:value") === "") {
        return 0;
    }
    let cmasterData = getCookie("data-master");
    let parseData = parseQRIS(cmasterData);

    let data = "";
    let title_name = "";
    for (let i = 0; i < parseData.length; i++) {
        const str = "" + parseData[i].objectLength;
        const pad = "00";

        let value = parseData[i].objectValue;
        let length = parseData[i].objectLength;
        if (parseData[i].objectId == 51) {
            length = getCookie("data-client:length");
            value = getCookie("data-client:value");
        }

        if (parseData[i].objectId == 63) {
            value = "";
        }
        data += parseData[i].objectId + pad.substring(0, pad.length - str.length) + length + value;

        if (parseData[i].objectId == 59) title_name = parseData[i].objectValue;
    }

    let rawData = data;

    let QrUrl = "https://quickchart.io/chart?cht=qr&chs=250x250&chl=" + rawData + crc16_ccitt_false(rawData);
    let imgElement = document.getElementById("mergeImg");

    imgElement.removeAttribute("src");

    fetch(QrUrl)
        .then((res) => res.blob())
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            imgElement.setAttribute("src", url);
        });

    // let title = title_name;
    let title = title_name;
    // let unique = "Test Uniques"
    let titleholder = document.getElementById("title-placeholder-merge");
    // let uniqueholder = document.getElementById('unique-placeholder-merge')
    if (title != "") {
        titleholder.innerText = title;
        titleholder.style.display = "flex";
    }

    // if (unique != "") {
    //     uniqueholder.innerText = "NMID " + unique
    // }

    let modal = document.getElementById("modal-merge");
    modal.style.display = "flex";

    let closeBtn = document.querySelector(".close-merge");

    // Function to close the modal when clicking the close button or outside the modal
    window.addEventListener("click", function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            titleholder.innerText = "";
            uniqueholder.innerText = "";
            titleholder.style.display = "none";
        }
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
        titleholder.innerText = "";
        uniqueholder.innerText = "";
        titleholder.style.display = "none";
    });
});

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function qrClientReader() {
    document.cookie = "data-client:length=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "data-client:value=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    // document.getElementById("mergeBtn").style.display = "none"

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const image = new Image();
        image.onload = function () {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0, image.width, image.height);

            const imageData = context.getImageData(0, 0, image.width, image.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            const container = document.getElementById("client-status-alert");
            const alert = document.getElementById("alert-text-client");
            const alertIcon = document.getElementById("alert-icon-client");

            if (!code) {
                alert.innerText = "No QR Code Found!";
                alertIcon.classList.add("fa-exclamation-circle");
                alertIcon.classList.remove("fa-check-circle");
                container.classList.add("error");
                container.classList.remove("success");
            }

            let fixData = code.data.toString().trim();
            let parseData = parseQRIS(fixData);
            let uniQR = false;
            for (let i = 0; i < parseData.length; i++) {
                if (parseData[i].objectId == 51) {
                    uniQR = true;
                    document.cookie = "data-client:length=" + parseData[i].objectLength;
                    document.cookie = "data-client:value=" + parseData[i].objectValue;
                    // document.getElementById("mergeBtn").style.display = "block"
                }
            }

            if (uniQR == true) {
                alert.innerText = "Ready to merge!";
                alertIcon.classList.add("fa-check-circle");
                alertIcon.classList.remove("fa-exclamation-circle");
                container.classList.add("success");
                container.classList.remove("error");
            }

            if (uniQR == false) {
                alert.innerText = "Unique code not found!";
                alertIcon.classList.add("fa-exclamation-circle");
                alertIcon.classList.remove("fa-check-circle");
                container.classList.add("error");
                container.classList.remove("success");
            }
        };
        image.src = event.target.result;
    };

    reader.readAsDataURL(file);
}

function copyText(el, btn) {
    var content = document.getElementById(el);
    var textToCopy = content.innerText;

    // Create a temporary textarea element to copy the text to clipboard
    let tempInput = document.createElement("textarea");
    tempInput.value = textToCopy;
    document.body.appendChild(tempInput);

    // Select the text inside the textarea
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); /* For mobile devices */

    // Copy the selected text to the clipboard
    document.execCommand("copy");

    // Remove the temporary textarea
    document.body.removeChild(tempInput);

    // Change button text to "Text Copied"
    let copyBtn = document.getElementById(btn);
    let originalBtnText = '<i class="fa fa-clone"></i>';
    copyBtn.innerText = "Text copied to clipboard";

    // Revert button text to original after 3 seconds
    setTimeout(function () {
        copyBtn.innerHTML = originalBtnText;
    }, 1500);
}

function getChecksum() {
    let raw = document.getElementById("rawCode").textContent;
    let placeholder = document.getElementById("checksum-placeholder");
    placeholder.innerText = raw + crc16_ccitt_false(raw);
}

// Render QR Data
document.getElementById("drawQr").addEventListener("click", function () {
    let rawData = document.getElementById("sourceCode").textContent.trim();

    var QrUrl = "https://quickchart.io/chart?cht=qr&chs=250x250&chl=" + rawData;
    var imgElement = document.getElementById("img");

    imgElement.removeAttribute("src");

    fetch(QrUrl)
        .then((res) => res.blob())
        .then((blob) => {
            const url = URL.createObjectURL(blob);
            imgElement.setAttribute("src", url);
        });

    let title = document.getElementById("title").value;
    let unique = document.getElementById("unique").value;
    let titleholder = document.getElementById("title-placeholder");
    let uniqueholder = document.getElementById("unique-placeholder");
    if (title != "") {
        titleholder.innerText = title;
        titleholder.style.display = "flex";
    }

    if (unique != "") {
        uniqueholder.innerText = "NMID " + unique;
    }

    let modal = document.getElementById("modal");
    modal.style.display = "flex";

    let closeBtn = document.querySelector(".close");

    // Function to close the modal when clicking the close button or outside the modal
    window.addEventListener("click", function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            titleholder.innerText = "";
            uniqueholder.innerText = "";
            titleholder.style.display = "none";
        }
    });

    closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
        titleholder.innerText = "";
        uniqueholder.innerText = "";
        titleholder.style.display = "none";
    });
});

// Function to restart the page
function restartPage() {
    location.reload();
}

function crc16_ccitt_false(data) {
    var crc = 0xffff;
    for (var i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (var j = 0; j < 8; j++) {
            if (crc & 0x8000) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
            crc &= 0xffff;
        }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
}

function parseQRIS(qrisString) {
    let result = [];
    let currentIndex = 0;

    while (currentIndex < qrisString.length) {
        const objectId = qrisString.slice(currentIndex, currentIndex + 2);
        currentIndex += 2;

        const objectLength = parseInt(qrisString.slice(currentIndex, currentIndex + 2));
        currentIndex += 2;

        const objectValue = qrisString.slice(currentIndex, currentIndex + objectLength);
        currentIndex += objectLength;

        result.push({ objectId, objectLength, objectValue });
    }

    return result;
}

document.getElementById("getQrCode").addEventListener("click", function () {
    let data = document.getElementById("qrCodeSource").value
    // let defaultView = document.getElementById("default").style.display = "flex"

    if (data != "") {
        let defaultView = document.getElementById("default").style.display = "none"
        let parseData = parseQRIS(data);

        let container = document.getElementById("splitter-display");
        if (container.firstChild) {
            while (container.hasChildNodes()) {
                container.removeChild(container.firstChild);
            }
        }

        for (let i = 0; i < parseData.length; i++) {
            if (parseData[i].objectId == 63) {
                continue
            }
            let input_row = document.createElement("div");
            input_row.setAttribute("class", "input-row");
            container.appendChild(input_row);
            let input_group = document.createElement("div");
            input_group.setAttribute("class", "input-group");
            input_row.appendChild(input_group);

            let inputObjectId = document.createElement("input");
            inputObjectId.setAttribute("value", parseData[i].objectId);
            inputObjectId.setAttribute("id", "objectId" + parseData[i].objectId);
            inputObjectId.setAttribute("disabled", true);
            input_group.appendChild(inputObjectId);
            const str = "" + parseData[i].objectLength;
            const pad = "00";
            let inputObjectLength = document.createElement("input");
            inputObjectLength.setAttribute("value", pad.substring(0, pad.length - str.length) + str);
            inputObjectLength.setAttribute("id", "objectLength" + parseData[i].objectId + pad.substring(0, pad.length - str.length) + str);
            inputObjectLength.setAttribute("disabled", true);
            input_group.appendChild(inputObjectLength);
            let inputObjectValue = document.createElement("input");
            inputObjectValue.setAttribute("value", parseData[i].objectValue);
            inputObjectValue.setAttribute("onkeyup", "resetLength(" + "objectId" + parseData[i].objectId + "," + "objectLength" + parseData[i].objectId + pad.substring(0, pad.length - str.length) + str + "," + "objectValue" + parseData[i].objectId + pad.substring(0, pad.length - str.length) + str + ")");
            inputObjectValue.setAttribute("id", "objectValue" + parseData[i].objectId + pad.substring(0, pad.length - str.length) + str);
            input_group.appendChild(inputObjectValue);
        }
        let assembleButton = document.createElement("input");
        assembleButton.setAttribute("value", "Generate QRIS");
        assembleButton.setAttribute("id", "assembleBtn");
        assembleButton.setAttribute("type", "button");
        assembleButton.setAttribute("onclick", "assembleBtn(" + parseData + ")");
        container.appendChild(assembleButton);
    }
})

function resetLength(id, len, val) {
    const str = "" + document.getElementById(val.id).value.length
    const pad = "00";

    let valWrapper = pad.substring(0, pad.length - str.length) + str
    len.value = valWrapper

    if (id.value == "01" && val.value == "12") {
        let container = document.getElementById("splitter-display");

        let input_row = document.createElement("div");
        input_row.setAttribute("class", "input-row");
        container.appendChild(input_row);
        input_row.setAttribute("id", "input-row-dynamic");
        container.appendChild(input_row);
        let input_group = document.createElement("div");
        input_group.setAttribute("class", "input-group");
        input_row.appendChild(input_group);

        let inputObjectId = document.createElement("input");
        inputObjectId.setAttribute("value", "54");
        inputObjectId.setAttribute("id", "dinamicId");
        inputObjectId.setAttribute("disabled", true);
        input_group.appendChild(inputObjectId);


        let l = document.createElement("input")
        l.setAttribute("value", "02")
        l.setAttribute("id", "dinamicLength")
        l.setAttribute("disabled", true);
        input_group.appendChild(l)

        let v = document.createElement("input")
        v.setAttribute("value", "01")
        v.setAttribute("id", "dinamicValue")
        v.setAttribute("onkeyup", "reset12Length()")
        input_group.appendChild(v)

        container.insertBefore(input_row, container.childNodes[container.childElementCount - 2]);
    }

    if (id.value == "01" && val.value != "12") {
        let container = document.getElementById("input-row-dynamic");
        container.remove()
    }
}

function reset12Length() {
    const str = "" + document.getElementById('dinamicValue').value.length
    const pad = "00";

    let valWrapper = pad.substring(0, pad.length - str.length) + str
    document.getElementById('dinamicLength').value = valWrapper
}

function assembleBtn(qrData) {
    let parseData = qrData;
    let data = "";
    for (let i = 0; i < parseData.length; i++) {
        const str = "" + parseData[i].objectLength;
        const pad = "00";

        //Reassemble the qr data that has been split and modified by user
        let oId = document.getElementById("objectId" + parseData[i].objectId);
        let length = document.getElementById("objectLength" + parseData[i].objectId + pad.substring(0, pad.length - str.length) + str);
        let value = document.getElementById("objectValue" + parseData[i].objectId + parseData[i].objectValue);

        if (parseData[i].objectId == 63) {
            value = "";
        }
        data += parseData[i].objectId + pad.substring(0, pad.length - str.length) + length + value;
    }

    console.log(data)
}