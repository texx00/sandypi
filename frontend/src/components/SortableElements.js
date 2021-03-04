import React, { Component } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { Col } from 'react-bootstrap';

import { getElementClass } from '../structure/tabs/playlists/SinglePlaylist/Elements';
import { X } from 'react-bootstrap-icons';
import { listsAreEqual } from '../utils/dictUtils';

class SortableElements extends Component{
    constructor(props){
        super(props);
        this.state = {
            list: this.props.list,
            show_child_cross: true
        };
        this.lastList = this.props.list;
    }

    componentDidUpdate(){
        if (!listsAreEqual(this.props.list, this.state.list)){
            this.setState({...this.state, list: this.props.list});
        }
    }

    // removes sortable options before sending the updated data
    prepareUpdate(list){
        this.props.onUpdate(list.map((el) => {
            if ("selected" in el) delete el.selected;
            if ("chosen" in el) delete el.chosen;
            return el;
        }));
    }

    removeElement(idx){
        let oldState = this.state.list;
        let newList = oldState.filter((el, i)=> {return el.id !==idx});
        this.setState({...this.state, list: newList, edited: true});
        this.prepareUpdate(newList);
    }

    render(){
        return <ReactSortable
            distance={1}
            animation={150}
            ghostClass="sortable-ghost"
            chosenClass="sortable-chosen"
            filter=".nodrag"
            className="row mt-5"                            // need to put this manually to set a correct grid layout
            list={this.state.list}
            setList={(newList) => {
                this.setState({list: newList});
                this.prepareUpdate(newList);
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
                {this.state.list.map((el)=>{                // generate list of elements to show in the list
                    if (el.element_type === "control_card")  
                        return this.props.children;         // return the child as the control card 
                    
                    let ElementType = getElementClass(el);

                    return <ElementCard key={el.id} 
                            handleUnmount={()=>this.removeElement(el.id)}
                            showCross={this.state.show_child_cross}>
                        <ElementType element={el} 
                            onOptionsChange={(el) => this.props.onElementOptionsChange(el)}
                            hideOptions={this.props.hideOptions}/>
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
            <div className="pb100 position-absolute rounded"></div>
            <div className="card hover-zoom bg-black rounded clickable" 
                onMouseEnter={this.show_cross.bind(this)} 
                onMouseLeave={this.hide_cross.bind(this)}>
                {React.cloneElement( this.props.children, { onClick: this.hide_cross.bind(this) })}     {/* adding an "onclick" method to hide the cross when the child is clicked and the modal is open */}
                <div className="card-img-overlay show-cross">
                    <div className={"justify-content-md-center btn-cross nodrag rounded" + (this.state.show_cross && this.props.showCross ? " show" : "")}
                        onClick={() => {this.setState({active: false})}} 
                        title="Remove this drawing from the list"><X/></div>
                </div>
            </div>
        </Col>
    }
}

export default SortableElements;