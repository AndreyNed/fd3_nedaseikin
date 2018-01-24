'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { CONFIG_DEBUG_MODE, CONFIG_DEBUG_MODE_DELETE_CONFIRMATION } from "../../config/config";
import { MODAL_CONTENT, DELETE_MODES } from "../../data_const/data_const";

import ButtonOk from '../buttons/ButtonOk/ButtonOk';
import ButtonCancel from '../buttons/ButtonCancel/ButtonCancel';

import './DeleteConfirmation.scss';
import { acUIHideMatGlass } from "../../actions/acUI";
import { fDataDeleteAccount, fDataDeleteOperation, fDataDeleteOperationCategory } from "../../network/fData";

class DeleteConfirmation extends React.PureComponent {

    static propTypes = {
        modalContent:                   PropTypes.string,
        deleteMode:                     PropTypes.oneOf([
            DELETE_MODES.OPERATIONS,
            DELETE_MODES.ACCOUNTS,
            DELETE_MODES.OPERATION_CATEGORIES,
            DELETE_MODES.NONE,
        ]),
        operationsData:                 PropTypes.arrayOf(
            PropTypes.shape({
                id:                     PropTypes.number,
                accountId:              PropTypes.number,
                categoryId:             PropTypes.number,
                type:                   PropTypes.string,
                sum:                    PropTypes.number,
                date:                   PropTypes.any,
                comment:                PropTypes.string,
            })
        ),
        operationSelectedIndex:         PropTypes.number,
        accountsData:                   PropTypes.arrayOf(
            PropTypes.shape({
                id:                     PropTypes.number,
                name:                   PropTypes.string,
                amount:                 PropTypes.number,
            })
        ),
        accountSelectedIndex:           PropTypes.number,
        operationCategoriesData:        PropTypes.arrayOf(
            PropTypes.shape({
                id:                     PropTypes.number,
                name:                   PropTypes.string,
            })
        ),
        operationCategorySelectedIndex: PropTypes.number,
        cbChanged:                      PropTypes.func,
    };

    static defaultProps = {
        cbChanged:                  null,
    };

    static classID = 0;

    static getHtmlID = ( data ) => {
        return ( data !== null && data !== undefined )
            ? data
            : 'DeleteConfirmation_' + DeleteConfirmation.classID;
    };

    constructor( props ) {
        super( props );
        DeleteConfirmation.classID++;
        this.state = {
            htmlID: DeleteConfirmation.getHtmlID( props.htmlID ),
        }
    }

    debug_mode = CONFIG_DEBUG_MODE && CONFIG_DEBUG_MODE_DELETE_CONFIRMATION;

    classCSS = 'DeleteConfirmation';

    componentWillMount() {
        this.prepareData( this.props );
    }

    componentWillReceiveProps( newProps ) {
        this.prepareData( newProps );
    }

    prepareData = ( props ) => {
        ( this.debug_mode ) &&
        console.log( 'DeleteConfirmation: prepareData: new props: ', props );
    };

    formProps = () => {
        return {
            header: {
                title:  "Подтвердите удаление",
            },
            btnOk: {
                label: 'Ок',
                cbChanged: this.btnOk_cbChanged,
            },
            btnCancel: {
                label: 'Отменить',
                cbChanged: this.btnCancel_cbChanged,
            },
        }
    };

    /* == callbacks == */

    btnOk_cbChanged = () => {
        const {
            dispatch,
            operationSelectedIndex,
            operationsData,
            accountSelectedIndex,
            accountsData,
            operationCategorySelectedIndex,
            operationCategoriesData,
            deleteMode
        } = this.props;
        const { OPERATIONS, ACCOUNTS, OPERATION_CATEGORIES, NONE } = DELETE_MODES;
        console.log( "Удалить: deleteMode: ", deleteMode );
        switch ( deleteMode ) {
            case OPERATIONS:
                let operationId = operationsData[ operationSelectedIndex ].id;
                fDataDeleteOperation( dispatch, null, null, operationId );
                break;
            case ACCOUNTS:
                let accountId = accountsData[ accountSelectedIndex ].id;
                fDataDeleteAccount( dispatch, null, null, accountId );
                break;
            case OPERATION_CATEGORIES:
                let categoryId = operationCategoriesData[ operationCategorySelectedIndex ].id;
                fDataDeleteOperationCategory( dispatch, null, null, categoryId );
                break;
        }
    };

    btnCancel_cbChanged = () => {
        const {dispatch} = this.props;
        dispatch( acUIHideMatGlass() );
    };

    /* == controller == */

    formClick = ( e ) => {
        e.stopPropagation();
    };

    /* == renders == */

    render() {
        const { modalContent } = this.props;
        let props = this.formProps();
        return ( modalContent === MODAL_CONTENT.DELETE_CONFIRMATION ) &&
            <div className = { this.classCSS }
                 onClick = { this.formClick }>
                <div className = { this.classCSS + '_form' }>
                    <div className="rows"
                         key="header">
                        <div className="cols col_16 header">
                            <span className = { this.classCSS + '_header' }>
                                { props.header.title }
                            </span>
                        </div>
                    </div>
                    <div className={ "rows " + this.classCSS + "_buttons_panel" }>
                        <div className="cols col_8"
                             key="Сохранить">
                            <ButtonOk { ...props.btnOk }/>
                        </div>
                        <div className="cols col_8"
                             key="Отменить">
                            <ButtonCancel { ...props.btnCancel }/>
                        </div>
                    </div>
                </div>
            </div>
    }

}

const mapStateToProps = function ( state ) {
    return {
        modalContent:                   state.ui.modalContent,
        deleteMode:                     state.ui.deleteMode,

        operationSelectedIndex:         state.data.operationSelectedIndex,
        operationsData:                 state.data.operationsData,
        accountSelectedIndex:           state.data.accountSelectedIndex,
        accountsData:                   state.data.accountsData,
        operationCategorySelectedIndex: state.data.operationCategorySelectedIndex,
        operationCategoriesData:        state.data.operationCategoriesData,
    }
};

export default connect( mapStateToProps )( DeleteConfirmation );