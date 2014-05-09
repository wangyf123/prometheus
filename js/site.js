function login() {
    elems = document.getElementsByTagName('input');
    a = elems[0];
    b = elems[1];
    if (a.value == "") {
        document.getElementById("error").innerText = "Enter a username";
        return;
    } else if (b.value == "") {
        document.getElementById("error").innerText = "Enter a password";
        return;
    }
    document.getElementById("error").innerText = "\u00a0";

    c = CryptoJS.SHA512(b.value).toString();

    f = document.createElement('form');
    f.method = "POST";
    f.action = "login.cgi";
    i1 = document.createElement('input');
    i1.name = "a";
    i1.type = "text";
    i1.value = a.value;
    i2 = document.createElement('input');
    i2.name = "c";
    i2.type = "password";
    i2.value = c;
    f.appendChild(i1);
    f.appendChild(i2);
    f.submit();
}

function addTab(element, tabElement) {
    tabElement.className = 'tab ' + element.id;
    tabLink = document.createElement('a');
    tabLink.href = '#';
    tabLink.appendChild(tabElement);
    x = document.createElement('img');
    x.src = 'images/x.png';
    x.alt = 'Close tab';
    x.onclick = function() {
        closeTab(element.id);
    }
    tabElement.innerText += '\u00a0';
    tabElement.appendChild(x);
    document.getElementById('tabs').appendChild(tabLink);
    document.getElementById('main').appendChild(element);
}

function closeTab(tabID) {
    switchTab('home');
    document.getElementById(tabID).remove();
    document.getElementsByClassName(tabID)[0].remove();
}

function switchTab(tabID) {
    if (!document.getElementById(tabID)) return;

    oldTab = document.getElementsByClassName("selected")[0];
    if (oldTab.id == tabID) return;
    oldTab.style.display = "none";
    oldTab.className = oldTab.className.replace("selected", "").trim();
    newTab = document.getElementById(tabID);
    newTab.style.display = "inline-block";
    newTab.className = newTab.className + " selected";
}

function openNotes() {
    // Create notes panel
    notes = document.createElement('div');
    id = 'notes' + new Date().getTime();
    notes.id = id;
    notes.className = "notes";
    notes.style.display = 'none';

    notesList = document.createElement('div');
    notesList.className = 'notes_list';
    notes.appendChild(notesList);

    notesEditor = document.createElement('div');
    notesEditor.setAttribute('data-note_id', -1);
    notesEditor.className = 'notes_editor';
    notes.appendChild(notesEditor);

    // Create table to display notes in
    notesTable = document.createElement('table');
    notesTable.className = "notes";

    headerRow = document.createElement('tr');
    tableTitle = document.createElement('th');
    tableTitle.innerText = 'Title';
    tableMTime = document.createElement('th');
    tableMTime.innerText = 'Last Modified';
    headerRow.appendChild(tableTitle);
    headerRow.appendChild(tableMTime);
    notesTable.appendChild(headerRow);

    notesList.appendChild(notesTable);

    // Create editor pane
    titleDesc = document.createElement('p');
    titleDesc.className = 'form_label';
    titleDesc.innerText = 'Title:';

    noteTitle = document.createElement('input');
    noteTitle.className = 'note_title';
    noteTitle.type = 'text';
    noteTitle.name = 'title';

    textDesc = document.createElement('p');
    textDesc.className = 'form_label';
    textDesc.innerText = 'Note:';

    noteText = document.createElement('textarea');
    noteText.className = 'note_editor';
    noteText.name = 'text';

    saveButton = document.createElement('button');
    saveButton.className = 'left_action';
    saveButton.innerText = 'Save';
    saveButton.onclick = function() {
        editPane = this.parentElement;
        noteID = editPane.getAttribute('data-note_id');
        noteTitle = '';
        noteText = '';
        errorText = 0;
        c = editPane.children;
        for (i = 0; i < c.length; i++) {
            if (c[i].tagName == 'INPUT') {
                noteTitle = c[i].value;
            } else if (c[i].tagName == 'TEXTAREA') {
                noteText = c[i].value;
            } else if (c[i].className == 'error_text') {
                errorText = c[i];
            }
        }

        if (noteTitle.length == 0) {
            errorText.innerText = 'You must enter a title';
            return;
        } else if (noteText.length == 0) {
            errorText.innerText = 'You must enter a note';
            return;
        }

        saveReq = new XMLHttpRequest();

        saveReq.onreadystatechange = function() {
            if (saveReq.readyState == 4 && saveReq.status == 200) {
                alert(saveReq.responseText);
            }
        }

        saveReq.open('POST', 'notes.cgi', true);
        saveReq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        saveReq.send('mode=1&note_id=' + noteID +
                     '&note_title=' + encodeURIComponent(noteTitle) + '&note_text=' + encodeURIComponent(noteText));
    }

    cancelButton = document.createElement('button');
    cancelButton.className = 'right_action';
    cancelButton.innerText = 'Cancel';
    cancelButton.onclick = function() {
        this.parentElement.setAttribute('data-note_id', -1);
        c = this.parentElement.children;
        for (i = 0; i < c.length; i++) {
            if (c[i].tagName == 'INPUT' || c[i].tagName == 'TEXTAREA') c[i].value = '';
            if (c[i].className == 'error_text') c[i].innerText = '';
        }
    };

    errorText = document.createElement('p');
    errorText.className = 'error_text';

    notesEditor.appendChild(titleDesc);
    notesEditor.appendChild(noteTitle);
    notesEditor.appendChild(document.createElement('br'));
    notesEditor.appendChild(textDesc);
    notesEditor.appendChild(noteText);
    notesEditor.appendChild(saveButton);
    notesEditor.appendChild(cancelButton);
    notesEditor.appendChild(errorText);

    // Fetch notes
    req = new XMLHttpRequest();

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) populateNotes(req.responseText, notesTable, notesEditor, id);
    }

    req.open('POST', 'notes.cgi', true);
    req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    req.send('mode=0');

    // Create actual note tab
    noteTab = document.createElement('div');
    noteTab.innerText = 'Notes';
    noteTab.className = 'tab';
    noteTab.onclick = function() {
        switchTab(id);
    };
    addTab(notes, noteTab);
    switchTab(id);
}

