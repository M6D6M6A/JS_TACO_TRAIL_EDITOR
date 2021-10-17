(function(window, document) {})(window, document);

const inputElement = document.getElementById("file-input");
inputElement.addEventListener("change", display_trail, false);

function unpack_trail(trail_file) {

    trail_json_data = {
        "version": null,
        "map_id": null,
        "positions": []
    }

    var reader = new FileReader();
    reader.onload = function() {
        var offset = 0;
        var arrayBuffer = this.result,
            array = new Uint8Array(arrayBuffer);

        // Unpack Version
        var version = new Uint32Array(array.slice(offset, offset + 4))[0];
        trail_json_data.version = version
        offset += 4;

        // Unpack Map ID
        var mapId = new Uint32Array(array.slice(offset, offset + 4))[0];
        trail_json_data.map_id = mapId
        offset += 4;

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

            // if (i === 0) {
            //     console.log(postionBuffer.slice(i, i + 4))
            // }

            var f32 = new Float32Array(postionBuffer.slice(i, i + 4));
            var f32value = f32[0];
            position_json_data.x = f32value;

            var f32 = new Float32Array(postionBuffer.slice(i + 4, i + 8));
            var f32value = f32[0];
            position_json_data.y = f32value;

            var f32 = new Float32Array(postionBuffer.slice(i + 8, i + 12));
            var f32value = f32[0];
            position_json_data.z = f32value;

            trail_json_data.positions.push(position_json_data);

            addItems(trail_json_data);
        }

    }
    reader.readAsArrayBuffer(trail_file);
}

function display_trail() {

    var trail_file = this.files[0];
    unpack_trail(trail_file);
}

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

function addItems(positions_json) {

    deleteItems();

    var mapId = document.getElementById("mapId")
    mapId.setAttribute("value", positions_json.map_id);

    var version = document.getElementById("version")
    version.innerHTML = positions_json.version;

    var ul = document.getElementById("table");

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

    ul.appendChild(tableHeaderRow);

    for (var index in positions_json.positions) {
        var li = itemToHtml(positions_json.positions[index]);
        ul.appendChild(li);
    }

    document.getElementById("addRow").style.visibility = 'visible'

    table = document.getElementById("table");

    // Query all rows
    table.querySelectorAll('tr').forEach(function(row, index) {
        // Ignore the header
        // We don't want user to change the order of header
        if (index === 0) {
            return;
        }

        const firstCell = row.firstElementChild;
        firstCell.addEventListener('mousedown', mouseDownHandler);
    });

};

function addRow() {
    var copyedRow = table.children[table.children.length - 1].cloneNode(true);
    console.log(copyedRow)
    var oldIndex = parseInt(copyedRow.children[1].children[0].innerHTML)
    copyedRow.children[1].children[0].innerHTML = oldIndex + 1
    copyedRow.children[5].children[0].onclick = function(event) {
        console.log(event);
        if (event.target.innerHTML === "delete") {
            table.removeChild(event.target.parentNode.parentNode)
        }
    }
    table.appendChild(copyedRow);
}

