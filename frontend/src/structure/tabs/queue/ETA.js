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
  
    if (counter < 30) return <h3>Almost done...</h3>
    else if (counter < 3600) return <h3>ETA {Math.floor(counter/60) + "m " + Math.floor(counter%60) + "s"}</h3>
    else return <h3>ETA {Math.floor(counter/3600) + "h " + Math.floor((counter%3600)/60) + "m"}</h3>
  }

class ETA extends Component{

    printETA(){
        return <Counter eta={this.props.progress.eta}/>
    }

    renderEta(){
        if (this.props.isPaused)
            return <h3>Drawing paused</h3>
        else if (this.props.progress.eta === -1)
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
        return <div className="p-4 center infos-box m-auto w-100">{this.renderEta()}</div>
    }
}

export default ETA;