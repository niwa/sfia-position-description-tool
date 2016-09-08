"use strict";

var xmlhttp;
xmlhttp=new XMLHttpRequest();
xmlhttp.open('GET', "json_source.json", false);
xmlhttp.send();
var sfia_json = JSON.parse(xmlhttp.responseText);
var root_key_printed = [];
var sub_key_printed = [];

var table = document.getElementById('sfia-content');

for (var root_key in sfia_json) {
    for (var sub_key in sfia_json[root_key]) {
        for (var skill_key in sfia_json[root_key][sub_key]) {
            var row = document.createElement('tr');
            row.className += " "+root_key.trim().replace(/ /g, "_").toLowerCase();
            
            var col1 = document.createElement('td');
            if (root_key_printed.indexOf(root_key) === -1) {
                root_key_printed.push(root_key);
                col1.textContent = root_key;
            }
            col1.className += " root_key";
            row.appendChild(col1);
            
            var col2 = document.createElement('td');
            if (sub_key_printed.indexOf(sub_key) === -1) {
                sub_key_printed.push(sub_key);
                col2.textContent = sub_key;
            }
            col2.className += " sub_key";
            row.appendChild(col2);
            
            var col3 = document.createElement('td');
            col3.className += " skill_key";
            row.appendChild(col3);

            var skill_span = document.createElement('span');
            skill_span.textContent = skill_key + " - " + sfia_json[root_key][sub_key][skill_key]["code"];
            skill_span.title = sfia_json[root_key][sub_key][skill_key]["description"];
            col3.appendChild(skill_span);

            for (var i = 1; i < 8; i++) {
                row.appendChild(addSelectionBox(i));
            }
            
            table.appendChild(row);
        }
    }
}
if (window.location.href.split("/#/").length > 0) {
    renderOutput();
}

function checkPreselected(code, level) {
    if (window.location.href.indexOf("/#/") > -1 && window.location.href.split("/#/").length > 0) {
        for (var i = window.location.href.split("/#/")[1].split("+").length - 1; i >= 0; i--) {
            var check_code = window.location.href.split("/#/")[1].split("+")[i].split("-")[0];
            var check_level = window.location.href.split("/#/")[1].split("+")[i].split("-")[1];

            if (code == check_code && level == check_level) {
                return true;
            }
        };
    }

    return false;
}

function addSelectionBox(index) {
    var col = document.createElement('td');
    if (sfia_json[root_key][sub_key][skill_key]["levels"].hasOwnProperty(index)) {
        var json_data = JSON.stringify({"category":root_key,"subCategory":sub_key,"skill":skill_key,"level":index});
        var checked = (checkPreselected(sfia_json[root_key][sub_key][skill_key]["code"], index)) ? "checked" : "";
        col.innerHTML = "<input type='checkbox' title='"+sfia_json[root_key][sub_key][skill_key]["levels"][index]+"' sfia-data='"+json_data+"' "+checked+"/>";
        col.className += " select_col";
    } else {
    	col.innerHTML = "<input type='checkbox' disabled/>";
        col.className += " no_select_col";
    }
    col.className += " col-checkbox";
    return col;
}

function exportCSV() {

    var checked_boxes = document.querySelectorAll('input[type=checkbox]:checked');
    var data = [];

    for(var i = 0, box; (box = checked_boxes[i]) !== undefined; i++)
    {
        var json_data = JSON.parse(box.getAttribute('sfia-data'));
        data.push([json_data.skill+" "+sfia_json[json_data.category][json_data.subCategory][json_data.skill]["code"]+"-"+json_data.level, sfia_json[json_data.category][json_data.subCategory][json_data.skill]["description"],sfia_json[json_data.category][json_data.subCategory][json_data.skill]["levels"][json_data.level]]);
    }

    var csvContent = "";
    data.forEach(function(infoArray, index){

       var dataString = '"' + infoArray.join('","') + '"';
       csvContent += dataString + "\n";

    });

    var encodedUri = encodeURI(csvContent);
    var a         = document.createElement('a');
    a.href        = 'data:attachment/csv,' +  encodedUri;
    a.download    = 'PositionSummary.csv';

    document.body.appendChild(a);
    a.click();
    a.remove();
}

