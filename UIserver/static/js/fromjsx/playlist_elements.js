/**
* This file is compiled to plain js by using the babel module.
* Please, have a look at UIserver/static/js/jsx/readme.md for more info before any modification.
**/

let elements_container = $("#elements");
let text = elements_container.text();
let elements = JSON.parse(text);
const playlist_id = $("#playlist_id").text();

class ElementCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: true,
            show_cross: false
        };
        this.element_ref = React.createRef();
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
                onTransitionEnd: this.onTransitionEnd.bind(this),
                ref: this.element_ref },
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
                        { className: "justify-content-md-center btn-cross" + (this.state.show_cross && this.props.show_cross ? " show" : ""),
                            onClick: () => {
                                this.setState({ active: false });
                            },
                            title: "Remove this drawing from the list" },
                        "X"
                    )
                ),
                React.createElement("img", { className: "card-img-top", src: "../static/Drawings/" + this.props.element.drawing_id + "/" + this.props.element.drawing_id + ".jpg" })
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
                handleUnmount: this.unmountComponent.bind(this) });
        });
        this.state = { elements: elements };
    }

    componentDidMount() {
        Sortable.create($('#drawings_ul')[0], { animation: 150, // animation when something is dragged
            ghostClass: "sortable_ghost", // ghost object style class
            chosenClass: "sortable_chosen", // dragged object style class
            filter: ".btn-cross", // filter the mouse event: on the elements with this class it will not activate the sortable class but will launch onclick events
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
            } });
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
            this.state.elements
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
                { className: "col", onClick: this.props.onUploadDrawing },
                "+ Upload drawing"
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
        this.state = {
            elements: elements
        };
        this.list = React.createElement(SortableCards, { elements: this.state.elements });
        this.controls = React.createElement(Controls, {
            onDeletePlaylist: this.onDeletePlaylist.bind(this),
            onSavePlaylist: this.onSavePlaylist.bind(this),
            onStartPlaylist: this.onStartPlaylist.bind(this),
            onUploadDrawing: this.onUploadDrawing.bind(this) });
    }

    onDeletePlaylist() {
        delete_playlist(playlist_id);
    }

    onSavePlaylist() {
        console.log("Save playlist");
        elements = this.list;
        console.log(this);
        console.log(elements);
        // todo implement callbacks from child elements to update sortable cards state which will be the json string to sent to the server
    }

    onStartPlaylist() {
        start_playlist(playlist_id);
    }

    onUploadDrawing() {
        show_dropzone(playlist_id);
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