/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @author Sarosh Aamir
 */
define(["require", "exports", "./module_helper", "N"], function (require, exports, module_helper_1, N_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.beforeLoad = void 0;
    function beforeLoad(scriptContext) {
        try {
            addExportButton(scriptContext);
            addVBImportButton(scriptContext);
        }
        catch (e) {
            module_helper_1.MODULE_CONSTANTS.LOG.ERROR('beforeLoad', e);
        }
    }
    exports.beforeLoad = beforeLoad;
    let addExportButton = (scriptContext) => {
        try {
            if (scriptContext.type == scriptContext.UserEventType.VIEW) {
                let form = scriptContext.form;
                form.clientScriptModulePath = './mrk_transaction_to_csv_cs.js';
                form.addButton({
                    id: 'custpage_export_csv_btn',
                    label: 'Export To CSV',
                    functionName: 'handleExportTransactionCSVButton'
                });
                module_helper_1.MODULE_CONSTANTS.LOG.DEBUG('addButton', 'Export Button Added');
            }
        }
        catch (e) {
            module_helper_1.MODULE_CONSTANTS.LOG.ERROR('addButton', e);
        }
    };
    let addVBImportButton = (scriptContext) => {
        try {
            if (scriptContext.type == scriptContext.UserEventType.CREATE && scriptContext.newRecord.type == N_1.record.Type.VENDOR_BILL) {
                let form = scriptContext.form;
                form.clientScriptModulePath = './mrk_transaction_to_csv_cs.js';
                form.addButton({
                    id: 'custpage_import_vb_btn',
                    label: 'Import Vendor Bill CSV',
                    functionName: 'handleVBImport()'
                });
                module_helper_1.MODULE_CONSTANTS.LOG.DEBUG('addButton', 'Export Button Added');
            }
        }
        catch (e) {
            module_helper_1.MODULE_CONSTANTS.LOG.ERROR('addButton', e);
        }
    };
});
