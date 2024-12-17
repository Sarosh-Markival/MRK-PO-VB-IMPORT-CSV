/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Sarosh Aamir
 */

import {EntryPoints} from "N/types";
import {MODULE_HELPERS, MODULE_CONSTANTS} from "./module_helper";
import * as XLSX from 'xlsx';
import file = require('N/file');

export const onRequest: EntryPoints.Suitelet.onRequest = async (scriptContext: EntryPoints.Suitelet.onRequestContext) => {
    const createExcel = (aoaObject) => {
        let workbook = XLSX.utils.book_new();
        workbook.SheetNames.push(aoaObject.sheetName);
        let worksheet = XLSX.utils.aoa_to_sheet(aoaObject.aoaData);
        workbook.Sheets[aoaObject.sheetName] = worksheet;
        let workbookOutput = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'base64'
        });

        let excelFile = file.create({
            name: aoaObject.sheetName + '.xlsx',
            fileType: file.Type.EXCEL,
            contents: workbookOutput,
            folder: 148513
        });

        return excelFile.save();
    }

    try {
        if (scriptContext.request.method == 'POST') {
            let parameters = scriptContext.request.parameters;
            MODULE_CONSTANTS.LOG.DEBUG('parameters',parameters)
            let transInternalId = parameters.transInternalId;
            let searchTemplate = parameters.searchTemplate;
            let searchResults = await MODULE_HELPERS.getTransactionForCSV(transInternalId, searchTemplate);
            let columns = searchResults.columns.map(colObj => {
                return colObj.label || colObj.name
            });
            let rows = searchResults.rows;
            let aoaData = [columns].concat(rows);
            let aoaObject = {aoaData: aoaData, sheetName: transInternalId}
            let fileId = createExcel(aoaObject);
            scriptContext.response.write(JSON.stringify({fileId}));
        }


    } catch (e) {
        MODULE_CONSTANTS.LOG.ERROR('onRequest', e);
    }


}