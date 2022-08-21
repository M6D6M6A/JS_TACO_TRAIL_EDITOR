(function(window, document) {})(window, document);

const inputElement = document.getElementById("file-input");
const dynTable = document.getElementById("table");
const mapIdE = document.getElementById("mapId");
const mapIDContainer = document.getElementById("mapIDContainer")
const trailVersionContainer = document.getElementById("trailVersionContainer")
const changeAllContainer = document.getElementById("changeAllContainer")
const saveTrailContainer = document.getElementById("saveTrailContainer")
const changeAllX = document.getElementById("changeAllX")
const changeAllY = document.getElementById("changeAllY")
const changeAllZ = document.getElementById("changeAllZ")
const changeAllValue = document.getElementById("changeAllValue")
const mainContend = document.getElementById("mainContend")
const indexStart = document.getElementById("indexStart")
const indexEnd = document.getElementById("indexEnd")
const checkboxIndex = document.getElementById("checkboxIndex")
const checkboxFileName = document.getElementById("checkboxFileName")
const fileName = document.getElementById("newFileName")

inputElement.addEventListener("change", display_trail, false);
mapIdE.addEventListener("change", show_map_name, false);

var invocation = new XMLHttpRequest();

function callOtherDomain(url) {
    if (invocation) {
        invocation.open('GET', url, true);
        invocation.onreadystatechange = handler;
        invocation.send();
    } else {
        invocation = new XMLHttpRequest();
    }
}

function handler() {
    if (this.status == 404) {
        mapIdE.title = "Not Found!";
    }
    if (this.readyState == 4 && this.status == 200) {
        var json_response = JSON.parse(this.responseText);
        var name = json_response.name
        mapIdE.title = name;
    } else {
        mapIdE.title = "Not Found!";
    }

}

function show_map_name() {
    var id = mapIdE.value;
    var url = "https://api.guildwars2.com/v2/maps/" + id + "?lang=en"
    if (id.length > 0) {
        callOtherDomain(url)
    }

}

function display_trail() {
    var trail_file = this.files[0];
    if (trail_file != null) {
        let fileArray = trail_file.name.split(".");
        let type = fileArray[fileArray.length - 1];
        if (type == "trl") {
            unpack_trail(trail_file);
        }
    }
}

function Uint8ArrayToDecimal(array) {
    return hexToDecimal(buf2hex(array));
}

function hexToDecimal(hexStr) {
    return parseInt(hexStr, 16);
} 

function buf2hex(buffer) { // buffer is an ArrayBuffer
    buffer.reverse()
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('').toUpperCase();
}

function unpack_trail(trail_file) {

    deleteItems();

    var tableHeaderRow = document.createElement("tr");
    var tableHeader5 = document.createElement("th");
    tableHeader5.innerHTML = "Drag and Drop"
    var tableHeader1 = document.createElement("th");
    tableHeader1.innerHTML = "Index"
    var tableHeader2 = document.createElement("th");
    tableHeader2.innerHTML = "X-Axis"
    var tableHeader3 = document.createElement("th");
    tableHeader3.innerHTML = "Y-Axis"
    var tableHeader4 = document.createElement("th");
    tableHeader4.innerHTML = "Z-Axis"
    var tableHeader6 = document.createElement("th");
    tableHeader6.innerHTML = "Delete"

    tableHeaderRow.appendChild(tableHeader5);
    tableHeaderRow.appendChild(tableHeader1);
    tableHeaderRow.appendChild(tableHeader2);
    tableHeaderRow.appendChild(tableHeader3);
    tableHeaderRow.appendChild(tableHeader4);
    tableHeaderRow.appendChild(tableHeader6);

    dynTable.appendChild(tableHeaderRow);

    var reader = new FileReader();
    reader.onload = function() {
        var offset = 0;
        var arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer);

        // Unpack Version
        var version = Uint8ArrayToDecimal(array.slice(offset, offset + 4));
        offset += 4;

        // Unpack Map ID
        var mapId = Uint8ArrayToDecimal(array.slice(offset, offset + 4));
        offset += 4;

        mapIdE.setAttribute("value", mapId);
        show_map_name()

        var versionE = document.getElementById("version")
        versionE.innerHTML = version;

        // Loop to unpack postionBuffer
        var postionBuffer = arrayBuffer.slice(offset, arrayBuffer.length);
        var index = 0
        for (i = 0; i < postionBuffer.byteLength; i += 12) {
            position_json_data = {
                "index": index++,
                "x": null,
                "y": null,
                "z": null
            };

            var x_f32 = new Float32Array(postionBuffer.slice(i, i + 4));
            var x_f32value = x_f32[0];

            var y_f32 = new Float32Array(postionBuffer.slice(i + 4, i + 8));
            var y_f32value = y_f32[0];

            var z_f32 = new Float32Array(postionBuffer.slice(i + 8, i + 12));
            var z_f32value = z_f32[0];

            addPosition(parseInt(i / 12), x_f32value, y_f32value, z_f32value);
        }

    }
    reader.readAsArrayBuffer(trail_file);
}

