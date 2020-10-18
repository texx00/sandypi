let elements_container = $("#elements");
let text = elements_container.text();
let elements = JSON.parse(text);
const playlist_id = $("#playlist_id").text()


class ElementCard extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: true // TODO use a transition/animation on value change
        }
    }

    render(){
        return <li className={"col-lg-3 col-md-4 col-sm-6 col-xs-6 mb-3" + (this.state.active ? "" : " d-none")} title="Drag me around to sort the list">
            <div className="card hover-zoom">
                <div className="card-img-overlay show-cross">
                    <div className="justify-content-md-center btn-cross" onClick={() => {this.setState({active: false})}} title="Remove this drawing from the list">X</div>
                </div>
                <img className="card-img-top" src = {"../static/Drawings/" + this.props.element.drawing_id + "/" + this.props.element.drawing_id + ".jpg"}/>
            </div>
        </li>
    }
}


class SortableCards extends React.Component{

    constructor(props){
        super(props);
        this.elements = this.props.elements.map((element, index) => {
            return <ElementCard element={element} key={index}/>;
        });
    }

    render(){
        return <ul id="drawings_ul" className="row list-unstyled">
            {this.elements}
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
            <button className="col" onClick={this.props.onUploadDrawing}>+ Upload drawing</button>
            <button className="col" onClick={this.props.onDeletePlaylist}>Delete playlist</button>
        </div>
    }
}

class ElementsView extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            elements: elements
        }
        this.list = <SortableCards elements={this.state.elements}/>
        this.controls = <Controls
            onDeletePlaylist = {this.onDeletePlaylist.bind(this)}
            onSavePlaylist = {this.onSavePlaylist.bind(this)}
            onStartPlaylist = {this.onStartPlaylist.bind(this)}
            onUploadDrawing = {this.onUploadDrawing.bind(this)}/>
    }

    onDeletePlaylist(){
        delete_playlist(playlist_id);
    }

    onSavePlaylist(){
        console.log("Save playlist");
        elements = this.list
        console.log(this)
        console.log(elements)
        // todo implement callbacks from child elements to update sortable cards state which will be the json string to sent to the server
    }

    onStartPlaylist(){
        start_playlist(playlist_id);
    }

    onUploadDrawing(){
        show_dropzone(playlist_id);
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
