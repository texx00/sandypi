/**
* This file is compiled to plain js by using the babel module.
* Please, have a look at UIserver/static/js/jsx/readme.md for more info before any modification.
**/

let elements_container = $("#elements");
let text = elements_container.text();
let elements = JSON.parse(text);
const playlist_id = $("#playlist_id").text();

// ELEMENTS

class BasicElement extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement("div", { className: "bg-primary card-img-top" });
    }
}

class DrawingElement extends BasicElement {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement("img", { className: "card-img-top", src: "../static/Drawings/" + this.props.element.drawing_id + "/" + this.props.element.drawing_id + ".jpg" });
    }
}

// LAYOUT

class ElementCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: true,
            show_cross: false
        };
        this.element_ref = React.createRef();

        this.child_element = this.get_element_component(this.props.element);
    }

    get_element_component(el) {
        let type = el.element_type;
        switch (type) {
            case "drawing":
                return React.createElement(DrawingElement, { element: el });
            default:
                return React.createElement(BasicElement, null);
        }
    }

    show_cross(val) {
        this.setState({ show_cross: true });
    }

    hide_cross(val) {
        this.setState({ show_cross: false });
    }

    onTransitionEnd() {
        if (!this.state.active) {
            this.props.handleUnmount(this);
        }
    }

    render() {
        return React.createElement(
            "li",
            { className: "col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-3" + (this.state.active ? "" : " disappear"),
                title: "Drag me around to sort the list",
                onTransitionEnd: this.onTransitionEnd.bind(this) },
            React.createElement(
                "div",
                { className: "card hover-zoom",
                    onMouseEnter: this.show_cross.bind(this),
                    onMouseLeave: this.hide_cross.bind(this) },
                React.createElement(
                    "div",
                    { className: "card-img-overlay show-cross" },
                    React.createElement(
                        "div",
                        { className: "justify-content-md-center btn-cross nodrag" + (this.state.show_cross && this.props.show_cross ? " show" : ""),
                            onClick: () => {
                                this.setState({ active: false });
                            },
                            title: "Remove this drawing from the list" },
                        "X"
                    )
                ),
                this.child_element
            )
        );
    }
}

class ModalContent extends React.Component {
    constructor(props) {
        super(props);
    }

    newElement() {
        this.props.modalConfirm({ prova: "prova" }); // TODO insert element
    }

    render() {
        return React.createElement(
            "div",
            null,
            React.createElement(
                "div",
                { className: "center p-5" },
                React.createElement(
                    "button",
                    { className: "btn btn-dark", onClick: () => {
                            show_dropzone(playlist_id);
                        } },
                    "+ Upload drawing"
                ),
                React.createElement(
                    "button",
                    { className: "btn btn-dark" },
                    "+ Add timing element"
                ),
                React.createElement(
                    "button",
                    { className: "btn btn-dark" },
                    "+ Add commands"
                ),
                React.createElement(
                    "button",
                    { className: "btn btn-dark" },
                    "+ Add positioning element"
                ),
                React.createElement(
                    "button",
                    { className: "btn btn-dark" },
                    "+ Add clear element"
                )
            ),
            React.createElement(
                "div",
                { className: "modal-footer" },
                React.createElement(
                    "div",
                    { className: "text-center w-100 m-0" },
                    React.createElement(
                        "button",
                        { type: "button", className: "btn btn-primary m-0 mr-1", "data-dismiss": "modal" },
                        "No"
                    ),
                    React.createElement(
                        "button",
                        { type: "button", className: "btn btn-primary m-0", onClick: this.newElement.bind(this) },
                        "Yes"
                    )
                )
            )
        );
    }

}

class ControlCard extends React.Component {
    constructor(props) {
        super(props);
        this.modal_content = React.createElement(ModalContent, { modalConfirm: this.handleModal.bind(this), key: "0" });
    }

    handleModal(element) {
        this.props.handleNewElement(element);
        $('.modal').modal('hide');
    }

    inject_modal() {
        // uses the modal container to manage the new element addition. not really elegant but cannot do anything different with this setup. A complete react conversion should fix it
        const content = [this.modal_content];
        ReactDOM.render(content, $("#modal_container")[0]);
        $('.modal').modal('show');
    }

    render() {
        return React.createElement(
            "li",
            { className: "col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-3 nodrag",
                id: "control_card",
                title: "Add a new element" },
            React.createElement(
                "div",
                { className: "card hover-zoom control-card", onClick: this.inject_modal.bind(this) },
                "+"
            )
        );
    }
}

