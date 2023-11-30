let emotions = ["happy", "sad", "angry"];

async function addInfo(card) {

    const selection = await miro.board.getSelection();
    if(selection.length > 0) {
        card = selection[0];
    }
    //clear info 
    card.fields = [];
    await card.sync();

    //prereq tags
    let prereq = [];

    let weightVal = document.getElementById("convo-weight").value;
    let weight = {
        value: weightVal,
        fillColor: '#f0f0f0',
        textColor: '#000000',
        tooltip: 'weight',
    };
    prereq.push(weight);

    let sel = document.getElementById("relations-select");
    if(sel.value != "") {
        let relText = sel.options[sel.selectedIndex].text;
        let relation = {
            value: relText,
            fillColor: '#a15f76',
            textColor: '#ffffff',
            tooltip: 'relation',
        };
        prereq.push(relation);
    }
    sel = document.getElementById("location-select");
    if(sel.value != "") {
        let locText = sel.options[sel.selectedIndex].text;
        let location = {
            value: locText,
            fillColor: '#72a164',
            textColor: '#ffffff',
            tooltip: 'location',
        };
        prereq.push(location);
    }


    //weights

    card.fields = prereq;
    await card.sync();
}


let edit = 0;
async function editNPCName(clicked) {
    //check if it is to be edited or confirmed
    if(edit===0) {
        let name = clicked;
        let p = "p";
        let pid = name.concat(p);

        let b = "b";
        let bid = name.concat(b);

        let i = "i";
        let iid = name.concat(i);

        let button = document.getElementById(bid);
        let dragbox = document.getElementById(clicked);

        let para = document.getElementById(pid);
        
        //set confirm button image
        document.getElementById(iid).src="/src/assets/confirm.png";
        //change that paragraph to an input text box
        const cell = document.createElement("div");
        let input = document.createElement("input");
        input.id = name.concat("in");
        input.placeholder=para.innerHTML;
        input.id="changing";
        dragbox.removeChild(para);
        dragbox.appendChild(input);
        edit = 1;
    }
    else if(edit===1) {
        let change = document.getElementById("changing");
        //get rid of the input box and create a paragraph with 'change'
        let name = clicked;
        let para = document.createElement("p");
        para.innerHTML = change.value;
        let pid = name.concat("p");
        para.id = pid;

        if (para.innerHTML === "") {
            para.innerHTML = change.placeholder;
        }
        else {
            await miro.board.setAppData(name, change.value);
        }
        //edit image
        let i = "i";
        let iid = name.concat(i);
        document.getElementById(iid).src = "/src/assets/edit.png";
        
        let dragbox = document.getElementById(clicked);
        dragbox.removeChild(change);
        dragbox.appendChild(para);
        
        //change tags
        changeTag(change.placeholder, change.value);

        edit = 0;
    }

             
}


async function confirmRelationChange() {
    //set fields if rosette is a choice
    let relation = document.getElementById("relation-select");
    let val = document.getElementById("relation-value");
    const selection = await miro.board.getSelection();
    let box = selection[0];    

    if (relation.value) {
        //get rid of prev tag if it exists
        let relField = box.fields.find(item => item.tooltip == "relation");
        let valField = box.fields.find(item => item.tooltip == "relation value");
        if (relField) {
            relField.value = relation.value;
        }
        else {
            box.fields.push({
                value: relation.value,
                fillColor: "#f7b11b",
                textColor: "#ffffff",
                tooltip: "relation",
            });
        }
        if (valField) {
            valField.value = val.value;
        }
        else {
            box.fields.push({
                value: val.value,
                fillColor: "#f5f5f5",
                textColor: "#000000",
                tooltip: "relation value",
            });
        }
    }
    else {
        //remove val
        box.fields.length = 0;
    }

    await box.sync();
}


async function confirmEmotionChange() {
    let relation = document.getElementById("emotion-select");
    const selection = await miro.board.getSelection();
    let box = selection[0];    

    const tPromise = miro.board.get({
        type: 'tag',
    });

    //remove any other emotion tag if needed
    const tags = await tPromise;
    let toRemove = -1;
    box.tagIds.forEach(t => {
        let taginfo = tags.find(item => item.id == t);
        let title = taginfo['title'];
        if (emotions.includes(title)) {
            toRemove = box.tagIds.indexOf(t);
        }
    });
    if (toRemove !== -1) {
        box.tagIds.splice(toRemove, 1);
    }

    //add tag
    if (relation.value) {
        const emoTag = tags.find(item => item.title == relation.value);
        box.tagIds.push(emoTag.id);

    }

    await box.sync();
    //add the new one
}