function itemToHtml(position) {
    var tableRow0 = document.createElement("tr");
    var tableData0 = document.createElement("td");
    var tableData1 = document.createElement("td");
    var tableData2 = document.createElement("td");
    var tableData3 = document.createElement("td");
    var tableData4 = document.createElement("td");
    var tableData5 = document.createElement("td");

    var posCounter = document.createElement("div");
    posCounter.innerHTML = position.index;
    posCounter.setAttribute("class", "label");
    posCounter.setAttribute("type", "number");

    var posX = document.createElement("input");
    posX.setAttribute("value", position.x);
    posX.setAttribute("class", "coord");
    posX.setAttribute("type", "number");

    var posY = document.createElement("input");
    posY.setAttribute("value", position.y);
    posY.setAttribute("class", "coord");
    posY.setAttribute("type", "number");

    var posZ = document.createElement("input");
    posZ.setAttribute("value", position.z);
    posZ.setAttribute("class", "coord");
    posZ.setAttribute("type", "number");

    var dragIcon = document.createElement("span"); // <span class="material-icons-outlined"> drag_indicator </span>
    dragIcon.innerHTML = "drag_indicator";
    dragIcon.setAttribute("class", "material-icons");

    var delIcon = document.createElement("span"); // <span class="material-icons-outlined"> drag_indicator </span>
    delIcon.innerHTML = "delete";
    delIcon.setAttribute("class", "material-icons");
    delIcon.onclick = function(event) {
        console.log(event);
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
    var ul = document.getElementById("table");
    while (ul.firstChild) {
        ul.firstChild.remove();
    }
};

function saveTrail() {
    trail_json_data = {
        "version": document.getElementById("version").innerHTML,
        "map_id": document.getElementById("mapId").value,
        "positions": []
    }

    table.querySelectorAll('tr').forEach(function(row, index) {
        // Ignore the header
        // We don't want user to change the order of header
        if (index === 0) {
            return;
        }

        row_data = {
            "index": index - 1,
            "x": parseFloat(row.children[2].children[0].value),
            "y": parseFloat(row.children[3].children[0].value),
            "z": parseFloat(row.children[4].children[0].value),
        }
        trail_json_data.positions.push(row_data)
    });

    jsonToFile(trail_json_data)
}

function Int32toBytes(num) {
    var buffer = new ArrayBuffer(4); // an Int32 takes 4 bytes
    new DataView(buffer).setUint32(0, num, false); // byteOffset = 0; litteEndian = false
    var bytes = new Uint8Array(buffer).reverse();

    return bytes;
}

function doubleToByteArray(number) {
    var buffer = new ArrayBuffer(4);
    new DataView(buffer).setFloat32(0, number, false);
    var bytes = new Uint8Array(buffer).reverse(); // reverse to get little endian

    return bytes;
}

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

function jsonToFile(json_data) {
    var byte_file = [];

    var version = Int32toBytes(json_data.version);
    byte_file.push(version)

    // Unpack Map ID
    var mapId = Int32toBytes(json_data.map_id);
    byte_file.push(mapId)

    // Loop to unpack postionBuffer
    for (i = 0; i < json_data.positions.length; i++) {
        var x = doubleToByteArray(json_data.positions[i].x);
        var y = doubleToByteArray(json_data.positions[i].y);
        var z = doubleToByteArray(json_data.positions[i].z);
        byte_file.push(x, y, z);
    }

    var file_blob = new Blob(byte_file)
    var fileName = document.getElementById("newFileName").value
    saveAs(file_blob, fileName);
}

var table = null;
let draggingEle;
let draggingRowIndex;
let placeholder;
let list;
let isDraggingStarted = false;

// The current position of mouse relative to the dragging element
let x = 0;
let y = 0;

// Swap two nodes
const swap = function(nodeA, nodeB) {
    const parentA = nodeA.parentNode;
    const siblingA = nodeA.nextSibling === nodeB ? nodeA : nodeA.nextSibling;

    // Move `nodeA` to before the `nodeB`
    nodeB.parentNode.insertBefore(nodeA, nodeB);

    // Move `nodeB` to before the sibling of `nodeA`
    parentA.insertBefore(nodeB, siblingA);
};

// Check if `nodeA` is above `nodeB`
const isAbove = function(nodeA, nodeB) {
    // Get the bounding rectangle of nodes
    const rectA = nodeA.getBoundingClientRect();
    const rectB = nodeB.getBoundingClientRect();

    return rectA.top + rectA.height / 2 < rectB.top + rectB.height / 2;
};

const cloneTable = function() {
    const rect = table.getBoundingClientRect();
    const width = parseInt(window.getComputedStyle(table).width);

    list = document.createElement('div');
    list.classList.add('clone-list');
    list.style.position = 'absolute';
    list.style.left = `${rect.left}px`;
    list.style.top = `${rect.top}px`;
    table.parentNode.insertBefore(list, table);

    // Hide the original table
    table.style.visibility = 'hidden';

    table.querySelectorAll('tr').forEach(function(row) {
        // Create a new table from given row
        const item = document.createElement('div');
        item.classList.add('draggable');

        const newTable = document.createElement('table');
        newTable.setAttribute('class', 'clone-table');
        newTable.style.width = `${width}px`;

        const newRow = document.createElement('tr');
        const cells = [].slice.call(row.children);
        cells.forEach(function(cell) {
            const newCell = cell.cloneNode(true);
            newCell.style.width = `${parseInt(window.getComputedStyle(cell).width)}px`;
            newRow.appendChild(newCell);
        });

        newTable.appendChild(newRow);
        item.appendChild(newTable);
        list.appendChild(item);
    });
};

const mouseDownHandler = function(e) {
    e.preventDefault()
        // Get the original row
    const originalRow = e.target.parentNode.parentNode;
    draggingRowIndex = [].slice.call(table.querySelectorAll('tr')).indexOf(originalRow);

    // Determine the mouse position
    x = e.clientX;
    y = e.clientY;

    // Attach the listeners to `document`
    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
};

const mouseMoveHandler = function(e) {
    e.preventDefault()
    if (!isDraggingStarted) {
        isDraggingStarted = true;

        cloneTable();

        draggingEle = [].slice.call(list.children)[draggingRowIndex];
        draggingEle.classList.add('dragging');

        // Let the placeholder take the height of dragging element
        // So the next element won't move up
        placeholder = document.createElement('div');
        placeholder.classList.add('placeholder');
        draggingEle.parentNode.insertBefore(placeholder, draggingEle.nextSibling);
        placeholder.style.height = `${draggingEle.offsetHeight}px`;
    }

    // Set position for dragging element
    draggingEle.style.position = 'absolute';
    draggingEle.style.top = `${draggingEle.offsetTop + e.clientY - y}px`;
    draggingEle.style.left = `${draggingEle.offsetLeft + e.clientX - x}px`;

    // Reassign the position of mouse
    x = e.clientX;
    y = e.clientY;

    // The current order
    // prevEle
    // draggingEle
    // placeholder
    // nextEle
    const prevEle = draggingEle.previousElementSibling;
    const nextEle = placeholder.nextElementSibling;

    // The dragging element is above the previous element
    // User moves the dragging element to the top
    // We don't allow to drop above the header
    // (which doesn't have `previousElementSibling`)
    if (prevEle && prevEle.previousElementSibling && isAbove(draggingEle, prevEle)) {
        // The current order    -> The new order
        // prevEle              -> placeholder
        // draggingEle          -> draggingEle
        // placeholder          -> prevEle
        swap(placeholder, draggingEle);
        swap(placeholder, prevEle);
        return;
    }

    // The dragging element is below the next element
    // User moves the dragging element to the bottom
    if (nextEle && isAbove(nextEle, draggingEle)) {
        // The current order    -> The new order
        // draggingEle          -> nextEle
        // placeholder          -> placeholder
        // nextEle              -> draggingEle
        swap(nextEle, placeholder);
        swap(nextEle, draggingEle);
    }
};

const mouseUpHandler = function() {
    // Remove the placeholder
    placeholder && placeholder.parentNode.removeChild(placeholder);

    draggingEle.classList.remove('dragging');
    draggingEle.style.removeProperty('top');
    draggingEle.style.removeProperty('left');
    draggingEle.style.removeProperty('position');

    // Get the end index
    const endRowIndex = [].slice.call(list.children).indexOf(draggingEle);

    isDraggingStarted = false;

    // Remove the `list` element
    list.parentNode.removeChild(list);

    // Move the dragged row to `endRowIndex`
    let rows = [].slice.call(table.querySelectorAll('tr'));
    draggingRowIndex > endRowIndex ?
        rows[endRowIndex].parentNode.insertBefore(rows[draggingRowIndex], rows[endRowIndex]) :
        rows[endRowIndex].parentNode.insertBefore(
            rows[draggingRowIndex],
            rows[endRowIndex].nextSibling
        );

    // Bring back the table
    table.style.removeProperty('visibility');

    // Remove the handlers of `mousemove` and `mouseup`
    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
};