class SortableCards extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show_child_cross: true
        };
        elements = this.props.elements.map((element, index) => {
            return React.createElement(ElementCard, {
                element: element,
                key: index,
                show_cross: this.state.show_child_cross,
                ref: element.ref,
                handleUnmount: this.unmountComponent.bind(this) });
        });
        this.state = { elements: elements };
        this.control_card = React.createElement(ControlCard, { handleNewElement: this.addNewElement.bind(this) });
    }

    addNewElement(element) {
        console.log("Adding new element");
        console.log(element);
    }

    componentDidMount() {
        Sortable.create($('#drawings_ul')[0], // https://github.com/SortableJS/sortablejs
        { animation: 150, // animation when something is dragged
            ghostClass: "sortable_ghost", // ghost object style class
            chosenClass: "sortable_chosen", // dragged object style class
            filter: ".nodrag", // filter the mouse event: on the elements with this class it will not activate the sortable class but will launch onclick events
            onStart: evt => {
                // when starts to drag it removes the "delete element" button and disable it until the object is released
                this.setState({ show_child_cross: false });
            },
            onEnd: evt => {
                // when the element is released reactivate the "delete element" activation
                this.setState({ show_child_cross: true });
            },
            onUpdate: evt => {
                // when the list is resorted set the flag to save before exit
                must_save = true;
                this.props.onUpdate(evt.newIndex, evt.oldIndex);
            },
            onMove: (evt1, evt2) => {
                // when the element is dragged over the control card disable movements
                if (evt1.related.id == "control_card") {
                    return false; // cannot put something after the elements control card
                }
                return true;
            }
        });
    }

    unmountComponent(component) {
        elements = this.state.elements;
        elements = elements.filter(el => {
            return el.props.element.id != component.props.element.id;
        });
        this.setState({ elements: elements });
    }

    render() {
        return React.createElement(
            "ul",
            { id: "drawings_ul", className: "row list-unstyled" },
            this.state.elements,
            this.control_card
        );
    }
}

class Controls extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return React.createElement(
            "div",
            { className: "row justify-content-md-center mt-3 mb-3" },
            React.createElement(
                "button",
                { className: "col", onClick: this.props.onStartPlaylist },
                "Start playlist"
            ),
            React.createElement(
                "button",
                { className: "col", onClick: this.props.onSavePlaylist },
                "Save changes"
            ),
            React.createElement(
                "button",
                { className: "col", onClick: this.props.onDeletePlaylist },
                "Delete playlist"
            )
        );
    }
}

class ElementsView extends React.Component {
    constructor(props) {
        super(props);
        elements = elements.map(element => {
            // elements is the global object containing data from the server
            element.ref = React.createRef(); // adding ref to be able to get the element and send the new updated value to the server on save
            return element;
        });
        this.state = { // saving elements in the state
            elements: elements
        };
        this.list = React.createElement(SortableCards, {
            elements: this.state.elements,
            onUpdate: this.onListUpdate.bind(this) });
        this.controls = React.createElement(Controls, {
            onDeletePlaylist: this.onDeletePlaylist.bind(this),
            onSavePlaylist: this.onSavePlaylist.bind(this),
            onStartPlaylist: this.onStartPlaylist.bind(this) });
    }

    onListUpdate(to, from) {
        let els = this.state.elements;
        let el = els[from];
        els.splice(from, 1);
        els.splice(to, 0, el);
        this.setState({ elements: els });
    }

    onDeletePlaylist() {
        delete_playlist(playlist_id);
    }

    onSavePlaylist() {
        console.log("Saving playlist");
        must_save = false;

        elements = [...this.state.elements]; // create a copy of the elements to pack the data for the server
        elements = elements.map((element, index) => {
            if (element.ref && element.ref.current) {
                let el = element.ref.current.props.element;
                delete el['ref']; // remove reference element
                el.id = index; // reorder the elements
                return el;
            }
        });
        elements = elements.filter(e => {
            return e != undefined;
        }); // remove undefined elements (elements that were removed from the array)

        let data = { // not really nice but at the moment works. Should include also this element in the react part?
            name: $("#playlist_name").html().replace(/(?:&nbsp;|<br>)/g, ''),
            id: $("#playlist_id").html(),
            elements: elements
        };
        data = JSON.stringify(data);
        socket.emit("playlist_save", data);
        show_toast("Playlist saved");
    }

    onStartPlaylist() {
        start_playlist(playlist_id);
    }

    render() {
        return React.createElement(
            "div",
            null,
            this.controls,
            this.list
        );
    }
}

const elements_list = React.createElement(ElementsView, null);

ReactDOM.render(elements_list, elements_container[0]);