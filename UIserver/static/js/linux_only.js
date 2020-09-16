function confirm_shutdown(){
    $("#modal_container").html('\
        <div class="center p-5">\
            Are you sure you want shutdown the device now?\
        </div>\
        <div class="modal-footer">\
            <div class="text-center w-100 m-0">\
                <button type="button" class="btn btn-primary m-0" data-dismiss="modal">No</button>\
                <button type="button" class="btn btn-primary m-0" onclick="window.location.href = \'/control/shutdown\'">Yes</button>\
            </div>\
        </div>\
    ');
    $('.modal').modal('show');
}

function confirm_reboot(){
    $("#modal_container").html('\
        <div class="center p-5">\
            Are you sure you want to reboot the device now?\
        </div>\
        <div class="modal-footer">\
            <div class="text-center w-100 m-0">\
                <button type="button" class="btn btn-primary m-0" data-dismiss="modal">No</button>\
                <button type="button" class="btn btn-primary m-0" onclick="window.location.href = \'/control/reboot\'">Yes</button>\
            </div>\
        </div>\
    ');
    $('.modal').modal('show');
    
}