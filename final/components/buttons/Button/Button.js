'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import './Button.scss';

class Button extends React.PureComponent {

    static propTypes = {
        label:      PropTypes.string,
        options:    PropTypes.shape({
            hoverClass: PropTypes.string,
            iconWidth: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string,
            ]),
            iconHeight: PropTypes.oneOfType([
                PropTypes.number,
                PropTypes.string,
            ]),
            preserveAspectRatio: PropTypes.string,
            viewBox:             PropTypes.string,
        }),
        cbChanged:  PropTypes.func,
    };

    static defaultProps = {
        label:      '',
        options:    {
            iconWidth:  32,
            iconHeight: 32,
            viewBox:    '0 0 64 64',
            preserveAspectRatio: 'xMidYMid',
        },
        cbChanged:  null,
    };

    static classID = 0;

    static getHtmlID = ( data ) => {
        return ( data !== null && data !== undefined )
            ? data
            : 'Button_' + Button.classID;
    };

    constructor( props ) {
        super( props );
        Button.classID++;
        this.state = {
            htmlID: Button.getHtmlID( props.htmlID ),
        }
    }

    debug_mode = true;

    classCSS = 'Button';

    componentWillMount() {
        this.prepareData( this.props );
    }

    componentWillReceiveProps( newProps ) {
        this.prepareData( newProps );
    }

    prepareData = ( props ) => {
        ( this.debug_mode ) &&
        console.log( 'Button: prepareData: new props: ', props )
        this.setState( { dataHover: false }, ()=>{} );
        // todo
    };

    iconMouseEnter = ( e ) => {
        e.currentTarget.dataset.hover = true;
    };

    iconMouseLeave = ( e ) => {
        e.currentTarget.dataset.hover = false;
    };

    render( innerSVG ) {
        const { iconWidth, iconHeight, preserveAspectRatio, viewBox } = this.props.options;
        console.log( 'viewBox: ', viewBox );
        return (
            <div className = { this.classCSS }
                 onClick = { this.props.cbChanged }
                 onMouseEnter = { this.iconMouseEnter }
                 onMouseLeave = { this.iconMouseLeave }
                 data-hover = { false }>
                <div className = { this.classCSS + '_icon_box' }
                     key='icon'
                     style = {{
                         width: ( iconWidth !== 0 )
                            ? iconWidth
                            : 'auto',
                         height: ( iconHeight !== 0 )
                            ? iconHeight
                            : 'auto',
                     }}>
                    <svg className = { this.classCSS + '_icon' }
                         width =   "100%"
                         height =  "100%"
                         viewBox = { viewBox }
                         preserveAspectRatio = { preserveAspectRatio }
                         xmlns =   "http://www.w3.org/2000/svg">
                        { innerSVG || null }
                    </svg>
                </div>
                <div className = { this.classCSS + '_label_box' }
                     key='label'>
                    <label className = { this.classCSS + '_label' }>
                        { this.props.label }
                    </label>
                </div>
            </div>
        )
    }
}

export default Button;