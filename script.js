// script.js

var currentDateTime;
var currentDate;

window.addEventListener('DOMContentLoaded', (event) => {
    // Get the current date and time
    var now = new Date();
    var year = now.getFullYear();
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var hours = now.getHours().toString().padStart(2, '0');
    var minutes = now.getMinutes().toString().padStart(2, '0');

    // Format the current date and time
    currentDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
    currentDate =`${year}-${month}-${day}`;

    // Set the value for the time input field
    document.getElementById("time").value = currentDateTime;
});

function saveEntry() {
    var time = document.getElementById("time").value;
    var systolic = document.getElementById("systolic").value;
    var diastolic = document.getElementById("diastolic").value;
    var pulse = document.getElementById("pulse").value;
    var hand = document.getElementById("hand").value;
    var remarks = document.getElementById("remarks").value;

    // Check if all mandatory fields are filled
    if (!time || !systolic || !diastolic || !pulse || !hand) {
        alert("Please fill in all mandatory fields.");
        return;
    }

    // Check if systolic, diastolic, and pulse are integers
    if (!Number.isInteger(Number(systolic)) || !Number.isInteger(Number(diastolic)) || !Number.isInteger(Number(pulse))) {
        alert("No decimals values allowed in Systolic, diastolic, and pulse fields.");
        return;
    }

    var entry = {
        time: time,
        systolic: systolic,
        diastolic: diastolic,
        pulse: pulse,
        hand: hand,
        remarks: remarks
    };

    var entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));

    displayEntries();
    document.getElementById("bpForm").reset();
}

function displayEntries() {
    var entries = JSON.parse(localStorage.getItem("entries")) || [];
    var tableBody = document.getElementById("entryBody");
    tableBody.innerHTML = "";

    var options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    };

    entries.forEach(function(entry, index) {
        var formattedTime = new Date(entry.time).toLocaleString(undefined, options);
        var row = document.createElement("tr");
        row.innerHTML = `
            <td>${formattedTime}</td>
            <td>${entry.systolic}</td>
            <td>${entry.diastolic}</td>
            <td>${entry.pulse}</td>
            <td>${entry.hand}</td>
            <td>${entry.remarks}</td>
            <td>
                <span class="edit-icon" onclick="toggleEdit(${index})">&#9998;</span>
                <span class="check-button" onclick="saveEditedEntry(${index})">&#10004;</span>
                <span class="delete-icon" onclick="deleteEntry(${index})">&#10006;</span>
            </td>
        `;
        tableBody.appendChild(row);
    });
}


function toggleEdit(index) {
    var row = document.getElementById("entryBody").rows[index];
    var editIcons = row.getElementsByClassName("edit-icon");
    var checkButtons = row.getElementsByClassName("check-button");
    var cells = row.getElementsByTagName("td");

    if (editIcons.length > 0) {
        for (var i = 0; i < cells.length - 1; i++) {
            if (i === 0) { // Time field
                var timeInput = document.createElement("input");
                timeInput.setAttribute("type", "datetime-local");
                timeInput.setAttribute("value", cells[i].textContent);
                timeInput.classList.add("time-input");
                cells[i].textContent = '';
                cells[i].appendChild(timeInput);
            } else if (i === 4) { // Hand field
                var handSelect = document.createElement("select");
                handSelect.innerHTML = `<option value="L">Left</option><option value="R">Right</option>`;
                handSelect.value = cells[i].textContent === "Left" ? "L" : "R";
                cells[i].textContent = '';
                cells[i].appendChild(handSelect);
            } else {
                cells[i].setAttribute("contenteditable", "true");
            }
        }

        for (var i = 0; i < editIcons.length; i++) {
            editIcons[i].style.display = "none";
        }

        for (var i = 0; i < checkButtons.length; i++) {
            checkButtons[i].style.display = "inline";
        }
    }
}


function saveEditedEntry(index) {
    var entries = JSON.parse(localStorage.getItem("entries")) || [];
    var row = document.getElementById("entryBody").rows[index];
    var editedEntry = {
        time: row.cells[0].getElementsByTagName("input")[0].value,
        systolic: row.cells[1].textContent,
        diastolic: row.cells[2].textContent,
        pulse: row.cells[3].textContent,
        hand: row.cells[4].getElementsByTagName("select")[0].value,
        remarks: row.cells[5].textContent
    };

    // Check if all mandatory fields are filled
    if (!editedEntry.time || !editedEntry.systolic || !editedEntry.diastolic || !editedEntry.pulse || !editedEntry.hand) {
        alert("Please fill in all mandatory fields.");
        return;
    }

    // Check if systolic, diastolic, and pulse are integers
    if (!Number.isInteger(Number(editedEntry.systolic)) || !Number.isInteger(Number(editedEntry.diastolic)) || !Number.isInteger(Number(editedEntry.pulse))) {
        alert("No decimals values allowed in Systolic, diastolic, and pulse fields.");
        return;
    }

    entries[index] = editedEntry;
    localStorage.setItem("entries", JSON.stringify(entries));
    displayEntries();
}



function deleteEntry(index) {
    var entries = JSON.parse(localStorage.getItem("entries")) || [];
    entries.splice(index, 1);
    localStorage.setItem("entries", JSON.stringify(entries));
    displayEntries();
}

function exportCSV() {
    var entries = JSON.parse(localStorage.getItem("entries")) || [];
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Time,Systolic (mm Hg),Diastolic (mm Hg),Pulse (bpm),Hand (L/R),Remarks\n";

    entries.forEach(function(entry) {
        csvContent += `${entry.time},${entry.systolic},${entry.diastolic},${entry.pulse},${entry.hand},${entry.remarks}\n`;
    });

    var encodedUri = encodeURI(csvContent);
    var fileName = "bp_data_" + currentDate + ".csv"; // Reuse the previously calculated currentDateTime
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link); // Required for Firefox
    link.click();
}



function printTable() {
    var printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(document.getElementById("entryTable").outerHTML);
    printWindow.document.write('<style>');
    printWindow.document.write('table { border-collapse: collapse; width: 100%; }');
    printWindow.document.write('th, td { border: 1px solid #000; padding: 8px; text-align: left; }');
    printWindow.document.write('th { background-color: #f2f2f2; }');
    printWindow.document.write('.edit-icon, .delete-icon, .check-button { cursor: pointer; font-size: 16px; margin-right: 5px; }');
    printWindow.document.write('.edit-icon:hover, .delete-icon:hover, .check-button:hover { color: #333; }');
    printWindow.document.write('.edit-button, .check-button { display: none; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

displayEntries(); // Call the function to display entries when the page loads
