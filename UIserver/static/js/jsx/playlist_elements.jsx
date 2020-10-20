let elements_container = $("#elements");
let text = elements_container.text();
let elements = JSON.parse(text);
const playlist_id = $("#playlist_id").text()


// ELEMENTS

class BasicElement extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div className="bg-primary card-img-top"></div>;
    }
}

class DrawingElement extends BasicElement{
    constructor(props){
        super(props);
    }

    render(){
        return <img className="card-img-top" src = {"../static/Drawings/" + this.props.element.drawing_id + "/" + this.props.element.drawing_id + ".jpg"}/>
    }
}


// LAYOUT

class ElementCard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: true,
            show_cross: false
        }
        this.element_ref = React.createRef();

        this.child_element = this.get_element_component(this.props.element);
    }

    get_element_component(el){
        let type = el.element_type;
        switch (type){
            case "drawing":
                return <DrawingElement element = {el}/>;
            default:
                return <BasicElement/>;
        }
    }
    
    show_cross(val){
        this.setState({show_cross: true});
    }

    hide_cross(val){
        this.setState({show_cross: false});
    }

    onTransitionEnd(){
        if (!this.state.active){
            this.props.handleUnmount(this)
        }
    }


    render(){
        return <li className={"col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-3" + (this.state.active ? "" : " disappear")} 
            title="Drag me around to sort the list"
            onTransitionEnd={this.onTransitionEnd.bind(this)}>
            <div className="card hover-zoom" 
                onMouseEnter={this.show_cross.bind(this)} 
                onMouseLeave={this.hide_cross.bind(this)}>
                <div className="card-img-overlay show-cross">
                    <div className={"justify-content-md-center btn-cross nodrag" + (this.state.show_cross && this.props.show_cross ? " show" : "")}
                        onClick={() => {this.setState({active: false})}} 
                        title="Remove this drawing from the list">X</div>
                </div>
                {this.child_element}
            </div>
        </li>
    }
}

class ModalContent extends React.Component{
    constructor(props){
        super(props);
    }

    newElement(){
        this.props.modalConfirm({prova:"prova"});// TODO insert element
    }

    render(){
        return <div>
                <div className="center p-5">
                    <button className="btn btn-dark" onClick={()=>{show_dropzone(playlist_id);}}>+ Upload drawing</button> 
                    <button className="btn btn-dark">+ Add timing element</button>
                    <button className="btn btn-dark">+ Add commands</button>
                    <button className="btn btn-dark">+ Add positioning element</button>
                    <button className="btn btn-dark">+ Add clear element</button>
                </div>
                <div className="modal-footer">
                    <div className="text-center w-100 m-0">
                        <button type="button" className="btn btn-primary m-0 mr-1" data-dismiss="modal">No</button>
                        <button type="button" className="btn btn-primary m-0" onClick={this.newElement.bind(this)}>Yes</button>
                    </div>
                </div>
            </div>
    }

}

class ControlCard extends React.Component{
    constructor(props){
        super(props);
        this.modal_content = <ModalContent modalConfirm={this.handleModal.bind(this)} key="0"/>
    }

    handleModal(element){
        this.props.handleNewElement(element);
        $('.modal').modal('hide');
    }

    inject_modal(){                         // uses the modal container to manage the new element addition. not really elegant but cannot do anything different with this setup. A complete react conversion should fix it
        const content = [this.modal_content];
        ReactDOM.render(content, $("#modal_container")[0]);
        $('.modal').modal('show');
    }

    render(){
        return <li className="col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-3 nodrag" 
                id = "control_card"
                title = "Add a new element">
                <div className="card hover-zoom control-card" onClick={this.inject_modal.bind(this)}>
                        +
                </div>
            </li>
    }
}

