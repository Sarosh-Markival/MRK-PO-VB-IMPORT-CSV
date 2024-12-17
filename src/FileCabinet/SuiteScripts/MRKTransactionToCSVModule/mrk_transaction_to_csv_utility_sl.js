/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author Sarosh Aamir
 */
define(["require", "exports", "./module_helper", "xlsx", "N/file"], function (require, exports, module_helper_1, XLSX, file) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    const onRequest = async (scriptContext) => {
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
        };
        try {
            if (scriptContext.request.method == 'POST') {
                let parameters = scriptContext.request.parameters;
                module_helper_1.MODULE_CONSTANTS.LOG.DEBUG('parameters', parameters);
                let transInternalId = parameters.transInternalId;
                let searchTemplate = parameters.searchTemplate;
                let searchResults = await module_helper_1.MODULE_HELPERS.getTransactionForCSV(transInternalId, searchTemplate);
                let columns = searchResults.columns.map(colObj => {
                    return colObj.label || colObj.name;
                });
                let rows = searchResults.rows;
                let aoaData = [columns].concat(rows);
                let aoaObject = { aoaData: aoaData, sheetName: transInternalId };
                let fileId = createExcel(aoaObject);
                scriptContext.response.write(JSON.stringify({ fileId }));
            }
        }
        catch (e) {
            module_helper_1.MODULE_CONSTANTS.LOG.ERROR('onRequest', e);
        }
    };
    exports.onRequest = onRequest;
});