function addPosition(i, x, y, z) {

    var li = itemToHtml(i, x, y, z);
    dynTable.appendChild(li);

    document.getElementById("addRow").style.visibility = 'visible'
    mapIDContainer.style.display = 'flex'
    trailVersionContainer.style.display = 'flex'
    changeAllContainer.style.display = 'flex'
    saveTrailContainer.style.display = 'flex'
};

function saveAs(blob, fileName) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
        window.URL.revokeObjectURL(url);
    }, 1000);
}

function addRow() {
    var copyedRow = dynTable.children[dynTable.children.length - 1].cloneNode(true);
    var oldIndex = parseInt(copyedRow.children[1].children[0].innerHTML)
    copyedRow.children[1].children[0].innerHTML = oldIndex + 1
    copyedRow.children[5].children[0].onclick = function(event) {
        if (event.target.innerHTML === "delete") {
            dynTable.removeChild(event.target.parentNode.parentNode)
        }
    }
    dynTable.appendChild(copyedRow);

    // Scroll to end of Table
    mainContend.scrollTop = mainContend.scrollHeight;
}

function itemToHtml(i, x, y, z) {
    var tableRow0 = document.createElement("tr");
    var tableData0 = document.createElement("td");
    var tableData1 = document.createElement("td");
    var tableData2 = document.createElement("td");
    var tableData3 = document.createElement("td");
    var tableData4 = document.createElement("td");
    var tableData5 = document.createElement("td");

    var posCounter = document.createElement("div");
    posCounter.innerHTML = i;
    posCounter.setAttribute("class", "label");
    posCounter.setAttribute("type", "number");

    var posX = document.createElement("input");
    posX.setAttribute("value", x);
    posX.setAttribute("class", "coord");
    posX.setAttribute("type", "number");

    var posY = document.createElement("input");
    posY.setAttribute("value", y);
    posY.setAttribute("class", "coord");
    posY.setAttribute("type", "number");

    var posZ = document.createElement("input");
    posZ.setAttribute("value", z);
    posZ.setAttribute("class", "coord");
    posZ.setAttribute("type", "number");

    var dragIcon = document.createElement("span"); // <span class="material-icons-outlined"> drag_indicator </span>
    dragIcon.innerHTML = "drag_indicator";
    dragIcon.setAttribute("class", "material-icons");

    var delIcon = document.createElement("span"); // <span class="material-icons-outlined"> drag_indicator </span>
    delIcon.innerHTML = "delete";
    delIcon.setAttribute("class", "material-icons");
    delIcon.onclick = function(event) {
        if (event.target.innerHTML === "delete") {
            table.removeChild(event.target.parentNode.parentNode)
        }
    }

    tableData0.appendChild(posCounter);

    tableData1.appendChild(posX);
    tableData1.setAttribute("id", "x");

    tableData2.appendChild(posY);
    tableData2.setAttribute("id", "y");

    tableData3.appendChild(posZ);
    tableData3.setAttribute("id", "z");

    tableData4.appendChild(dragIcon);

    tableData5.appendChild(delIcon);

    tableRow0.appendChild(tableData4);
    tableRow0.appendChild(tableData0);
    tableRow0.appendChild(tableData1);
    tableRow0.appendChild(tableData2);
    tableRow0.appendChild(tableData3);
    tableRow0.appendChild(tableData5);

    return tableRow0;
}

