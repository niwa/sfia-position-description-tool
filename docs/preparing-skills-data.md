Preparing skills data
============

You require:

1. Access to a Microsoft Excel version and license that allows you to run Office Scripts built in TypeScript.
2. [SFIA skills in Excel format](https://sfia-online.org/en/sfia-9/documentation/sfia-9_excel) (free registration and login required).

Steps:

1. Open the Excel file of SFIA skills.
2. Go to Automate ribbon and click on New Script.
3. Copy the contents of [extract-skills-from-excel.ts](extract-skills-from-excel.ts) into the Code Editor.
4. Review the comments, especially the point about skills being grouped by Categories and Subcategories. For example, the SFIA 9 US Excel file is not grouped as the script expects, 
so the optional sorting code should be un-commented.
5. Run the script in the Code Editor, so you can see the Console.log output. Copy the output into a new json_source.json file.