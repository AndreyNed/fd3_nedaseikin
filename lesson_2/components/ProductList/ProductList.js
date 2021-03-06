'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import { isExists, isNotEmpty, isNotNaN, isGTZero, arraySort, arraySortByField } from "../../utils/utils";

import './ProductList.scss';

class ProductList extends React.PureComponent {

    constructor( props ) {
        super( props );
        this.state = { ...props };
    }

    static propTypes = {
        label:              PropTypes.string,
        isSorted:           PropTypes.bool,
        defValue:           PropTypes.string,
        value:              PropTypes.string,
        listValue:          PropTypes.arrayOf(
            PropTypes.shape({
                id:         PropTypes.string,
                name:       PropTypes.string,
                price:      PropTypes.number,
                count:      PropTypes.number,
                comment:    PropTypes.string,
                filtered:   PropTypes.bool,
            })
        ),
        filterValue:        PropTypes.string,
        options:            PropTypes.shape({
            listBoxHeight:  PropTypes.number,
        }),
        cbItemClicked:      PropTypes.func,
        cbCheckboxClicked:  PropTypes.func,
        cbFilterChanged:    PropTypes.func,
    };

    static defaultProps = {
        label:              '',
        isSorted:           false,
        listValue:          null,
        filterValue:        '',
        options: {
            listBoxHeight:  0,
        },
        cbItemClicked:      null,
        cbCheckboxClicked:  null,
        cbFilterChanged:    null,
    };

    componentWillMount() {
        this.prepareState( this.state );
    }

    componentWillReceiveProps( newProps ) {
        this.prepareState( newProps );
    }

    prepareState = ( props ) => {
        let state = { ...ProductList.defaultProps };
        state = ( isExists( props ) )
            ? { ...state, ...props, options: state.options }
            : null;
        state.options = ( isExists( props.options ) )
            ? { ...state.options, ...props.options }
            : null;
        state.listValue = ( isNotEmpty( state.listValue ) )
            ? state.listValue.map( ( item, index ) => {
                return {...item, itemIndex: index, filtered: this.filterItem( item, 'name', state.filterValue ) }
              } )
            : null;
        state.listSortedValue = ( state.isSorted )
            ? arraySortByField( state.listValue, 'name' )
            : state.listValue;
        state.value = ( isNotEmpty( state.defValue ) )
            ? state.defValue
            : '';
        this.setState( state, () => {
            // console.log( 'ProductList: prepareState: state: ', this.state );
        } );
    };

    classCSS = 'ProductList';

    // == controller ==

    itemClick = ( e ) => {
        let index = parseInt( e.currentTarget.dataset.index );
        index = ( isNotNaN( index ) )
            ? index
            : -1;
        if ( index > -1 && isNotEmpty( this.state.listValue ) )
            this.selectItem( index );

    };

    checkboxChange = ( e ) => {
        if ( this.state.cbCheckboxClicked ) {
            this.state.cbCheckboxClicked( !this.state.isSorted );
        }
        else
        {
            this.setState( {
                isSorted: !this.state.isSorted,
            }, () => {
                // console.log( "isSorted: ", this.state.isSorted );
            } );
        }
    };

    filterChange = ( e ) => {
        let filterValue = e.currentTarget.value;
        this.setState( { filterValue }, () => {} );
    };

    filterKeyDown = ( e ) => {
        switch ( e.keyCode ) {
            case 13:
                this.filterAccept();
                break;
        }
    };

    filterAccept = () => {
        if ( this.state.cbFilterChanged ) {
            this.state.cbFilterChanged( this.state.filterValue );
        }
    };

    clearFilterClick = () => {
        if ( this.state.cbFilterChanged ) {
            this.state.cbFilterChanged( '' );
        }
        else
        {
            this.setState( {
                filterValue: '',
            }, () => {} );
        }
    };

    // == action functions ==

    selectItem = ( index ) => {
        let value = '';
        let listValue = this.state.listValue.map( ( item, itemIndex ) => {
            value = ( itemIndex === index )
                ? item.id
                : value;
            return { ...item, selected: ( itemIndex === index ) };
        } );

        this.setState( {
            value:     value,
            listValue: listValue,
        }, () => {
            if ( this.state.cbItemClicked )
                this.state.cbItemClicked( this.state.value );
        } );
    };

    // == additional functions

    filterItem = (obj, field, filterValue ) => {
        return ( !isNotEmpty( filterValue ) )
            ? true
            : ( isExists( obj ) &&
                isNotEmpty( field ) &&
                ( obj[ field ].trim().toLowerCase()
                    .indexOf( filterValue.trim().toLowerCase() ) > -1 ) );
    };

    render() {
        // console.log( '%c%s', 'color: red; font-weight: bold;', 'render...' );

        return (
            <div className = { this.classCSS }>
                <div className = { this.classCSS + "_label_box" }>
                    <label htmlFor="">
                        { this.state.label }
                    </label>
                </div>
                <div className = { this.classCSS + "_filter_box" }>
                    <div className = { this.classCSS + "_checkbox_container" }>
                        <input className = { this.classCSS + "_checkbox" }
                               type="checkbox"
                               checked =  { this.state.isSorted }
                               onChange = { this.checkboxChange }/>
                    </div>
                    <div className = { this.classCSS + "_filter_container" }>
                        <input className = { this.classCSS + "_filter" }
                               type =      "text"
                               value =     { this.state.filterValue }
                               style =     {{
                                    paddingRight: ( isNotEmpty( this.state.filterValue ) )
                                        ? '20px'
                                        : '8px',
                               }}
                               onChange =  { this.filterChange }
                               onBlur =    { this.filterAccept }
                               onKeyDown = { this.filterKeyDown }/>
                        {
                            ( isNotEmpty( this.state.filterValue ) ) &&
                            <div className = { this.classCSS + "_icon_container" }
                                 onClick = { this.clearFilterClick }>
                                <svg className = { this.classCSS + "_icon" }
                                     width =   "16px"
                                     height =  "16px"
                                     viewBox = "0 0 16 16"
                                     preserveAspectRatio = "xMidYMid"
                                     xmlns = "http://www.w3.org/2000/svg">
                                    <g>
                                        <circle cx="8" cy="8" r="7.5"
                                                stroke = "#ffffff"
                                                strokeWidth = "1"
                                                fill = "#ffffff"/>
                                        <path d = "M 4 4 L 12 12 M4 12 L 12 4"
                                              stroke = "#000000"
                                              strokeWidth = "1"
                                              fill = "none"/>
                                    </g>
                                </svg>
                            </div>
                        }
                    </div>
                </div>
                <div className = { this.classCSS + "_list_box" }>
                    {
                        isNotEmpty( this.state.listSortedValue ) &&
                            <div className = { this.classCSS + "_list" }
                                 style = {{
                                     height: ( isGTZero( this.state.options.listBoxHeight > 0 ) )
                                         ? this.state.options.listBoxHeight
                                         : 'auto',
                                 }}>
                                {
                                    this.state.listSortedValue.map( ( item ) => {
                                        return ( item.filtered )
                                            ? (
                                                <div className = { this.classCSS + "_list_item" }
                                                     key = { item.id }
                                                     data-value = { item.id }
                                                     data-index = { item.itemIndex }
                                                     data-selected = { item.id === this.state.value } // { item.selected }
                                                     onClick = { this.itemClick }>
                                                    { item.name }
                                                </div>
                                            )
                                            : null;
                                    } )
                                }
                            </div>
                    }
                </div>

            </div>
        )
    }

}

export default ProductList;
