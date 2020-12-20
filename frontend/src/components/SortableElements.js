import React, { Component } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Col } from 'react-bootstrap';

import { DrawingElement } from '../structure/tabs/playlists/SinglePlaylist/ElementsCards';

class SortableElements extends Component{
    constructor(props){
        super(props);
        this.state = {
            list: this.props.list,
            show_child_cross: true
        };
    }

    componentDidUpdate(){
        if (this.props.refreshList){
            this.setState({...this.state, list: this.props.list});
            this.props.onListRefreshed();
        }
    }

    removeElement(idx){
        let oldState = this.state.list;
        let newList = oldState.filter((el, i)=> {return el.id !==idx});
        this.setState({...this.state, list: newList, edited: true});
        this.props.onUpdate(newList);
    }

    render(){
        return <ReactSortable
            animation={150}
            ghostClass="sortable-ghost"
            chosenClass="sortable-chosen"
            filter=".nodrag"
            className="row mt-5"                            // need to put this manually to set a correct grid layout
            list={this.state.list}
            setList={(newList) => {
                this.setState({list: newList});
                this.props.onUpdate(newList);
            }}
            onStart={(evt) => {                             // when starts to drag it removes the "delete element" button and disable it until the object is released
                this.setState({show_child_cross: false});
            }}
            onEnd={(evt) => {                               // when the element is released reactivate the "delete element" activation
                this.setState({show_child_cross: true});
            }}
            onMove={(evt1, evt2) => {
                // when the element is dragged over the control card disable movements
                if (evt1.related.id === "control_card"){
                    return false;                           // cannot put something after the elements control card
                }
                return true;
            }}>
                {this.state.list.map((el, idx)=>{
                    if (el.element_type === "control_card"){    // the control card element must be available in the list to be shown. If show, will put the child element as the control card element
                        return this.props.children;
                    }else return <ElementCard key={el.id} 
                                handleUnmount={()=>this.removeElement(el.id)}
                                showCross={this.state.show_child_cross}>
                            <DrawingElement element={el}/>
                        </ElementCard>
                })}
        </ReactSortable>
    }
}

class ElementCard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: true,
            show_cross: false
        }
        this.element_ref = React.createRef();
    }
    
    show_cross(val){
        this.setState({...this.state, show_cross: true});
    }

    hide_cross(val){
        this.setState({...this.state, show_cross: false});
    }

    onTransitionEnd(){
        if (!this.state.active){
            this.props.handleUnmount(this)
        }
    }

    render(){
        return <Col sm={4} className={"mb-3"+ (this.state.active ? "" : " disappear")} 
            title="Drag me around to sort the list"
            onTransitionEnd={this.onTransitionEnd.bind(this)}>
            <div className="pb100 position-absolute"></div>
            <div className="card hover-zoom" 
                onMouseEnter={this.show_cross.bind(this)} 
                onMouseLeave={this.hide_cross.bind(this)}>
                <div className="card-img-overlay show-cross">
                    <div className={"justify-content-md-center btn-cross nodrag" + (this.state.show_cross && this.props.showCross ? " show" : "")}
                        onClick={() => {this.setState({active: false})}} 
                        title="Remove this drawing from the list">X</div>
                </div>
                {this.props.children}
            </div>
        </Col>
    }
}

export default SortableElements;