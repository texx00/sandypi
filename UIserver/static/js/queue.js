show_delete = true
function document_ready(){
    $("div.drawing_grid_element").append("<div></div>");
    $("div.drawing_grid_element").children("div").addClass("remove_drawing").html("X").on("click", function(event){
        event.stopPropagation();
        url = $(this).parent().children("img").attr("src");
        code = url.split("/")[3];
        window.location.replace("/queue/remove/"+code);
    });
    $("div.drawing_grid_element").hover(function(){
        if(show_delete){
            var element = $(this).children("div.remove_drawing");
            element.css("opacity", "1");
            element.css("visibility", "visible");
        }
    }, function(){
        var element = $(this).children("div.remove_drawing");
        element.css("opacity", "0");
        element.css("visibility", "hidden");
});
}