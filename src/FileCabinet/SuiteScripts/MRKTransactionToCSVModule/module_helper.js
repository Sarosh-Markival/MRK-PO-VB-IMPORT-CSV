/**
 * @NApiVersion 2.1
 * @author Sarosh Aamir
 */
define(["require", "exports", "N/log", "N/search", "N/runtime", "./papaparse", "./fieldsMapping"], function (require, exports, log, search, runtime, papaParse, fieldsMapping_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", {value: true});
    exports.getScriptParameters = exports.parseVBCSV = exports.MODULE_HELPERS = exports.MODULE_CONSTANTS = void 0;
    let doc = typeof document !== 'undefined' ? document : '';
    var paramsGlob = {};
    exports.MODULE_CONSTANTS = {
        LOG: {
            ERROR: (title, e) => {
                var error = `${e.name} - ${e.message} - ${e.stack}`;
                log.error({
                    title: title,
                    details: error
                });
                if (!!doc) {
                    console.error(title, error);
                }
            },
            DEBUG: (title, message) => {
                log.debug({
                    title: title,
                    details: message
                });
                if (!!doc) {
                    console.log(title, message);
                }
            },
            AUDIT: (title, message) => {
                log.audit({
                    title: title,
                    details: message
                });
                if (!!doc) {
                    console.log(title, message);
                }
            }
        },
        SCRIPT_PARAMS_FIELDS: {
            SEARCH_FLD: 'custscript_mrk_search_template_csv'
        }
    };
    exports.MODULE_HELPERS = {
        /**
         *
         * @param transactionInternalId
         * @return ICSVTransaction
         */
        getTransactionForCSV: async (transactionInternalId, searchTemplate) => {
            let areColumnsSet = false;
            let searchColumns = [];
            let results = [];
            let mappedJSON = [];
            let searchObj = search.load({id: searchTemplate});
            let defaultFilters = searchObj.filters.filter(filter => {
                return filter.name != 'internalid';
            });
            defaultFilters.push(search.createFilter({
                name: 'internalid',
                operator: search.Operator.ANYOF,
                values: [transactionInternalId.toString()]
            }));
            searchObj.filters = defaultFilters;
            var testRes = {};
            searchObj.run().each(result => {
                testRes = result;
                if (!areColumnsSet) {
                    searchColumns = result.columns;
                }
                let mappedJSONObj = {};
                results.push(result.columns.map(columnObj => {
                    let val = result.getText(columnObj) || result.getValue(columnObj) || '';
                    mappedJSONObj[columnObj.label || columnObj.name] = val.toString();
                    return val.toString();
                }));
                Object.keys(mappedJSONObj).length > 0 ? mappedJSON.push(mappedJSONObj) : '';
                return true;
            });
            // for (var a = 0; a < 100000; a++) {
            //     let mappedJSONObj = {};
            //     results.push(testRes.columns.map(columnObj => {
            //         let val = testRes.getText(columnObj) || testRes.getValue(columnObj) || '';
            //         mappedJSONObj[columnObj.label || columnObj.name] = val.toString();
            //         return val.toString();
            //     }));
            //     Object.keys(mappedJSONObj).length > 0 ? mappedJSON.push(mappedJSONObj) : ''
            //
            // }
            //
            return {
                columns: searchColumns,
                rows: results,
                mappedJSON: mappedJSON
            };
        },
        /**
         *
         * @param arrayOfObjects
         * @param fileName
         * @param del
         */
        downloadAsCSV: async (arrayOfObjects, fileName, del = '') => {
            // Convert Object to JSON
            var jsonObject = JSON.stringify(arrayOfObjects);
            var array = typeof jsonObject != 'object' ? JSON.parse(jsonObject) : jsonObject;
            exports.MODULE_CONSTANTS.LOG.DEBUG('array', array);
            var csv = '';
            var headers = Object.keys(array[0]).join(del || ',') + '\r\n';
            csv = headers;
            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line != '')
                        line += del || ',';
                    line += array[i][index];
                }
                csv += line + '\r\n';
            }
            let csvData = new Blob([csv], {
                type: "data:application/vnd.ms-excel;charset=utf-8,\uFEFF"
            });
            var csvUrl = URL.createObjectURL(csvData);
            var a = document.createElement("a");
            a.href = csvUrl;
            a.setAttribute("download", fileName);
            document.body.appendChild(a);
            a.click();
        },
    };
    /**
     *
     * @param file
     * @param recordObj
     * @param onComplete
     */
    const parseVBCSV = (file, recordObj, onComplete) => {
        let updatedRows = [];
        let rows = [];
        let rowError = '';
        let headerKeys = fieldsMapping_1.FieldsMapping.VB_IMPORT.HEADER;
        papaParse.parse(file, {
            header: true,
            step: function (row, parser) {
                try {
                    parser.pause();
                    const {isUpdated, sequenceNumber} = processVBLine(recordObj, row.data);
                    if (isUpdated) {
                        updatedRows.push(row);
                        row.data.remove = false;
                    } else {
                        row.data.remove = true;
                        removeLineFromVB(recordObj, row);
                    }
                    parser.resume();
                } catch (e) {
                    rowError = `${e.name} - ${e.message}`;
                    row.data.Error = rowError;
                } finally {
                    rows.push(row);
                }
            },
            complete: function (results) {
                let error = '';
                try {
                    //Update Header Fields
                    let values = {};
                    if (updatedRows.length > 0) {
                        Object.keys(headerKeys).forEach(key => {
                            values[key] = updatedRows[0].data[headerKeys[key]];
                        });
                        setRecordFields(recordObj, values);
                    }
                } catch (e) {
                    error = `${e.name} - ${e.message} `;
                } finally {
                    onComplete(results, rows, error);
                }
            }
        });
    };
    exports.parseVBCSV = parseVBCSV;
    /**
     *
     * @param recordObj
     * @param row
     */
    const removeLineFromVB = (recordObj, row) => {
        if (row.data.remove) {
            let index = recordObj.findSublistLineWithValue({
                sublistId: 'item',
                fieldId: 'orderline',
                value: row.data[fieldsMapping_1.FieldsMapping.VB_IMPORT.ITEM_SUBLIST.orderline]
            });
            if (index >= 0) {
                recordObj.selectLine({sublistId: 'item', line: index});
                recordObj.removeLine({sublistId: 'item', line: index});
            }
        }
    };
    /**
     *
     * @param recordObj
     * @param data
     */
    const processVBLine = (recordObj, data) => {
       console.log('processVBLine', data)
        let isUpdated = false;
        let itemSublistKeys = fieldsMapping_1.FieldsMapping.VB_IMPORT.ITEM_SUBLIST;
        let poLineId = data[itemSublistKeys.orderline];
        let index = recordObj.findSublistLineWithValue({
            sublistId: 'item',
            fieldId: 'orderline',
            value: poLineId
        });
        let sequenceNumber = -1;
        if (index >= 0) {
            console.log("index:" + index);
            let values = {};
            Object.keys(itemSublistKeys).forEach(key => {
                values[key] = data[itemSublistKeys[key]];
            });
            if (values['quantity'] > 0) {
                sequenceNumber = updateLineItem({recordObj: recordObj, sublistId: 'item', values: values, line: index});
                isUpdated = true;
            }
        }
        return {isUpdated, sequenceNumber};
    };
    /**
     *
     * @param recordObj
     * @param values
     */
    const setRecordFields = (recordObj, values) => {
        Object.keys(values).forEach((key) => {
            console.log('Header Field Values', values);
            if (!!values[key].trim()) {
                let val = values[key];
                if (key == 'trandate') {
                    val = new Date(val);
                }
                recordObj.setValue(key, val);
            }
        });
    };
    /**
     *
     * @param params
     */
    const updateLineItem = (params) => {
        let sequenceNumber = -1;
        console.log('updateLineItem', params);
        let recordObj = params.recordObj;
        recordObj.selectLine({
            sublistId: params.sublistId,
            line: params.line,
        });
        sequenceNumber = recordObj.getCurrentSublistValue({
            sublistId: params.sublistId,
            fieldId: 'line',
        });
        console.log('line selected:' + params.line);
        Object.keys(params.values).forEach(key => {
            console.log(`Setting ${key} = ${params.values[key]}`);
            let val = params.values[key];
            if (!!val) {
                recordObj.setCurrentSublistValue({
                    sublistId: params.sublistId,
                    fieldId: key,
                    value: val,
                    forceSyncSourcing: true
                });
            }
        });
        recordObj.commitLine({sublistId: params.sublistId});
        return sequenceNumber;
    };
    const getScriptParameters = () => {
        if (Object.keys(paramsGlob).length > 0) {
            return paramsGlob;
        }
        Object.keys(exports.MODULE_CONSTANTS.SCRIPT_PARAMS_FIELDS).forEach(fieldKey => {
            paramsGlob[fieldKey] = runtime.getCurrentScript().getParameter({name: exports.MODULE_CONSTANTS.SCRIPT_PARAMS_FIELDS[fieldKey]});
        });
        paramsGlob['CURRENT_USER'] = runtime.getCurrentUser();
        exports.MODULE_CONSTANTS.LOG.DEBUG('getScriptParameters', paramsGlob);
        return paramsGlob;
    };
    exports.getScriptParameters = getScriptParameters;
});
