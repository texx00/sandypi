var socket = io.connect(location.host);

function drawnow(code){
    console.log("Sending start command")
    socket.emit('message', {data: 'start:'+code});
}