class SortableCards extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            show_child_cross: true
        }
        elements = this.props.elements.map((element, index) => {
            return <ElementCard 
                element={element} 
                key={index} 
                show_cross={this.state.show_child_cross} 
                ref={element.ref}
                handleUnmount={this.unmountComponent.bind(this)}/>;
        });
        this.state = ({elements: elements});
        this.control_card = <ControlCard handleNewElement={this.addNewElement.bind(this)}/>;
    }

    addNewElement(element){
        console.log("Adding new element");
        console.log(element)
    }

    componentDidMount(){
        Sortable.create(($('#drawings_ul')[0]),         // https://github.com/SortableJS/sortablejs
        {   animation:150,                              // animation when something is dragged
            ghostClass: "sortable_ghost",               // ghost object style class
            chosenClass: "sortable_chosen",             // dragged object style class
            filter: ".nodrag",                          // filter the mouse event: on the elements with this class it will not activate the sortable class but will launch onclick events
            onStart:(evt) => {                          // when starts to drag it removes the "delete element" button and disable it until the object is released
                this.setState({show_child_cross: false});
            },
            onEnd: (evt) => {                           // when the element is released reactivate the "delete element" activation
                this.setState({show_child_cross: true});
            },
            onUpdate: (evt) => {                        // when the list is resorted set the flag to save before exit
                must_save = true;
                this.props.onUpdate(evt.newIndex, evt.oldIndex);
            },
            onMove: (evt1, evt2) => {                   // when the element is dragged over the control card disable movements
                if (evt1.related.id == "control_card"){
                    return false;                       // cannot put something after the elements control card
                }
                return true;
            },
        });
    }

    unmountComponent(component){
        elements = this.state.elements;
        elements = elements.filter((el)=>{
            return el.props.element.id!=component.props.element.id;
        });
        this.setState({elements: elements});
    }

    render(){
        return <ul id="drawings_ul" className="row list-unstyled">
            {this.state.elements}
            {this.control_card}
        </ul>
    }
}

class Controls extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return <div className="row justify-content-md-center mt-3 mb-3">
            <button className="col" onClick={this.props.onStartPlaylist}>Start playlist</button>
            <button className="col" onClick={this.props.onSavePlaylist}>Save changes</button>
            <button className="col" onClick={this.props.onDeletePlaylist}>Delete playlist</button>
        </div>
    }
}

class ElementsView extends React.Component{
    constructor(props){
        super(props);
        elements = elements.map((element)=>{        // elements is the global object containing data from the server
            element.ref = React.createRef();        // adding ref to be able to get the element and send the new updated value to the server on save
            return element;
        });
        this.state = {                              // saving elements in the state
            elements: elements
        }
        this.list = <SortableCards 
            elements={this.state.elements}
            onUpdate={this.onListUpdate.bind(this)}/>
        this.controls = <Controls
            onDeletePlaylist = {this.onDeletePlaylist.bind(this)}
            onSavePlaylist = {this.onSavePlaylist.bind(this)}
            onStartPlaylist = {this.onStartPlaylist.bind(this)}/>
    }

    onListUpdate(to, from){
        let els = this.state.elements;
        let el = els[from];
        els.splice(from, 1);
        els.splice(to, 0, el);
        this.setState({elements: els});
    }

    onDeletePlaylist(){
        delete_playlist(playlist_id);
    }

    onSavePlaylist(){
        console.log("Saving playlist");
        must_save = false;

        elements = [...this.state.elements] // create a copy of the elements to pack the data for the server
        elements = elements.map((element, index)=>{
            if (element.ref && element.ref.current){
                let el = element.ref.current.props.element;
                delete el['ref'];           // remove reference element
                el.id = index;              // reorder the elements
                return el
            }
        });
        elements = elements.filter((e)=>{return e!=undefined}); // remove undefined elements (elements that were removed from the array)

        let data = {   // not really nice but at the moment works. Should include also this element in the react part?
            name : $("#playlist_name").html().replace(/(?:&nbsp;|<br>)/g,''),
            id : $("#playlist_id").html(),
            elements: elements
        }
        data = JSON.stringify(data);
        socket.emit("playlist_save", data);
        show_toast("Playlist saved");
    }

    onStartPlaylist(){
        start_playlist(playlist_id);
    }

    render(){
        return <div>
            {this.controls}
            {this.list}
        </div>
    }
}

const elements_list = (
        <ElementsView/>
    );

ReactDOM.render(elements_list, elements_container[0]);
