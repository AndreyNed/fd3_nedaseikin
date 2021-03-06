'use strict';

import {
    CURRENCY_ALL_LOAD_START,
    CURRENCY_ALL_LOAD_SUCCESS,
    CURRENCY_ALL_LOAD_ERROR,
    CURRENCY_ALL_SHOULD_BE_RELOADED,

    CURRENCY_SET_CURRENCY_ALL_DATA,

    CURRENCY_LOAD_START,
    CURRENCY_LOAD_SUCCESS,
    CURRENCY_LOAD_ERROR,
    CURRENCY_SHOULD_BE_RELOADED,

    CURRENCY_SELECT,
    CURRENCY_SET_CURRENCY_DATA,

    CURRENCY_DYNAMIC_LOAD_START,
    CURRENCY_DYNAMIC_LOAD_SUCCESS,
    CURRENCY_DYNAMIC_LOAD_ERROR,
    CURRENCY_DYNAMIC_SHOULD_BE_RELOADED,

    CURRENCY_DYNAMIC_SELECT,
    CURRENCY_DYNAMIC_SET_CURRENCY_DATA,
    CURRENCY_DYNAMIC_SET_START_DATE,
    CURRENCY_DYNAMIC_SET_END_DATE,
    CURRENCY_DYNAMIC_SET_START_POINT,
    CURRENCY_DYNAMIC_SET_END_POINT,
    CURRENCY_DYNAMIC_SET_POINTS,

    CURRENCY_SET_CALC_INP_ID,
    CURRENCY_SET_CALC_INP_VALUE,
    CURRENCY_SET_CALC_LIST_VALUE,
} from "../actions/acCurrency";

const initState = {
    currencyAllSource:              null,
    currencyAllData:                null,
    currencyAllLoadStatus:          0,
    currencyAllPrepareStatus:       0,

    currencySource:                 null,
    currencyData:                   null,
    currencyLoadStatus:             0,
    currencyPrepareStatus:          0,
    currencySelectedIndex:          -1,
    currencyValue:                  {},

    currencyDynamicSource:          null,
    currencyDynamicData:            null,
    currencyDynamicLoadStatus:      0,
    currencyDynamicPrepareStatus:   0,
    currencyDynamicCurID:           145,
    currencyDynamicStartDate:       new Date( 2017, 0, 1 ), // '2017-1-1',
    currencyDynamicEndDate:         new Date( 2017, 11, 31 ), // '2017-12-31',
    currencyDynamicSelectedIndex:   -1,
    currencyDynamicStartPoint: {
        date:                       new Date( 2017, 0, 1 ),
        dateStr:                    '01-01-2017',
        rate:                       0,
    },
    currencyDynamicEndPoint: {
        date:                       new Date( 2017, 11, 31 ),
        dateStr:                    '31-12-2017',
        rate:                       0,
    },

    calcListValue:                  null,
    calcInpId:                      -1,
    calcInpValue:                   0,
};

