/**
 * Extracts the skills data from SFIA 9 Excel file and converts it
 * into a JSON format expected by NIWA's Position Description Generator tool.
 * 
 * Run this in the Code Editor and copy the Console.log output into a 
 * json_source.json file.
 * 
 * Future SFIA versions may have different Excel formats. At minimum, check:
 * 1. Worksheet name is "Skills"
 * 2. Skills table with the important info is between columns I to V
 * 3. Column headers exactly match SkillsTableData interface definition, 
 *    including spaces and casing
 * 4. Skills are already grouped by Category and Subcategory. 
 *    If not, uncomment the optional grouping block.
 */
function main(workbook: ExcelScript.Workbook): void {
  let worksheet = workbook.getWorksheet("Skills");
  
  if (worksheet.getTables().length === 0)
  {
    // Create an Excel table for easier looping later
    let newTable = workbook.addTable(worksheet.getRange("A1:V148"), true);

    // Optional: Group table by Category and Subcategory if needed
    // newTable.getSort().apply([
    //   { key: 11, ascending: true }, //column L
    //   { key: 12, ascending: true }], //column M
    //   false);
  }
  
  const table = worksheet.getTables()[0];

  // Get all the values from the table as text.
  const texts = table.getRange().getTexts();

  // Create an array of JSON objects that match the row structure.
  let tableRows: SkillsTableData[] = [];
  if (table.getRowCount() > 0) {
    tableRows = returnObjectFromValues(texts);
  }

  // Create the JSON object expected by NIWA's Position Description Generator tool
  let displayStructure = mapToDisplayStructure(tableRows);

  // Log the information for copying into the json_source.json file
  console.log(JSON.stringify(displayStructure));
  return;
}

// This function converts a 2D array of values into a SkillsTableData array.
function returnObjectFromValues(values: string[][]): SkillsTableData[] {
  let objectArray: SkillsTableData[] = [];
  let objectKeys: string[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      objectKeys = values[i];
      continue;
    }

    let object = {};
    for (let j = 0; j < values[i].length; j++) {
      object[objectKeys[j]] = values[i][j];
    }

    objectArray.push(object as SkillsTableData);
  }

  return objectArray;
}

// This function converts SkillsTableData to the structure expected by NIWA
function mapToDisplayStructure(table: SkillsTableData[]): object {
  let result = {};

  let categoryWatermark = "";
  let subcategoryWatermark = "";

  let category = {};
  let subcategory = {};

  let maxIndex = table.length-1;

  for (let i = 0; i < table.length; i++){
    let row = table[i];

    //build the Levels
    let levels: Levels = {
      1: getLevelDescription(row["Level 1 description"]),
      2: getLevelDescription(row["Level 2 description"]),
      3: getLevelDescription(row["Level 3 description"]),
      4: getLevelDescription(row["Level 4 description"]),
      5: getLevelDescription(row["Level 5 description"]),
      6: getLevelDescription(row["Level 6 description"]),
      7: getLevelDescription(row["Level 7 description"])
    };

    // build the Skill
    let skill: Skill = {
      code: row.Code,
      description: row["Overall description"],
      levels: levels,
      url: row.URL
    };

    // update both watermarks
    categoryWatermark = row.Category;
    subcategoryWatermark = row.Subcategory;

    // add to subcategory
    subcategory[row.Skill] = skill;

    // peek ahead: if this is the last row or next subcategory is different, 
    // then add this subcategory to the category and re-initialise
    if (i == maxIndex || table[i+1].Subcategory != subcategoryWatermark){
      //console.log(JSON.stringify(subcategory));
      category[subcategoryWatermark] = subcategory;
      subcategory = {};
    }

    // peek ahead: if this is the last row or next category is different, 
    // then add this category to the result and re-initialise
    if (i == maxIndex || table[i + 1].Category != categoryWatermark) {
      result[categoryWatermark] = category;
      category = {};
    }
  }

  return result;
}

// this function ensures that empty levels do not have a property defined
function getLevelDescription(description: string): string | undefined {
  return description && description.trim() !== "" ? description : undefined;
}

interface SkillsTableData {
  Code: string;
  URL: string;
  Skill: string;
  Category: string;
  Subcategory: string;
  "Overall description": string;
  "Guidance notes": string;
  "Level 1 description": string;
  "Level 2 description": string;
  "Level 3 description": string;
  "Level 4 description": string;
  "Level 5 description": string;
  "Level 6 description": string;
  "Level 7 description": string;
}

interface Skill {
  code: string;
  levels: Levels;
  description: string;
  url: string;
}

interface Levels {
  1?: string;
  2?: string;
  3?: string;
  4?: string;
  5?: string;
  6?: string;
  7?: string;
}