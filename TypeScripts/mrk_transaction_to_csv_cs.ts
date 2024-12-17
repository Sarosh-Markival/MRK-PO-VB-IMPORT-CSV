/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @author Sarosh Aamir
 */

import {EntryPoints} from "N/types";
import {MODULE_HELPERS, MODULE_CONSTANTS, getScriptParameters, parseVBCSV} from "./module_helper";
import currentRecord = require('N/currentRecord');
import {record, search} from "N";
import dialog = require("N/ui/dialog");
import message = require("N/ui/message");

export const pageInit = (scriptContext: EntryPoints.Client.pageInitContext) => {
    console.log("Page Init")
}
export const handleExportTransactionCSVButton = () => {
    try {
        downloadTransactionAsCSV(() => {
        }, () => {
            let infoMessage = dialog.alert({title: 'CSV Downloaded', message: 'CSV has been downloaded Successfully'});
        }).then(result => {
            console.log(result)
        })
    } catch (e) {
        MODULE_CONSTANTS.LOG.ERROR('handleExportTransactionCSVButton', e);
    }


}
export const handleVBImport = () => {
    vbFileImportHandler();
}
const showErrorMessage = (title, eMsg) => {
    let errMessage = message.create({
        title: title,
        message: eMsg,
        type: message.Type.ERROR
    });
    errMessage.show();
}
const vbFileImportHandler = () => {
    var input = document.createElement('input');
    input.type = 'file';
    input.onchange = function () {
        var notificationMessage = message.create({
            title: 'Copying Lines From CSV',
            message: `Processing ${input.files[0].name}`,
            type: message.Type.INFORMATION
        });
        notificationMessage.show();
        parseVBCSV(input.files[0], currentRecord.get(), (results, rows, error) => {
            console.log(results);
            console.log(rows);
            console.log(error);
            notificationMessage.hide();
            if (!!error) {
                showErrorMessage('Error Importing CSV', error);
            }
        });

    }
    input.click();
}
const downloadTransactionAsCSV = async (beforeDownload?: Function, afterDownload?: Function) => {
    try {
        if (!!beforeDownload) await beforeDownload();
        let currRec = currentRecord.get();
        let transactionInternalId = currRec.id;
        let params = getScriptParameters()
        let searchTemplate = params['SEARCH_FLD'];
        let searchRes = await MODULE_HELPERS.getTransactionForCSV(transactionInternalId, searchTemplate);
        let res0 = searchRes.mappedJSON[0];
        let tranId = search.lookupFields({
            type: search.Type.TRANSACTION,
            id: transactionInternalId,
            columns: ['tranid']
        }).tranid;
        let csv = await MODULE_HELPERS.downloadAsCSV(searchRes.mappedJSON, `${tranId}.csv`);
        if (!!afterDownload) await afterDownload()
        return 'Downloaded!'

    } catch (e) {
        return `${e.message}`

    }
};

