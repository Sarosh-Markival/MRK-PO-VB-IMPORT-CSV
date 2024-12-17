define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.FieldsMapping = void 0;
    exports.FieldsMapping = {
        /**
         * @description: Mapping should be defined in Key Value pairs.
         * Key should be the Netsuite field id and the value should be the CSV column name
         * @example: orderdoc: 'PO.internalid' here orderdoc is the field id of netsuite item sublist and PO.internalid is the csv column name.
         */
        VB_IMPORT: {
            ITEM_SUBLIST: {
                orderdoc: 'PO.internalid',
                orderline: 'PO.lineid',
                rate: 'Item Cost',
                quantity: 'Quantity To Bill',
                custcol12: 'PO#'
            },
            HEADER: {
                tranid: 'Invoice#',
                trandate: 'Invoice Date'
            }
        }
    };
});