function rdCurrency ( state = initState, action ) {
    switch ( action.type ) {

        case CURRENCY_ALL_LOAD_START:
            // console.log( "2. rd CURRENCY_ALL_LOAD_START" );
            return {
                ...state, ...{
                    currencyAllLoadStatus: 1,
                    currencyAllSource:     [],
                }
            };

        case CURRENCY_ALL_LOAD_SUCCESS:
            // console.log( '4. rd CURRENCY_ALL_LOAD_SUCCESS: ', action.currencyAllSource );
            return {
                ...state, ...{
                    currencyAllLoadStatus:    2,
                    currencyAllSource:        action.currencyAllSource,
                    currencyAllPrepareStatus: 0,
                    currencyAllData:          [],
                }
            };

        case CURRENCY_ALL_LOAD_ERROR:
            return {
                ...state, ...{
                    currencyAllLoadStatus: 3,
                    currencyAllSource:     [],
                }
            };

        case CURRENCY_ALL_SHOULD_BE_RELOADED:
            return {
                ...state, ...{
                    currencyAllLoadStatus:   0,
                    currencyAllSaveStatus:   0,
                }
            };

        case CURRENCY_SET_CURRENCY_ALL_DATA:
            return {
                ...state, ...{
                    currencyAllPrepareStatus: 2,
                    currencyAllData:          action.currencyAllData,
                }
            };

        case CURRENCY_LOAD_START:
            return {
                ...state, ...{
                    currencyLoadStatus: 1,
                    currencySource:     [],
                }
            };

        case CURRENCY_LOAD_SUCCESS:
            return {
                ...state, ...{
                    currencyLoadStatus:    2,
                    currencySaveStatus:    0,
                    currencySource:        action.currencySource,
                    currencyPrepareStatus: 0,
                    currencyData:          [],
                }
            };

        case CURRENCY_LOAD_ERROR:
            return {
                ...state, ...{
                    currencyLoadStatus: 3,
                    currencySource:     [],
                }
            };

        case CURRENCY_SHOULD_BE_RELOADED:
            return {
                ...state, ...{
                    currencyLoadStatus:   0,
                    currencySaveStatus:   0,
                }
            };

        case CURRENCY_SET_CURRENCY_DATA:
            return {
                ...state, ...{
                    currencyPrepareStatus: 2,
                    currencyData:          action.currencyData,
                }
            };

        case CURRENCY_SELECT:
            return {
                ...state, ...{
                    currencySelectedIndex: action.currencySelectedIndex,
                }
            };

        case CURRENCY_DYNAMIC_LOAD_START:
            return {
                ...state, ...{
                    currencyDynamicLoadStatus: 1,
                    currencyDynamicSource:     [],
                }
            };

        case CURRENCY_DYNAMIC_LOAD_SUCCESS:
            return {
                ...state, ...{
                    currencyDynamicLoadStatus:    2,
                    currencyDynamicSource:        action.currencyDynamicSource,
                    currencyDynamicPrepareStatus: 0,
                    currencyDynamicData:          [],
                }
            };

        case CURRENCY_DYNAMIC_LOAD_ERROR:
            return {
                ...state, ...{
                    currencyDynamicLoadStatus: 3,
                    currencyDynamicSource:     [],
                }
            };

        case CURRENCY_DYNAMIC_SHOULD_BE_RELOADED:
            return {
                ...state, ...{
                    currencyDynamicLoadStatus:   0,
                }
            };

        case CURRENCY_DYNAMIC_SET_START_DATE:
            return {
                ...state, ...{
                    currencyDynamicStartDate:          action.currencyDynamicStartDate,
                }
            };

        case CURRENCY_DYNAMIC_SET_END_DATE:
            return {
                ...state, ...{
                    currencyDynamicEndDate:          action.currencyDynamicEndDate,
                }
            };

        case CURRENCY_DYNAMIC_SET_START_POINT:
            return {
                ...state, ...{
                    currencyDynamicStartPoint:          action.currencyDynamicStartPoint,
                }
            };

        case CURRENCY_DYNAMIC_SET_END_POINT:
            return {
                ...state, ...{
                    currencyDynamicEndPoint:          action.currencyDynamicEndPoint,
                }
            };

        case CURRENCY_DYNAMIC_SET_POINTS:
            return {
                ...state, ...{
                    currencyDynamicStartPoint:        action.currencyDynamicStartPoint,
                    currencyDynamicEndPoint:          action.currencyDynamicEndPoint,
                }
            };

        case CURRENCY_DYNAMIC_SET_CURRENCY_DATA:
            return {
                ...state, ...{
                    currencyDynamicPrepareStatus: 2,
                    currencyDynamicData:          action.currencyDynamicData,
                }
            };

        case CURRENCY_DYNAMIC_SELECT:
            return {
                ...state, ...{
                    currencyDynamicCurID: action.currencyDynamicCurID,
                }
            };

        case CURRENCY_SET_CALC_INP_ID:
            return {
                ...state, ...{
                    calcInpId: action.calcInpId,
                }
            };

        case CURRENCY_SET_CALC_INP_VALUE:
            return {
                ...state, ...{
                    calcInpValue: action.calcInpValue,
                }
            };

        case CURRENCY_SET_CALC_LIST_VALUE:
            return {
                ...state, ...{
                    calcListValue: action.calcListValue,
                }
            };

        default:
            return state;
    }
}

export default rdCurrency;