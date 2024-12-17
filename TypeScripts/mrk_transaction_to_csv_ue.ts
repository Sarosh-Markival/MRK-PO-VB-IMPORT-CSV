/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @author Sarosh Aamir
 */


import {EntryPoints} from 'N/types';
import {MODULE_CONSTANTS} from "./module_helper";
import {record} from "N";
import {FieldType} from "N/ui/serverWidget";

export function beforeLoad(scriptContext: EntryPoints.UserEvent.beforeLoadContext) {
    try {
        addExportButton(scriptContext);
        addVBImportButton(scriptContext);
    } catch (e) {
        MODULE_CONSTANTS.LOG.ERROR('beforeLoad', e);

    }
}

let addExportButton = (scriptContext: EntryPoints.UserEvent.beforeLoadContext): void => {
    try {
        if (scriptContext.type == scriptContext.UserEventType.VIEW) {
            let form = scriptContext.form;
            form.clientScriptModulePath = './mrk_transaction_to_csv_cs.js'
            form.addButton({
                id: 'custpage_export_csv_btn',
                label: 'Export To CSV',
                functionName: 'handleExportTransactionCSVButton'
            });
            MODULE_CONSTANTS.LOG.DEBUG('addButton', 'Export Button Added')
        }

    } catch (e) {
        MODULE_CONSTANTS.LOG.ERROR('addButton', e);
    }


}

let addVBImportButton = (scriptContext: EntryPoints.UserEvent.beforeLoadContext) => {

    try {
        if (scriptContext.type == scriptContext.UserEventType.CREATE && scriptContext.newRecord.type == record.Type.VENDOR_BILL) {
            let form = scriptContext.form;
            form.clientScriptModulePath = './mrk_transaction_to_csv_cs.js'
            form.addButton({
                id: 'custpage_import_vb_btn',
                label: 'Import Vendor Bill CSV',
                functionName: 'handleVBImport()'
            });
            MODULE_CONSTANTS.LOG.DEBUG('addButton', 'Export Button Added')
        }


    } catch (e) {
        MODULE_CONSTANTS.LOG.ERROR('addButton', e);
    }

}