function populateNotes(data, notesTable, notesEditor, id) {
    if (data == "noauth") window.location.reload(true);

    // Else
    notes = JSON.parse(data);
    for (i = 0; i < notes.length; i++) {
        note = notes[i];
        r = document.createElement('tr');
        r.setAttribute('data-note', JSON.stringify(note));
        r.onclick = function() {
            note = JSON.parse(this.getAttribute('data-note'));
            editNote(note, this);
        }
        r.onmouseover = function() {
            this.style.fontWeight = 'bold';
            this.style.fontStyle = 'italic';
        }

        r.onmouseout = function() {
            this.style.fontWeight = 'normal';
            this.style.fontStyle = 'normal';
        }
        title = document.createElement('td');
        title.innerText = note.title;
        mtime = document.createElement('td');
        mtime.innerText = note.mtime;

        r.appendChild(title);
        r.appendChild(mtime);

        notesTable.appendChild(r);
    }

    // Resize notes text to fill height
    noteText = 0;
    c = notesEditor.children;
    for (i = 0; i < c.length; i++) {
        if (c[i].tagName == 'TEXTAREA') {
            noteText = c[i];
            break;
        }
    }
    noteText.style.height = notesEditor.offsetHeight - noteText.offsetTop - 30 + 'px';

    titleTD = notesTable.children[0].children[0];
    titleTD.style.width = titleTD.offsetWidth + 10 + 'px';
}

function editNote(note, row) {
    notePanel = row.parentElement.parentElement.parentElement;
    panes = notePanel.children;
    editPane = 0;
    for (i = 0; i < panes.length; i++) {
        if (panes[i].className == 'notes_editor') {
            editPane = panes[i];
            break;
        }
    }
    editPane.setAttribute('data-note_id', note.id);
    editElems = editPane.children;
    for (i = 0; i < editElems.length; i++) {
        if (editElems[i].tagName == 'INPUT') editElems[i].value = note.title;
        if (editElems[i].tagName == 'TEXTAREA') editElems[i].value = note.text;
        if (editElems[i].className == 'error_text') editElems[i].innerText = '';
    }
}