function getPrereqTags(card) {
    let tagString = "";
    //get the convo card
    let fields = card.fields;
    fields.forEach(field => {
        if(field.tooltip !== "weight") {
            let tag = field.tooltip + ":" + field.value;
            tagString += tag + "|"
        }
    });
    tagString = tagString.substring(0, tagString.length-1);
    return tagString;
}

async function generateCSV() {
    //get selection
    const selection = await miro.board.getSelection();
    
    if(selection.length <= 0) {
        return;
    }
    
    //filter cards & connectors
    let cards = [];
    let connectors = [];
    let infoCard = undefined;
    selection.forEach(object => {
        if(object.type === 'card') {
            if(object.style.cardTheme === '#000000' ) {
                infoCard = object;
            }
            else {
                cards.push(object);
            }
        }
        else if(object.type === 'connector') {
            connectors.push(object);
        }
    });
    
    
    if(infoCard === undefined) {
        return;
    }
    

    //get speakers
    let speakers = ["Rosette"];
    let npc1 = await miro.board.getAppData("npc1");
    let npc2 = await miro.board.getAppData("npc2");
    speakers.push(npc1);
    speakers.push(npc2);
    
    //get all the tags
    const tPromise = miro.board.get({
        type: 'tag',
    });
    const tags = await tPromise;
    
    //each row for the csv
    let rows = [];

    //info from the cards
    let index = 2;
    cards.forEach((item) => {
        let curr = [];

        //rowname
        curr.push(index++);

        //id
        let num = item['id'];
        curr.push(num);

        //actual text
        //remove html tags
        let html = item['title'];
        let div = document.createElement('div');
        div.innerHTML = html;
        let text = div.textContent || div.innerText || "";
        text = "\"" + text + "\"";
        curr.push(text);


        //person and emotion tags
        let tag = item['tagIds'];
        let speaker = "";
        let emotion = "";
        tag.forEach(t => {

            let taginfo = tags.find(item => item.id == t);
            let title = taginfo['title'];

            //if it is on the speaker list, add it to the speaker tag
            if (speakers.includes(title)) {
                speaker = title;
            }
            else {
                emotion = title;
            }
        });
        if (emotion == "") {
            emotion = "default";
        }

        
        curr.push(speaker);
        curr.push(emotion);

        //fields
        let fields = item['fields'];
        if (fields.length > 0) {
            let relField = fields.find(it => it.tooltip == "relation");
            let valField = fields.find(it => it.tooltip == "relation value");
            curr[7] = relField.value;
            curr[8] = valField.value;
        }
        
        //push it
        rows.push(curr);
    });
    

    //info from connectors
    connectors.forEach((conn) => {
        //get the start and find that card
        //get the end and put it as that card's next
        //then find the end and put the prev as the start

        let start = conn['start']['item'];
        
        let end = conn['end']['item'];

        //find the row for the start and the row for the end
        rows.forEach(row => {
            //next
            if (row[1] == start) {
                if (row[6]) {
                    row[6] += "|" + end;
                } else {
                    row[6] = end;

                }
            }

            if (row[1] == end) {
                if (row[5]) {
                    row[5] += "|" + start;
                } else {
                    row[5] = start;
                }
            }
        });
    });
    

    let csvContent = "data:text/csv;charset=utf-8,";

    //title row
    let key = "RowName, ID, Text, Speaker, Emotion, PrevID, NextID, Relationship, ChoiceValue, LocationReq, RelationReq, Name, Weight, NPCName";
    csvContent += key + "\r\n";

    //tags on first row: col 9 and 10
    let locString = "";
    let relString = "";
    
    
    let fields = infoCard.fields;
    fields.forEach(field => {
        if(field.tooltip == "location") {
            locString = field.tooltip + ":" + field.value;
        }
        if(field.tooltip == "relation") {
            relString = field.tooltip + ":" + field.value;

        }
    });
    

    let row = [];

    let tagsOrTrigs = false;

    if (locString !== "") {
        row[0] = "0";
        row[9] = locString;
        tagsOrTrigs = true;
    }
    if(relString !== "") {
        row[0] = "0";
        row[10] = relString;
        tagsOrTrigs = true;
    }


    if (tagsOrTrigs) {
        let joined = row.join(",");
        csvContent += joined + "\r\n";
    }
    
    let weightRow = [];
    let title = infoCard.title.replace( /(<([^>]+)>)/ig, '');
    if (title === "") {
        title = "Convo";
    }
    title = title.replaceAll(' ','');
    
    weightRow[0] = "1";
    weightRow[11] = title;
    weightRow[12] = infoCard.fields.find(field => field.tooltip === "weight").value;
    weightRow[13] = npc1;
    let joined = weightRow.join(",");
    csvContent += joined + "\r\n";

    //assigning each line to the csv
    rows.forEach((rowArray) => {
        if (rowArray.length < 6) {
            rowArray[5] = "";
        }

        let row = rowArray.join(",");
        csvContent += row + "\r\n";
    });

   
 
    //download stuff
    var encodedURI = encodeURI(csvContent);
    var link = document.createElement('a');
    link.setAttribute('href', encodedURI);

    let full = title.concat(".csv");
    link.setAttribute('download', full);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  
}

