/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @author Sarosh Aamir
 */
define(["require", "exports", "./module_helper", "N/currentRecord", "N", "N/ui/dialog", "N/ui/message"], function (require, exports, module_helper_1, currentRecord, N_1, dialog, message) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.handleVBImport = exports.handleExportTransactionCSVButton = exports.pageInit = void 0;
    const pageInit = (scriptContext) => {
        console.log("Page Init");
    };
    exports.pageInit = pageInit;
    const handleExportTransactionCSVButton = () => {
        try {
            downloadTransactionAsCSV(() => {
            }, () => {
                let infoMessage = dialog.alert({ title: 'CSV Downloaded', message: 'CSV has been downloaded Successfully' });
            }).then(result => {
                console.log(result);
            });
        }
        catch (e) {
            module_helper_1.MODULE_CONSTANTS.LOG.ERROR('handleExportTransactionCSVButton', e);
        }
    };
    exports.handleExportTransactionCSVButton = handleExportTransactionCSVButton;
    const handleVBImport = () => {
        vbFileImportHandler();
    };
    exports.handleVBImport = handleVBImport;
    const showErrorMessage = (title, eMsg) => {
        let errMessage = message.create({
            title: title,
            message: eMsg,
            type: message.Type.ERROR
        });
        errMessage.show();
    };
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
            (0, module_helper_1.parseVBCSV)(input.files[0], currentRecord.get(), (results, rows, error) => {
                console.log(results);
                console.log(rows);
                console.log(error);
                notificationMessage.hide();
                if (!!error) {
                    showErrorMessage('Error Importing CSV', error);
                }
            });
        };
        input.click();
    };
    const downloadTransactionAsCSV = async (beforeDownload, afterDownload) => {
        try {
            if (!!beforeDownload)
                await beforeDownload();
            let currRec = currentRecord.get();
            let transactionInternalId = currRec.id;
            let params = (0, module_helper_1.getScriptParameters)();
            let searchTemplate = params['SEARCH_FLD'];
            let searchRes = await module_helper_1.MODULE_HELPERS.getTransactionForCSV(transactionInternalId, searchTemplate);
            let res0 = searchRes.mappedJSON[0];
            let tranId = N_1.search.lookupFields({
                type: N_1.search.Type.TRANSACTION,
                id: transactionInternalId,
                columns: ['tranid']
            }).tranid;
            let csv = await module_helper_1.MODULE_HELPERS.downloadAsCSV(searchRes.mappedJSON, `${tranId}.csv`);
            if (!!afterDownload)
                await afterDownload();
            return 'Downloaded!';
        }
        catch (e) {
            return `${e.message}`;
        }
    };
});
