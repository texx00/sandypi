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
            showChildCross: true
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
        let newList = this.state.list.filter((el, key) => {return key !== idx});
        this.setState({...this.state, list: newList, edited: true}, () => this.prepareUpdate(newList));
    }

    render(){
        return <ReactSortable
            distance={1}
            animation={150}
            ghostClass="sortable-ghost"
            chosenClass="sortable-chosen"
            filter=".nodrag"
            className="row mt-5 mobile-overflow"                            // need to put this manually to set a correct grid layout
            list={this.state.list}
            setList={(newList) => {
                this.setState({list: newList});
                this.prepareUpdate(newList);
            }}
            onStart={(evt) => {                             // when starts to drag it removes the "delete element" button and disable it until the object is released
                this.setState({showChildCross: false});
            }}
            onEnd={(evt) => {                               // when the element is released reactivate the "delete element" activation
                this.setState({showChildCross: true});
            }}
            onMove={(evt1, evt2) => {
                // when the element is dragged over the control card disable movements
                if (evt1.related.id === "control_card"){
                    return false;                           // cannot put something after the elements control card
                }
                return true;
            }}>
                {this.state.list.map((el, idx)=>{                // generate list of elements to show in the list
                    if (el.element_type === "control_card"){
                        let c = React.cloneElement(this.props.children, {key:0});
                        return c;                           // return the child as the control card  
                    }

                    let ElementType = getElementClass(el);

                    return <ElementCard key={idx} 
                        handleUnmount={()=>this.removeElement(idx)}
                        showCross={this.state.showChildCross}>
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
            showCross: false,
            unmounted: false
        }
    }
    
    showCross(val){
        this.setState({...this.state, showCross: true});
    }

    hideCross(val){
        this.setState({...this.state, showCross: false});
    }

    onTransitionEnd(){
        if (!this.state.active && !this.state.unmounted){
            this.setState({...this.state, unmounted: true, active: true}, ()=>this.props.handleUnmount(this));
            // TODO check if it is deleting only one element at a time from the list
        }
    }

    render(){
        return <Col sm={4} className={"mb-3"+ (this.state.active ? "" : " disappear")} 
            title="Drag me around to sort the list"
            onTransitionEnd={this.onTransitionEnd.bind(this)}>
            <div key={1} className="pb100 position-absolute rounded"></div>
            <div key={2} className="card hover-zoom bg-black rounded clickable" 
                onMouseEnter={this.showCross.bind(this)} 
                onMouseLeave={this.hideCross.bind(this)}>
                {React.cloneElement( this.props.children, { onClick: this.hideCross.bind(this) })}     {/* adding an "onclick" method to hide the cross when the child is clicked and the modal is open */}
                <div className="card-img-overlay show-cross">
                    <div className={"justify-content-md-center btn-cross nodrag rounded" + (this.state.showCross && this.props.showCross ? " show" : "")}
                        onClick={() => {this.setState({active: false})}} 
                        title="Remove this drawing from the list"><X/></div>
                </div>
            </div>
        </Col>
    }
}

export default SortableElements;