let rosette;
let npc;

async function changeTag(oldName, newName) {
    const tPromise = miro.board.get({
        type: 'tag',
    });

    const tags = await tPromise;


    const tag = tags.find(item => item.title === oldName);
    tag.title = newName;

    await tag.sync();
}

async function createTags(npc1, npc2) {
    //check to see if tags exist
    const tPromise = miro.board.get({
        type: 'tag',
    });

    const tags = await tPromise;
    const rTag = tags.find(item => item.title == 'Rosette');
    const nTag1 = tags.find(item => item.title == npc1);
    const nTag2 = tags.find(item => item.title == npc2);

    //mood tags
    const happyTag = tags.find(item => item.title == 'happy');
    const sadTag = tags.find(item => item.title == 'sad');
    const angryTag = tags.find(item => item.title == 'angry');

    //if the tag doesn't exist, create it
    if (!rTag) {
        rosette = await miro.board.createTag({
            title: 'Rosette',
            color: 'magenta',
        });
    }
    if (!nTag1) {
        npc = await miro.board.createTag({
            title: npc1,
            color: 'blue',
        });
    }
    if (!nTag2) {
        npc = await miro.board.createTag({
            title: npc2,
            color: 'green',
        });
    }

    if (!happyTag) {
        await miro.board.createTag({
            title: 'happy',
            color: 'yellow',
        });
    }
    if (!sadTag) {
        await miro.board.createTag({
            title: 'sad',
            color: 'dark_blue',
        });
    }
    if (!angryTag) {
        await miro.board.createTag({
            title: 'angry',
            color: 'red',
        });
    }
}


async function locationChanges(option) {
    //await miro.board.setAppData("location", option.value);
}

async function relationChanges(option) {
    //await miro.board.setAppData("relation", option.value);
}

async function init() {

    await miro.board.ui.on('selection:update', async (event) => {
        if (event.items.length === 1) {
            try {
                if (event.items[0].style.cardTheme === "#000000") {
                    //runs twice for some reason ?
                    event.items[0].fields.forEach(tag => {
                        
                    });
                } else {
                }
            } catch (e) {
            }
        }
    });
    
    //open the app
    miro.board.ui.on("icon:click", async () => {
        await miro.board.ui.openPanel({ url: "app.html" });
    });
    
    //set the values from previously
    let npc1 = await miro.board.getAppData('npc1');
    let npc2 = await miro.board.getAppData('npc2');
    
    if (npc1 == undefined) {
        npc1 = "NPC1";
        await miro.board.setAppData('npc1', 'NPC1');
    }
    if (npc2 == undefined) {
        npc2 = "NPC2";
        await miro.board.setAppData('npc2', 'NPC2');

    }

    try {
        let pid1 = "npc1p";
        let pid2 = "npc2p";

        let p1 = document.getElementById(pid1);
        let p2 = document.getElementById(pid2);
        p1.innerHTML = npc1;
        p2.innerHTML = npc2;
    }
    catch (e) {

    }
    
    createTags(npc1, npc2);
}

init();
