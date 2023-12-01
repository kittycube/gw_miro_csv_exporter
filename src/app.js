import {createApp} from 'vue';
import App from './App.vue';

createApp(App)

async function addInfo(card) {
    
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
    if(sel.value !== "") {
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
    //puzzles
    let puzzle = {
        fillColor: '#4d4c87',
        textColor: '#ffffff',
        tooltip: 'puzzle',    
    }
    
    let collection = document.getElementsByClassName("puzzle");
    for(let i=0; i<collection.length; i++) {
        let copy = {...puzzle};
        copy.value = collection.item(i).value;
        prereq.push(copy);
    }
    
    
    //conversations
    let conversation = {
        fillColor: '#b497d1',
        textColor: '#ffffff',
        tooltip: 'conversation',
    }
    
    let coll = document.getElementsByClassName("convo");
    for(let i=0; i<coll.length; i++) {
        let copy = {...conversation};
        copy.value = coll.item(i).value;
        prereq.push(copy);
    }
    
    
    //weights
    
    card.fields = prereq;
    await card.sync();
}


function addPuzzle(name) {
    //get the puzzle section
    let puzzleSect = document.getElementById("puzzle-tags");
    let input = document.createElement("input");
    input.className = "puzzle";

    //if it is being added from data, set name
    if (name) {
        input.value = name;
    }

    try {
        //adding the delete button
        let delButton = document.getElementById("delete-puzzle");
        let delClone = delButton.cloneNode(true);
        delClone.style.display = "inline";

        //adding everything to the doc
        let div = document.createElement("div");
        puzzleSect.appendChild(div);
        div.appendChild(input);
        div.appendChild(delClone);
    } catch (e) {

    }
}

function removePuzzle(element) {
    let section = document.getElementById("puzzle-tags");
    let parentDiv = element.parentNode;
    section.removeChild(parentDiv);
    //trigger puzzle changes : might not be needed anymore
    //puzzleChanges(document.getElementById("puzzle-tags"));
}



function addConvo(name) {
    //get convo section
    let convoSect = document.getElementById("convo-tags");
    let input = document.createElement("input");
    input.className = "convo";

    //if it is from data, set
    if (name) {
        input.value = name;
    }

    try {
        //adding the delete button
        let delButton = document.getElementById("delete-convo");
        let delClone = delButton.cloneNode(true);
        delClone.style.display = "inline";

        //adding everything to the doc
        let div = document.createElement("div");
        convoSect.appendChild(div);
        div.appendChild(input);
        div.appendChild(delClone);
    } catch (e) {

    }
}

function removeConvo(element) {
    let section = document.getElementById("convo-tags");
    let parentDiv = element.parentNode;
    section.removeChild(parentDiv);
    //trigger : might not be needed anymore
    //convoChanges(document.getElementById("convo-tags"));
}

function resetInfo() {
    //convo name
    document.getElementById("title").value = "";
    //weight
    document.getElementById("convo-weight").value = 3;
    //relation
    document.getElementById("relations-select").value = "";
    //location
    document.getElementById("location-select").value = "";
    //puzzles
    document.getElementById("puzzle-tags").innerHTML = "";
    //conversation
    document.getElementById("convo-tags").innerHTML = "";
}

function loadInfo(card) {
    //resetInfo();
    let fields = card.fields;
    //convo name
    document.getElementById("title").value = card.title.replace( /(<([^>]+)>)/ig, '');
    //weight
    document.getElementById("convo-weight").value = fields.find(field=>field.tooltip==="weight").value;
    //relation
    let rel = fields.find(field => field.tooltip==="relation");
    if(rel !== undefined) {
        document.getElementById("relations-select").value = "relation:" + rel.value;

    }
    
    //location
    let loc = fields.find(field=>field.tooltip==="location");
    if(loc !== undefined) {
        document.getElementById("location-select").value = "location:" + loc.value.toLowerCase();
    }
    
    //puzzle conversation
    fields.forEach(field => {
        if(field.tooltip === 'puzzle') {
            addPuzzle(field.value);
        }
        if(field.tooltip === 'conversation') {
            addConvo(field.value);
        }
    });
    
}

async function init() {

    //drag and drops
    await miro.board.ui.on('drop', async ({ x, y, target }) => {

        const tPromise = miro.board.get({
            type: 'tag',
        });

        const tags = await tPromise;
        const rosette = tags.find(item => item.title === 'Rosette');
        
        //if rosette, create rosette card
        if (target.innerText === 'Rosette') {
            //set fields if rosette is a choice
            let relation = document.getElementById("relation-select");
            
            //create the text box
            const box = await miro.board.createCard({
                x,
                y,
                width: 400,
                height: 200,
                tagIds: [rosette.id],
                style: {
                    cardTheme: '#f2c7da',
                    fillBackground: true,
                },
            });

            let val = document.getElementById("relation-value");
            if (relation.value) {
                box.fields.push({
                    value: relation.value,
                    fillColor: "#f7b11b",
                    textColor: "#ffffff",
                    tooltip: "relation",
                });
                box.fields.push({
                    value: val.value,
                    fillColor: "#f5f5f5",
                    textColor: "#000000",
                    tooltip: "relation value",
                });
            }

             await box.sync();
        }
        else if(target.id === "npc1" || target.id === "npc2") {
            
            let name = target.innerText;
            const npc = tags.find(item => item.title === name);
            let color = '';
            if (npc.color === 'blue') {
                color = '#a8e5f7';
            }
            else {
                color = '#b3f786';
            }
            const box = await miro.board.createCard({
                x,
                y,
                width: 400,
                height: 200,
                tagIds: [npc.id],
                style: {
                    cardTheme: color,
                    fillBackground: true,
                },
            });
        }
        else {
            //probably not super great that the convo card is just an else, but it works for now
            let title = document.getElementById("title").value;
            if(title === "") {
                title = "Conversation Name";
            }
            const box = await miro.board.createCard({
                title: title,
                x,
                y,
                width: 400,
                height: 200,
                //tagIds: [npc.id],
                style: {
                    cardTheme: "#000000",
                    fillBackground: true,
                },
            });
            await addInfo(box);
        }
    });

    //on selection
    await miro.board.ui.on('selection:update', async (event) => {
        //for changing single cards: relation value, emotion tag, convo cards
        if (event.items.length === 1) {

            //get rosette tag
            const tPromise = miro.board.get({
                type: 'tag',
            });
            const tags = await tPromise;
            const rTag = tags.find(item => item.title === 'Rosette');
            
            //if it is a rosette tag
            try {
                let button = document.getElementById("choice-confirm");
                if (event.items[0].tagIds[0] === rTag.id) {
                    //add the option to edit the fields
                    button.style.display = "block";
                }
                else {
                    button.style.display = "none";
                }
            }
            catch (e) {
            }
            //if it's an npc card
            try {
                const tag1 = tags.find(item=>item.color === 'blue');
                const tag2 = tags.find(item=>item.color === 'green');
                let current = event.items[0].tagIds[0];
                let button = document.getElementById("emotion-confirm");
                if (current === rTag.id ||  current === tag1.id || current === tag2.id) {
                    button.style.display = "block";
                }
                else {
                    button.style.display = "none";
                }
            } catch (e) {
            }
            //if it is a convo card
            try {
                let button = document.getElementById("info-confirm");
                if (event.items[0].style.cardTheme === "#000000") {
                    button.style.display = "block";
                    //load info into
                    loadInfo(event.items[0]);
                } else {
                    button.style.display = "none";
                    //empty info
                    resetInfo();
                }
            }
            catch(e) {
            }
        }
        else {
            //remove the button options
            try {
                let choice = document.getElementById("choice-confirm");
                choice.style.display = "none";
                let emotion = document.getElementById("emotion-confirm");
                emotion.style.display = "none";
                let button = document.getElementById("info-confirm");
                button.style.display = "none";
                resetInfo();
            }
            catch(e) {
            }
        }
    });
        

}

init();