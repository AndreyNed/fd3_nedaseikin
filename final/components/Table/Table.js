'use strict';

import React from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import {findArrayItemIndex, isExists, isNotEmpty} from "../../utils/utils";

import './Table.scss';

class Table extends React.PureComponent {

    static SORT_TYPES = {
        NONE:           'NONE',
        ASCENDED:       'ASCENDED',
        DESCENDED:      'DESCENDED',
    };

    static propTypes = {
        htmlID:                         PropTypes.string,
        uniqueKey:                      PropTypes.string, // fieldId with unique key
        headers:                        PropTypes.arrayOf(
            PropTypes.shape({
                id:                     PropTypes.string,
                text:                   PropTypes.string,
                isSortable:             PropTypes.bool,
                isSorted:               PropTypes.oneOf([
                    Table.SORT_TYPES.NONE,
                    Table.SORT_TYPES.ASCENDED,
                    Table.SORT_TYPES.DESCENDED,
                ]),
                options:                PropTypes.shape({
                    colWidth:           PropTypes.oneOfType([
                        PropTypes.number,
                        PropTypes.string
                    ])
                }),
            })
        ),
        rows:                           PropTypes.arrayOf(
            PropTypes.shape({
                isSelected:             PropTypes.bool,
                rowIndex:               PropTypes.string,
                cells:                  PropTypes.arrayOf(
                    PropTypes.shape({
                        id:             PropTypes.string,
                        value:          PropTypes.any,
                        text:           PropTypes.string,
                    })
                ),
            }),
        ),
        options:                        PropTypes.shape({
            tableWidth:                 PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string,
            ]),
        }),
        cbChanged:                      PropTypes.func,
        cbSelected:                     PropTypes.func,
    };

    static defaultProps = {
        headers:        [],
        rows:           [],
        options: {
            tableWidth: 0,
        },
        cbChanged: null,
    };

    static classID = 0;

    static getHtmlID = ( data ) => {
        return ( data !== null && data !== undefined )
            ? data
            : 'Table_' + Table.classID;
    };

    constructor( props ) {
        super( props );
        Table.classID++;
        this.state = {
            htmlID: Table.getHtmlID( props.htmlID ),
        }
    }

    debug_mode = false;

    classCSS = 'Table';

    componentWillMount() {
        this.prepareData( this.props );
    }

    componentWillReceiveProps( newProps ) {
        this.prepareData( newProps );
    }

    prepareData = ( props ) => {
        ( this.debug_mode ) &&
            console.log( this.classCSS + ': prepareData: new props: ', props );

        let state = { htmlID: this.state.htmlID, headers: [], rows: [] };
        const { headers, rows } = props;

        if ( isNotEmpty( headers ) ) {
            state.headers = [ ...headers ];

            if ( isNotEmpty( rows ) ) {
                state.rows = [ ...rows ];
            }
        }

        this.setState( state, () => {
            ( this.debug_mode )
                && console.log( this.classCSS + ': prepareData: new state: ', this.state );
        } );
    };

    /* == controller == */

    rowClick = ( e ) => {
        let rowIndex = e.currentTarget.dataset.row_index;
        this.rowSelect( rowIndex );
    };

    rowDoubleClick = ( e ) => {
        this.rowChoose();
    };

    /* == action functions == */

    rowSelect = ( rowIndex ) => {
        const { cbChanged } = this.props;
        const { rows } = this.state;
        let index = findArrayItemIndex( rows, { rowIndex: rowIndex } );
        const { cells } = rows[ index ];
        let value = cells[ 0 ].value;
        // console.log( 'Table: rowSelect: operation`s id: ', value );
        if ( cbChanged ) cbChanged( value );
    };

    rowChoose = () => {
        const { cbSelected } = this.props;
        if ( cbSelected ) cbSelected();
    };

    /* == renders == */

    renderHeader = () => {
        const { headers } = this.state;
        return (
            <div className = { this.classCSS + '_header' }>
                { headers.map( ( item, index ) => {
                    return (
                        <div className = { this.classCSS + '_th' }
                             key = { index }
                             data-id = { item.id }
                             style = {{
                                 width: ( item.options.colWidth != 0 ) ? item.options.colWidth : 'auto',
                             }}>
                            { item.text }
                        </div>
                    )
                } ) }
            </div>
        )
    };

    renderBody = () => {
        const { rows } = this.state;
        return (
            <div className = { this.classCSS + '_body' }>
                {
                    ( isNotEmpty( rows ) ) &&
                        rows.map( ( item, index ) => {
                            return this.renderRow( item, index );
                        } )
                }
            </div>
        )
    };

    renderRow = ( item, index ) => {
        return (
            <div className = { this.classCSS + '_tr' }
                 key = { item.rowIndex }
                 data-row_index = { item.rowIndex }
                 data-selected = { item.isSelected }
                 onClick = { this.rowClick }
                 onDoubleClick = { this.rowDoubleClick }>
                { item.cells.map( ( cell, cellIndex ) => {
                    return this.renderCell( cell, cellIndex )
                } ) }
            </div>
        )
    };

    renderCell = ( cell, cellIndex ) => {
        return (
            <div className = { this.classCSS + '_td' }
                 key = { cellIndex }
                 data-cell_id = { cell.id }
                 data-cell_value = { cell.value }>
                { cell.text }
            </div>
        )
    };

    render() {
        const { tableWidth } = this.props.options;
        return (
            <div className = { this.classCSS }
                 style = {{
                     width: ( tableWidth != 0 ) ? tableWidth : 'auto',
                 }}>
                { this.renderHeader() }
                { this.renderBody() }
            </div>
        )
    }

}

export default Table;
