#!/bin/bash
node --experimental-repl-await ./scripted.js
#"console.log(5+7)"
#'let { page, getText, i, tab, selectors, selector, panel_container, panel, panels, cur_path, columns, pdf_column, pdf_name, iframe, coded_src, result, src, rows, tab_name, tab_names, documents_tab_checklist, pdf_names, checklist_row_pdf, checklist_document_tabs }  = await import("./scripted.js")'

# Debugging
# you can start the debugging eviroment with the command.
node --experimental-repl-await inspect ./scripted.js
# when in the debung eviroment you can press c for the next debugger command;
# n to go the next line
# s to step inside a function
# o to step out of a function
# repl for the comandline. You cannot run async code only read valiables.
