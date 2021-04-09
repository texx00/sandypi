import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';


// didn't found an efficent way of adding this as a class component
function Counter(props) {
    const [counter, setCounter] = React.useState(props.eta);
  
    React.useEffect(() => {
      const timer =
        counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      return () => clearInterval(timer);
    }, [counter]);
  
    if (counter < 3600) return Math.floor(counter/60) + "m " + Math.floor(counter%60) + "s";
    else return Math.floor(counter/3600) + "h " + Math.floor((counter%3600)/60) + "m"
  }

class ETA extends Component{

    printETA(){
        if (this.props.progress.eta < 60)
            return <h3>Almost done...</h3>
        else return <h3>ETA <Counter eta={this.props.progress.eta}/></h3>
    }

    renderEta(){
        if (this.props.progress.eta === -1)
            return <OverlayTrigger overlay={
                <Tooltip>
                    Set a feedrate with a "G0 Fxxx" command to get the ETA in s
                </Tooltip>}
                delay={{ show: 3000, hide:250 }}> 
                <h3>ETA unavailable</h3>
            </OverlayTrigger>;
        else if (this.props.progress.units === "s")  // if is using seconds and they are below 30 can show the "Almost done" message
            return <div>
                {this.printETA()}
            </div>
        // else the eta is in %. Will also show a tip to define a feedrate to enable eta in [s]
        else return <OverlayTrigger overlay={
            <Tooltip>
                Set a feedrate with a "G0 Fxxx" command to get the ETA in s
            </Tooltip>}
            delay={{ show: 3000, hide:250 }}> 
            <h3>{this.props.progress.eta}%</h3>
        </OverlayTrigger>;
    }

    render(){
        return <div className="p-4 center bg-light text-dark rounded mb-5 mt-5 w-100">{this.renderEta()}</div>
    }
}

export default ETA;