function exportHTML() {

    var htmlContent = document.getElementById('sfia-output').innerHTML;

    var encodedUri = encodeURI(htmlContent);
    var a         = document.createElement('a');
    a.href        = 'data:attachment/plain;charset=utf-8,' +  encodedUri;
    a.download    = 'PositionSummary.html';

    document.body.appendChild(a);
    a.click();
    a.remove();
}

function renderOutput() {

    var checked_boxes = document.querySelectorAll('input[type=checkbox]:checked');
    var new_json = sfia_json;
    var new_arr = {};
    var url_hash = [];

    for(var i = 0, box; (box = checked_boxes[i]) !== undefined; i++) {
        
        var json_data = JSON.parse(box.getAttribute('sfia-data'));
        
        if ( typeof new_arr[json_data.category] == "undefined") {
            new_arr[json_data.category] = {};
        }
        if ( typeof new_arr[json_data.category][json_data.subCategory] == "undefined") {
            new_arr[json_data.category][json_data.subCategory] = {};
        }
        if ( typeof new_arr[json_data.category][json_data.subCategory][json_data.skill] == "undefined") {
            new_arr[json_data.category][json_data.subCategory][json_data.skill] = {};
            new_arr[json_data.category][json_data.subCategory][json_data.skill]["description"] = new_json[json_data.category][json_data.subCategory][json_data.skill]["description"];
            new_arr[json_data.category][json_data.subCategory][json_data.skill]["code"] = new_json[json_data.category][json_data.subCategory][json_data.skill]["code"];
            new_arr[json_data.category][json_data.subCategory][json_data.skill]["levels"] = {};
        }

        new_arr[json_data.category][json_data.subCategory][json_data.skill]["levels"][json_data.level] = new_json[json_data.category][json_data.subCategory][json_data.skill]["levels"][json_data.level];

        url_hash.push(new_json[json_data.category][json_data.subCategory][json_data.skill]["code"]+"-"+json_data.level);
    }

    var html = document.getElementById('sfia-output');

    while(html.firstChild){
        html.removeChild(html.firstChild);
    }

    for (var category in new_arr) {

        var category_ele = document.createElement('h1');
        category_ele.textContent = category;
        html.appendChild(category_ele);

        for (var subCategory in new_arr[category]) {

            var subCategory_ele = document.createElement('h2');
            subCategory_ele.textContent = subCategory;
            html.appendChild(subCategory_ele);

            for (var skill in new_arr[category][subCategory]) {
                
                var skill_ele = document.createElement('h3');
                skill_ele.textContent = skill + " - " + new_arr[category][subCategory][skill]["code"];
                html.appendChild(skill_ele); 

                var skill_description_ele = document.createElement('p');
                skill_description_ele.textContent = new_arr[category][subCategory][skill]["description"];
                html.appendChild(skill_description_ele);  

                for (var level in new_arr[category][subCategory][skill]["levels"]) {
                
                    var level_ele = document.createElement('h4');
                    level_ele.textContent = "Level "+level;
                    html.appendChild(level_ele);  

                    var level_description_ele = document.createElement('p');
                    level_description_ele.textContent = new_arr[category][subCategory][skill]["levels"][level];
                    html.appendChild(level_description_ele);         

                }       

            }
        }
    }

    window.location.href = location.protocol + '//' + location.host + location.pathname + "#/" + url_hash.join("+");

}

for(var i = 0, checkbox; (checkbox = document.querySelectorAll('input[type=checkbox]')[i]) !== undefined; i++) {
    checkbox.addEventListener("click", renderOutput, false);
}