'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { MODAL_CONTENT, OPERATION_TYPES } from "../../data_const/data_const";

import TextInput from '../TextInput/TextInput';
import ComboInput from '../ComboInput/ComboInput';
import DateInput from '../DateInput/DateInput';

import './OperationCard.scss';
import {isExists} from "../../utils/utils";

class OperationCard extends React.PureComponent {

    static propTypes = {
        operationCardIsVisible:     PropTypes.bool,
        isNewOperationAdded:        PropTypes.bool,
        modalContent:               PropTypes.string,

        accountsData:               PropTypes.arrayOf(
            PropTypes.shape({
                id:                 PropTypes.number,
                name:               PropTypes.string,
                amount:             PropTypes.number,
            })
        ),
        operationCategoriesData:    PropTypes.arrayOf(
            PropTypes.shape({
                id:                 PropTypes.number,
                name:               PropTypes.string,
            })
        ),
        operationsData:             PropTypes.arrayOf(
            PropTypes.shape({
                id:                 PropTypes.number,
                accountId:          PropTypes.number,
                categoryId:         PropTypes.number,
                type:               PropTypes.string,
                sum:                PropTypes.number,
                date:               PropTypes.any,
                comment:            PropTypes.string,
            })
        ),

        operationSelectedIndex:     PropTypes.number,

        operationValue:             PropTypes.shape({
            id:                     PropTypes.number,
            accountId:              PropTypes.number,
            categoryId:             PropTypes.number,
            type:                   PropTypes.string,
            sum:                    PropTypes.number,
            date:                   PropTypes.any,
            comment:                PropTypes.string,
        }),
    };

    static defaultProps = {
        operationCardIsVisible: false,
        operationValue: {
            id:                     0,
            accountId:              0,
            categoryId:             0,
            type:                   OPERATION_TYPES.CREDIT,
            sum:                    0,
            date:                   new Date(),
            comment:                '',
        },
    };

    static classID = 0;

    static getHtmlID = ( data ) => {
        return ( data !== null && data !== undefined )
            ? data
            : 'OperationCard_' + OperationCard.classID;
    };

    constructor( props ) {
        super( props );
        OperationCard.classID++;
        this.state = {
            htmlID: OperationCard.getHtmlID( props.htmlID ),
        }
    }

    debug_mode = true;

    classCSS = 'OperationCard';

    componentWillMount() {
        this.prepareData( this.props );
    }

    componentWillReceiveProps( newProps ) {
        this.prepareData( newProps );
    }

    prepareData = ( props ) => {
        ( this.debug_mode ) &&
            console.log( 'OperationCard: prepareData: new props: ', props );
        let newState = {};
        const { isNewOperationAdded, operationSelectedIndex, operationsData } = props;
        console.log( 'OperationCard: prepareData: consts: ', isNewOperationAdded, operationSelectedIndex, operationsData );
        newState.operationValue = ( isNewOperationAdded )
            ? { ...OperationCard.defaultProps.operationValue }
            : { ...operationsData[ operationSelectedIndex ] };

        this.setState( { ...newState }, () => {
            ( this.debug_mode ) &&
                console.log( 'OperationCard: prepareData: new state: ', this.state );
        } );
    };

    formProps = () => {
        const { accountId, categoryId, type, sum, date, comment } = this.state.operationValue;
        return {
            header: {
                title:  '',
            },
            account: {
                label:              'Счет',
                defValue:           accountId + '',
                withLabel:          true,
                display:            TextInput.displayTypes.block,
                options: {
                    labelPosition:  TextInput.position.left,
                    labelBoxWidth:  '35%',
                    inputBoxWidth:  '65%',
                },
                cbChanged: null,
            },
            category: {
                label:              'Категория',
                defValue:           categoryId + '',
                withLabel:          true,
                display:            TextInput.displayTypes.block,
                options: {
                    labelPosition:  TextInput.position.left,
                    labelBoxWidth:  '35%',
                    inputBoxWidth:  '65%',
                },
                cbChanged: null,
            },
            type: {
                label:              'Тип',
                defValue:           type,
                withLabel:          true,
                display:            TextInput.displayTypes.block,
                options: {
                    labelPosition:  TextInput.position.left,
                    labelBoxWidth:  '35%',
                    inputBoxWidth:  '65%',
                },
                cbChanged: null,
            },
            sum: {
                label:              'Сумма',
                defValue:           sum + '',
                withLabel:          true,
                display:            TextInput.displayTypes.block,
                options: {
                    labelPosition:  TextInput.position.left,
                    labelBoxWidth:  '35%',
                    inputBoxWidth:  '65%',
                },
                cbChanged: null,
            },
            date: {
                label:              'Дата',
                defValue:           date + '',
                withLabel:          true,
                display:            TextInput.displayTypes.block,
                options: {
                    labelPosition:  TextInput.position.left,
                    labelBoxWidth:  '35%',
                    inputBoxWidth:  '65%',
                },
                cbChanged: null,
            },
            comment: {
                label:              'Комментарий',
                defValue:           comment,
                withLabel:          true,
                display:            TextInput.displayTypes.block,
                options: {
                    labelPosition:  TextInput.position.left,
                    labelBoxWidth:  '35%',
                    inputBoxWidth:  '65%',
                },
                cbChanged: null,
            },
        }
    };

    formClick = ( e ) => {
        e.stopPropagation();
    };

    render() {
        const { modalContent, isNewOperationAdded } = this.props;
        let props = this.formProps();
        return ( modalContent === MODAL_CONTENT.OPERATION_CARD ) &&
            <div className = { this.classCSS }
                 onClick = { this.formClick }>
                <div className = { this.classCSS + '_form' }>
                    <div className="rows"
                         key="header">
                        <div className="cols col_16 header">
                            <span className = { this.classCSS + '_header' }>
                                {
                                    ( isNewOperationAdded )
                                        ? "Новая операция"
                                        : "Операция"
                                }
                            </span>
                        </div>
                    </div>
                    <div className="rows"
                         key="account">
                        <div className="cols col_16">
                            <TextInput { ...props.account } />
                        </div>
                    </div>
                    <div className="rows"
                         key="category">
                        <div className="cols col_16">
                            <TextInput { ...props.category } />
                        </div>
                    </div>
                    <div className="rows"
                         key="typeSum">
                        <div className="cols col_16"
                             key="type">
                            <TextInput { ...props.type } />
                        </div>
                    </div>
                    <div className="rows"
                         key="sum">
                        <div className="cols col_16">
                            <TextInput { ...props.sum } />
                        </div>
                    </div>
                    <div className="rows"
                         key="date">
                        <div className="cols col_16">
                            <TextInput { ...props.date } />
                        </div>
                    </div>
                    <div className="rows"
                         key="comment">
                        <div className="cols col_16">
                            <TextInput { ...props.comment } />
                        </div>
                    </div>
                </div>
            </div>
    }

}

const mapStateToProps = function ( state ) {
    return {
        accountsData:                   state.data.accountsData,
        operationCategoriesData:        state.data.operationCategoriesData,
        operationsData:                 state.data.operationsData,
        operationSelectedIndex:         state.data.operationSelectedIndex,

        isNewOperationAdded:            state.ui.isNewOperationAdded,
        modalContent:                   state.ui.modalContent,
    }
};

export default connect( mapStateToProps )( OperationCard );