function deleteItems() {
    var dynTable = document.getElementById("table");
    while (dynTable.firstChild) {
        dynTable.firstChild.remove();
    }
};

function saveTrail() {
    fileBytes = []

    var version = document.getElementById("version").innerHTML
    var mapId = document.getElementById("mapId").value

    fileBytes.push(Int32toBytes(version))
    fileBytes.push(Int32toBytes(mapId))

    table.querySelectorAll('tr').forEach(function(row, index) {
        // Ignore the header
        // We don't want user to change the order of header
        if (index === 0) {
            return;
        }

        var x = parseFloat(row.children[2].children[0].value);
        var y = parseFloat(row.children[3].children[0].value);
        var z = parseFloat(row.children[4].children[0].value);

        fileBytes.push(doubleToByteArray(x), doubleToByteArray(y), doubleToByteArray(z));
    });

    var file_blob = new Blob(fileBytes)
    if (checkboxFileName.checked) {
        saveAs(file_blob, fileName.value);
    } else {
        saveAs(file_blob, inputElement.value.replace(/.*[\/\\]/, ''));
    }

};

function Int32toBytes(num) {
    var buffer = new ArrayBuffer(4); // an Int32 takes 4 bytes
    new DataView(buffer).setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    var bytes = new Uint8Array(buffer).reverse();

    return bytes;
};

function doubleToByteArray(number) {
    var buffer = new ArrayBuffer(4);
    new DataView(buffer).setFloat32(0, number, false);
    var bytes = new Uint8Array(buffer).reverse(); // reverse to get little endian

    return bytes;
};

function saveAs(blob, fileName) {
    var url = window.URL.createObjectURL(blob);

    var anchorElem = document.createElement("a");
    anchorElem.style = "display: none";
    anchorElem.href = url;
    anchorElem.download = fileName;

    document.body.appendChild(anchorElem);
    anchorElem.click();

    document.body.removeChild(anchorElem);

    // On Edge, revokeObjectURL should be called only after
    // a.click() has completed, atleast on EdgeHTML 15.15048
    setTimeout(function() {
        window.URL.revokeObjectURL(url);
    }, 1000);
};

function changeValues() {
    if (changeAllValue.value != "") {
        if (changeAllX.checked) {
            changeAxis("x", "=");
        }

        if (changeAllY.checked) {
            changeAxis("y", "=");
        }

        if (changeAllZ.checked) {
            changeAxis("z", "=");
        }
    }
};

function addValues() {
    if (changeAllValue.value != "") {
        if (changeAllX.checked) {
            changeAxis("x", "+");
        }

        if (changeAllY.checked) {
            changeAxis("y", "+");
        }

        if (changeAllZ.checked) {
            changeAxis("z", "+");
        }
    }
};

function subValues() {
    if (changeAllValue.value != "") {
        if (changeAllX.checked) {
            changeAxis("x", "-");
        }

        if (changeAllY.checked) {
            changeAxis("y", "-");
        }

        if (changeAllZ.checked) {
            changeAxis("z", "-");
        }
    }
};

function changeAxis(axis, opp) {
    var tableArray = [].slice.call(table.children).slice(1);

    if (checkboxIndex.checked && indexStart.value.length > 0 && indexEnd.value.length > 0) {
        tableArray = tableArray.slice(parseFloat(indexStart.value), parseFloat(indexEnd.value) + 1);
    }

    for (var i = 0; i < tableArray.length; i++) {
        let rowAxis = tableArray[i].querySelector('#' + axis).children[0];
        switch (opp) {
            case "=":
                rowAxis.value = parseFloat(changeAllValue.value);
                break;
            case "+":
                rowAxis.value = parseFloat(rowAxis.value) + parseFloat(changeAllValue.value);
                break;
            case "-":
                rowAxis.value = parseFloat(rowAxis.value) - parseFloat(changeAllValue.value);
                break;
        }
    }
};

function toggleFileName() {
    if (checkboxFileName.checked) {
        fileName.disabled = false;
    } else {
        fileName.disabled = true;
    }
}