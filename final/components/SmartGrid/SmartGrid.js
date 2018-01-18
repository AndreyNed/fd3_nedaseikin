import React from 'react';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';

import TextInput from '../TextInput/TextInput';

import { SORTING, DATA_TYPES } from "../../data_const/data_const";
import { CONFIG_DEBUG_MODE, CONFIG_DEBUG_MODE_SMART_GRID } from "../../config/config";

import { isExists, isNotEmpty, isExistsAll, isNotEmptyAll, isNotNaN, isGTZero, findArrayItemIndex, findArrayItem } from "../../utils/utils";
import { buildOrderedRows, filterValue, addTextField, sortingRows, getRowSelectedIndex, getPagesInfo, changeThOrder, getIndexesInPage } from "./smart_grid_utils";

import './SmartGrid.scss';

class SmartGrid extends React.PureComponent {

    static propTypes = {

        htmlID:                         PropTypes.string,

        withCaption:                    PropTypes.bool,
        withFilter:                     PropTypes.bool,
        withFooter:                     PropTypes.bool,

        caption:                        PropTypes.string,
        textFilterValue:                PropTypes.string,
        rowsPerPage:                    PropTypes.number,

        primaryId:                      PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]).isRequired,

        headers:                        PropTypes.arrayOf(
            PropTypes.shape({
                id:                     PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string
                ]),
                title:                  PropTypes.string,
                dataType:               PropTypes.oneOf([ // тип данных для ячеек в соответствующем столбце (для последующего преобразования в текст)
                    DATA_TYPES.NUMBER,
                    DATA_TYPES.STRING,
                    DATA_TYPES.DATE,
                    DATA_TYPES.DATE_TIME,
                    DATA_TYPES.DATE_MS_INT,
                ]),
                isSortable:             PropTypes.bool,
                sorting:                PropTypes.oneOf([
                    SORTING.NONE,
                    SORTING.ASCENDED,
                    SORTING.DESCENDED,
                ]),
                isSearchable:           PropTypes.bool,
                isVisible:              PropTypes.bool,
                width:                  PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string,
                ]),
                childElement:           PropTypes.func,
                cbChanged:              PropTypes.func,
            })
        ),

        body:                           PropTypes.arrayOf(
            PropTypes.shape({
                rowIndex:               PropTypes.number,
                cells:                  PropTypes.arrayOf(
                    PropTypes.shape({
                        id:             PropTypes.string, // значение id в ячейке заголовка того же столбца
                        value:          PropTypes.oneOfType([
                            PropTypes.number,
                            PropTypes.string,
                        ]),
                        text:           PropTypes.string,
                        childElement:   PropTypes.func,
                        cbChanged:      PropTypes.func,
                    }),
                ),
            })
        ),

        pages:                          PropTypes.arrayOf([
            PropTypes.shape({
                id:                     PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string,
                ]),
                label:                  PropTypes.string,
            })
        ]),

        buttons:                        PropTypes.arrayOf(
            PropTypes.shape({
                id:                     PropTypes.oneOfType([
                    PropTypes.number,
                    PropTypes.string,
                ]),
                title:                  PropTypes.string,
                cbChanged:              PropTypes.func,
            })
        ),

        defValue:                       PropTypes.oneOfType([ // значение id ячейки в столбце с уникальным ключом
            PropTypes.number,
            PropTypes.string,
        ]),
        value:                          PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),

        rowSelectedIndex:               PropTypes.number,
        colSelectedIndex:               PropTypes.oneOfType([ // соответствует id заголовка
            PropTypes.number,
            PropTypes.string,
        ]),
        pageSelectedIndex:              PropTypes.number,
        rowUpperIndex:                  PropTypes.number,
        rowBottomIndex:                 PropTypes.number,

        tableWidth:                     PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),

        dragMode:                   PropTypes.bool,
        // dragX:                          PropTypes.number,
        // dragY:                          PropTypes.number,

        cbChanged:                      PropTypes.func,
        cbFiltered:                     PropTypes.func,
    };

    static defaultProps = {
        wwithCaption:                   true,
        withFilter:                     true,
        withFooter:                     true,

        textFilterValue:                '',

        primaryId:                      null,

        headers:                        null,
        body:                           null,
        pages:                          null,
        buttons:                        null,

        defValue:                       null,

        rowSelectedIndex:               -1,
        colSelectedIndex:               '',
        pageSelectedIndex:              -1,

        tableWidth:                     '100%',

        cbChanged:                      null,
        cbFiltered:                     null,
    };

    static classID = 0;

    static getHtmlID = ( htmlID ) => (
        isExists( htmlID ) &&
        isNotEmpty( htmlID + '' )
            ? htmlID
            : 'SmartGrid_' + SmartGrid.classID
    );

    constructor( props ) {
        super( props );
        const { htmlID } = props;
        SmartGrid.classID++;
        this.state = {
            htmlID: SmartGrid.getHtmlID( htmlID )
        };

        this.debug_mode = CONFIG_DEBUG_MODE && CONFIG_DEBUG_MODE_SMART_GRID;
        ( this.debug_mode ) &&
            console.log( '%c%s', 'color: blue; font-weight: bold',
                         'SmartGrid: constructor: props: ', props, '; state: ', this.state );
        this.classCSS = 'SmartGrid';

        // array of headers divs
        this.tHs = null;

        // for dragging
        this.thTimer = null;
        this.thStartColumn = null;
        this.thEndColumn = null;

        // for resizing
        this.thResizeHandler = null;
        this.headerWidth = null;
        this.startWidth = null;
        this.resizeStartX = null;
        this.resizeEndX = null;
    }

    componentWillMount() {
        this.prepareData( this.props );
    }

    componentWillReceiveProps( newProps ) {
        this.prepareData( newProps );
    }

    prepareData = ( newProps ) => {
        ( this.debug_mode ) &&
            console.log( '%c%s', 'color: blue; font-weight: bold',
                         'SmartGrid: prepareData: newProps: ', newProps );
        let { headers, body, withFilter, withFooter, cbFiltered, textFilterValue, primaryId, defValue, rowsPerPage } = newProps;
        let newState = { ...this.state };
        let value = null;
        let draggingMode = false;

        if ( isNotEmptyAll( [ headers, body ] ) ) {
            // 1. Построить ячейки в строке в том же порядке, что и в заголовке ( по id )
            body = buildOrderedRows( headers, body );
            // 2. Добавить поле text в ячейки для текстового поиска и отображения в таблице
            body = addTextField( headers, body );
            // 3. Выполнить фильтрацию строк
            if ( withFilter ) {
                isNotEmpty( textFilterValue )
                    ? body = filterValue( headers, body, textFilterValue )
                    : body;
            }
            else if ( cbFiltered ) {
                body = cbFiltered( body );
            }
            // 4. Отсортировать строки
            body = sortingRows( headers, body, null );
            // 5. Определить выделенную строку ( rowIndex по defValue )
            if ( isExists( defValue ) ) {
                newState.rowSelectedIndex = getRowSelectedIndex( body, primaryId, defValue );
            }
            // 6. Определяем пагинацию, верхний и нижний индекс в массиве строк, выделенную страницу
            let options = {
                withFooter,
                rowsPerPage,
                body,
                rowSelectedIndex: newState.rowSelectedIndex,
            };
            newState = {
                ...newState,
                ...getPagesInfo( options ),
            };
            // 7. Определяем value
            value = ( isExists( defValue ) )
                ? defValue
                : null;
        }

        newState = { ...newState, headers, body, textFilterValue, value, dragMode: draggingMode };

        this.setState( { ...newState }, () => {
            ( this.debug_mode ) &&
                console.log( '%c%s', 'color: blue; font-weight: bold',
                    'SmartGrid: prepareData: state: ', this.state );
        } );
    };

    filterProps = () => {
        const { textFilterValue } = this.state;
        return {
            defValue: textFilterValue,
            withLabel: false,
            inputType: TextInput.inputTypes.search,
            cbChanged: this.filter_cbChanged,
        }
    };

    /* == callbacks == */

    filter_cbChanged = ( text ) => {
        const { headers, value, rowSelectedIndex } = this.state;
        const { body, withFilter, cbFiltered, withFooter, rowsPerPage } = this.props;

        // 1. Привести порядок столбцов в теле к таковому в заголовке
        let newBody = buildOrderedRows( headers, body );
        // 2. Добавить поле text в ячейки для текстового поиска и отображения в таблице
        newBody = addTextField( headers, newBody );
        // 3. Выполнить фильтрацию строк
        if ( withFilter ) {
            isNotEmpty( text )
                ? newBody = filterValue( headers, newBody, text )
                : newBody;
        }
        else if ( cbFiltered ) {
            newBody = cbFiltered( newBody );
        }
        // 4. Отсортировать строки
        newBody = sortingRows( headers, newBody, body );
        // 5. Определить выделенную строку ( rowIndex по defValue )
        /*if ( isExists( value ) ) {
            rowSelectedIndex = getRowSelectedIndex( newBody, primaryId, value );
        }*/
        // 6. Определяем пагинацию, верхний и нижний индекс в массиве строк, выделенную страницу
        let options = {
            withFooter,
            rowsPerPage,
            body: newBody,
            rowSelectedIndex,
        };

        this.setState( {
            textFilterValue: text,
            body: newBody,
            ...getPagesInfo( options ),
        }, () => {
            ( this.debug_mode ) && console.log( '-- SmartGrid: filter_cbChanged: 6) state: ', this.state );
        } );
    };

    /* == controller == */

    trClick = ( e ) => {
        let rowSelectedIndex = parseInt( e.currentTarget.dataset.row_index );
        this.selectRow( rowSelectedIndex );
    };

    trDblClick = () => {
        const { primaryId, cbChanged } = this.props;
        const { body, rowSelectedIndex } = this.state;
        let row = findArrayItem( body, { rowIndex: rowSelectedIndex } );
        let cell = findArrayItem( row.cells, { id: primaryId } );
        let value = cell.value;
        if ( cbChanged ) {
            cbChanged( value );
        }
        else {
            this.setState( { value }, () => {
                console.log( 'SmartGrid: cbChanged is missed, new value: ', this.state.value );
            } );
        }
    };

    thMouseDown = ( e ) => {
        let elm = e.currentTarget;

        (this.debug_mode) &&
            console.log( 'SmartGrid: thMouseDown: th start: ', elm );

        this.thTimer = setTimeout( this.startDragging, 300 );
        window.addEventListener( 'mouseup', this.windowMouseUpStopColumnDragging, false );

        this.thStartColumn = elm.dataset.th_id;
        ( this.debug_mode ) &&
            console.log( 'thMouseDown: timer: ', this.thTimer );
    };

    thMouseUp = ( e ) => {
        const { dragMode } = this.state;

        ( this.debug_mode ) &&
            console.log( 'SmartGrid: thMouseUp: ', dragMode );

        let thId = e.currentTarget.dataset.th_id;

        if ( dragMode ) {
            let elm = e.currentTarget;
            elm.dataset.visible_pointer = "false";

            (this.debug_mode) &&
                console.log( 'SmartGrid: thMouseUp: th end: ', elm );

            this.thEndColumn = elm.dataset.th_id;
            this.changeColumns();
        }
        else {
            this.changeSorting( thId );
        }
    };

    thClick = ( e ) => {

    };

    thMouseOver = (e ) => {
        e.currentTarget.dataset.visible_pointer = "true";
    };

    thMouseOut = (e ) => {
        e.currentTarget.dataset.visible_pointer = "false";
    };

    resizeHandlerMouseDown = ( e ) => {
        e.stopPropagation();
        e.preventDefault();
        ( isExists( this.thResizeHandler ) ) && ( this.thResizeHandler.dataset.active = false );
        this.thResizeHandler = e.currentTarget;
        let parent = this.thResizeHandler.parentElement;
        this.startWidth = parent.offsetWidth;
        this.headerWidth = parent.parentElement.offsetWidth;

        let thId = parent.dataset.th_id;
        let thIndex = null;

        this.tHs.forEach( ( th, index ) => {
            let width = ( th.offsetWidth / this.headerWidth * 100 ) + '%';
            let id = th.dataset.th_id;
            thIndex = ( id === thId )
                ? index
                : thIndex;
            th.style.width = width;
            console.log( 'th: ', index, ': id: ', id, ': width: ', width );
        } );

        this.tHs[ thIndex + 1 ].style.width = 'auto';

        this.thResizeHandler.dataset.active = "true";
        this.resizeStartX = e.clientX;
        ( this.debug_mode ) &&
            console.log( 'SmartGrid: resizeHandlerMouseDown: ', this.thResizeHandler, '; clientX: ', this.resizeStartX );
        document.addEventListener( 'mouseup', this.documentMouseUpStopColumnResize, false );
        document.addEventListener( 'mousemove', this.documentMouseMoveColumnResize, false );
    };

    resizeHandlerMouseUp = ( e ) => {
        e.stopPropagation();
        e.preventDefault();
        ( isExists( this.thResizeHandler ) ) && ( this.thResizeHandler.dataset.active = "false" );
        e.currentTarget.dataset.active = "false";
    };

    resizeHandlerMouseEnter = ( e ) => {
        e.stopPropagation();
        e.preventDefault();
    };

    resizeHandlerMouseLeave = ( e ) => {
        e.stopPropagation();
        e.preventDefault();
    };

    resizeHandlerClick = ( e ) => {
        e.stopPropagation();
        e.preventDefault();
    };

    windowMouseUpStopColumnDragging = (e ) => {
        console.log( 'Window click!!! Stop dragging' );
        if ( isExists( this.thTimer ) ) {
            this.stopTimer();
        }
        window.removeEventListener( 'mouseup', this.windowMouseUpStopColumnDragging );
        this.setState( { dragMode: false } );
    };

    documentMouseMoveColumnResize = ( e ) => {
        this.resizeEndX = e.clientX;
        let delta = this.resizeEndX - this.resizeStartX;
        let th = this.thResizeHandler.parentElement;
        let width = ( this.startWidth + delta ) / this.headerWidth * 100;
        th.style.width = width + '%';
        ( this.debug_mode ) &&
            console.log( 'SmartGrid: documentMouseMoveColumnResize: ', th, '; width: ', width );
    };

    documentMouseUpStopColumnResize = ( e ) => {
        document.removeEventListener( 'mouseup', this.documentMouseUpStopColumnResize );
        document.removeEventListener( 'mousemove', this.documentMouseMoveColumnResize );
        ( isExists( this.thResizeHandler ) ) && ( this.thResizeHandler.dataset.active = 'false' );
        this.resizeEndX = e.clientX;
        ( this.debug_mode ) &&
            console.log( 'SmartGrid: documentMouseUpStopColumnResize: ', this.thResizeHandler.parentElement, '; resizeEndX: ', this.resizeEndX );
    };

    pageClick = ( e ) => {
        let pageId = parseInt( e.currentTarget.dataset.page_id );
        this.selectPage( pageId );
    };

    /* == UI action functions == */

    startDragging = () => {
        this.stopTimer();
        this.setState( { dragMode: true }, () => {
            ( this.debug_mode ) && console.log( 'Start dragging!!!' );
        })
    };

    stopTimer = () => {
        console.log( 'stopTimer: timer: ', this.thTimer );
        if ( isExists( this.thTimer ) ) {
            clearTimeout( this.thTimer );
            this.thTimer = null;
        }
    };

    changeColumns = () => {
        const { headers, body } = this.state;
        let newHeaders = changeThOrder( headers, body, this.thStartColumn, this.thEndColumn );
        ( this.debug_mode ) &&
            console.log( 'SmartGrid: changeColumns: newHeader: ', newHeaders );
        let newBody = buildOrderedRows( newHeaders, body );
        ( this.debug_mode ) &&
            console.log( 'SmartGrid: changeColumns: newBody: ', newBody );
        this.setState( {
            headers: newHeaders,
            body: newBody,
        } );
    };

    changeSorting = ( thId ) => {
        const { headers, body } = this.state;
        const defaultBody = this.props.body;
        const { NONE, ASCENDED, DESCENDED } = SORTING;

        let thIndex = findArrayItemIndex( headers, { id: thId } );
        const { isSortable } = headers[ thIndex ];

        if ( isSortable ) {
            let newHeaders = headers.map( ( th ) => {
                let { sorting, id } = th;

                if ( id === thId ) {
                    switch ( sorting ) {
                        case NONE:
                            sorting = ASCENDED;
                            break;
                        case ASCENDED:
                            sorting = DESCENDED;
                            break;
                        case DESCENDED:
                            sorting = NONE;
                            break;
                        default:
                            sorting = NONE;
                    }
                }
                else {
                    sorting = NONE;
                }
                return { ...th, sorting }
            } );

            let newBody = sortingRows( newHeaders, body, defaultBody );

            this.setState( {
                headers: newHeaders,
                body: newBody,
            } );
        }
    };

    selectRow = ( rowSelectedIndex ) => {
        this.setState( { rowSelectedIndex } );
    };

    selectPage = ( pageId ) => {
        const { body } = this.state;
        const { rowsPerPage } = this.props;
        let indexes = getIndexesInPage( body.length, rowsPerPage, pageId );
        let rowUpperIndex = indexes.rowUpperIndex;
        let rowBottomIndex = indexes.rowBottomIndex;
        this.setState( {
            pageSelectedIndex: pageId,
            rowUpperIndex,
            rowBottomIndex,
        } );
    };

    /* == renders == */

    /* CAPTION */
    renderCaption = () => {
        const { caption } = this.props;
        return (
            <div className = { this.classCSS + '_caption' }>
                { caption }
            </div>
        )
    };

    /* FILTER */
    renderFilter = () => {
        const props = this.filterProps();
        return (
            <div className = { this.classCSS + '_filter' }>
                <TextInput { ...props }/>
            </div>
        )
    };

    /* TABLE */
    renderTable = () => {
        const { tableWidth } = this.props;
        return (
            <div className = { this.classCSS + '_table' }
                 style = {{
                     width: ( tableWidth !== 0 )
                        ? tableWidth
                        : 'auto',
                 }}>
                { this.renderHeader() }
                { this.renderBody() }
            </div>
        )
    };

    renderHeader = () => {
        this.tHs = null;
        this.tHs = [];
        const { headers } = this.state;
        return ( isNotEmpty( headers ) ) &&
            <div className = { this.classCSS + '_header' }>
                { headers.map( ( th, index ) => this.renderTh( th, index ) ) }
            </div>
    };

    renderTh = ( th, index ) => {
        const { isVisible, isSortable, sorting, id } = th;
        const { NONE, ASCENDED, DESCENDED } = SORTING;
        const { dragMode, headers } = this.state;
        return ( isVisible ) &&
            <div className = { this.classCSS + '_th' }
                 key = { id }
                 ref = { ( elm ) => { this.tHs[ index ] = elm } }
                 data-th_id = { id }
                 data-visible_pointer = { false }
                 style = {{
                     width: ( th.width !== 0 )
                        ? th.width
                        : 'auto',
                 }}
                 onMouseDown = { ( !dragMode ) ? this.thMouseDown : null }
                 onMouseUp = { this.thMouseUp }
                 onClick = { this.thClick }
                 onMouseOver = { ( dragMode ) ? this.thMouseOver : null }
                 onMouseOut = { ( dragMode ) ? this.thMouseOut : null }>
                {
                    ( isSortable && sorting !== NONE ) &&
                        <div className = { this.classCSS + '_th_arrow_box' }
                             key="sort_arrow">
                            <svg className = { this.classCSS + '_th_arrow' }
                                 width = "100%"
                                 height = "100%"
                                 viewBox = "0 0 32 32"
                                 preserveAspectRatio= "xMidYMid meet"
                                 xmlns = "http://www.w3.org/2000/svg">
                                <path d="M 16 31 V 1 M 10 7 L 16 1 L 22 7"
                                      stroke="#898989"
                                      strokeWidth="2"
                                      fill="none"
                                      transform = {
                                          ( sorting === ASCENDED )
                                              ? "rotate(0,16,16)"
                                              : ( sorting === DESCENDED )
                                                  ? "rotate(180,16,16)"
                                                  : null
                                      }/>
                            </svg>
                        </div>
                }
                <div className = { this.classCSS + '_th_title_box' }
                     key="title"
                     style = {{
                         paddingLeft: ( isSortable && sorting !== NONE )
                            ? 0
                            : 14,
                     }}>
                    { th.title }
                </div>
                {
                    ( dragMode ) &&
                        <div className = { this.classCSS + '_th_drag_field' }
                             key="drag_pointer">
                            <svg className = { this.classCSS + '_th_drag_pointer' }
                                 width = "16px"
                                 height = "20px"
                                 viewBox = "0 0 32 40"
                                 preserveAspectRatio= "xMidYMid meet"
                                 xmlns = "http://www.w3.org/2000/svg">
                                <path d="M 16 1 L 24 12 H 19 V 39 H 13 V 12 H 8 Z"
                                      stroke="#000000"
                                      strokeWidth="1"
                                      fill="#000000"/>
                            </svg>
                        </div>
                }
                {
                    ( index < headers.length - 1 ) &&
                        <div className = { this.classCSS + '_resize_handler' }
                             key="resize_handler"
                             data-active = { false }
                             onMouseDown = { this.resizeHandlerMouseDown }
                             onMouseUp = { this.resizeHandlerMouseUp }
                             onMouseOver = { this.resizeHandlerMouseEnter }
                             onMouseOut = { this.resizeHandlerMouseLeave }
                             onClick = { this.resizeHandlerClick }>
                            <div className = { this.classCSS + '_resize_line' }>
                            </div>
                        </div>
                }
            </div>
    };

    renderBody = () => {
        const { body } = this.state;
        return (
            <div className = { this.classCSS + '_body' }>
                {
                    ( isNotEmpty(body) )
                        ?
                          body.map( ( row, index ) => this.renderRow( row, index ) )
                        :
                          <span className={this.classCSS + '_no_data_message'}>
                              Нет данных для отображения
                          </span>
                }
            </div>
        )
    };

    /*
    * rowSelectedIndex - указывает на значение rowIndex в строках боди
    * rowUpperIndex и rowBottomIndex - просто индексы строк в массиве боди для выбранной страницы
    * */
    renderRow = ( row, index ) => {
        const { rowSelectedIndex, rowUpperIndex, rowBottomIndex } = this.state;
        return ( index >= rowUpperIndex && index <= rowBottomIndex ) &&
            <div className = { this.classCSS + "_tr" }
                 key = { row.rowIndex }
                 data-selected = { row.rowIndex === rowSelectedIndex }
                 data-row_index = { row.rowIndex }
                 onClick = { this.trClick }
                 onDoubleClick = { this.trDblClick }>
                { row.cells.map( ( cell, cellIndex ) => this.renderTd( cell, cellIndex ) ) }
            </div>
    };

    renderTd = ( cell, index ) => {
        const { headers } = this.state;
        return ( headers[ index ].isVisible ) &&
            <div className = { this.classCSS + '_td' }
                 key = { cell.id }
                 style = {{
                     textAlign: ( isNotEmptyAll( [ headers, headers[ index ].align ] ) )
                         ? headers[ index ].align
                         : 'left',
                 }}>
                { cell.text }
            </div>
    };

    /* FOOTER */
    renderFooter = () => {
        return (
            <div className = { this.classCSS + '_footer' }>
                { this.renderPaginator() }
                { this.renderButtonPanel() }
            </div>
        )
    };

    renderPaginator = () => {
        const { pages, pageSelectedIndex } = this.state;
        return (
            <div className = { this.classCSS + '_paginator' }>
                {
                    ( isNotEmpty( pages ) && pages.length > 1 ) &&
                        <div className = { this.classCSS + '_pages_box' }>
                            {
                                pages.map( ( page, index ) => {
                                    return (
                                        <div className = { this.classCSS + '_page' }
                                             key = { page.id }
                                             data-page_selected = { ( page.id === pageSelectedIndex ) }
                                             data-page_id = { page.id }
                                             onClick = { this.pageClick }>
                                            <span className = { this.classCSS + '_page_number' }>
                                                { page.label }
                                            </span>
                                        </div>
                                    )
                                } )
                            }
                        </div>
                }
            </div>
        )
    };

    renderButtonPanel = () => {
        return (
            <div className = { this.classCSS + '_button_panel' }>
                Button panel
            </div>
        )
    };

    /* MAIN RENDER */
    render() {
        ( this.debug_mode ) &&
            console.log( '%c%s', 'color: blue; font-weight: bold',
                'SmartGrid: render: props: ', this.props, '; state: ', this.state );
        const { withCaption, withFilter, withFooter } = this.props;
        return (
            <div className = { this.classCSS }>
                { ( withCaption ) && this.renderCaption() }
                { ( withFilter ) && this.renderFilter() }
                { this.renderTable() }
                { ( withFooter ) && this.renderFooter() }
            </div>
        )
    }

}

export default SmartGrid;