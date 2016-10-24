var leftButton = document.getElementById("left");
var rightButton = document.getElementById("right");

console.log(leftButton);

leftButton.addEventListener("mousedown", buttonDownHandler);
leftButton.addEventListener("mouseup", buttonUpHandler);

rightButton.addEventListener("mousedown", buttonDownHandler);
rightButton.addEventListener("mouseup", buttonUpHandler);



function buttonDownHandler() {
	console.log("mouse down event fired");
}



function buttonUpHandler() {
	console.log("mouse up event fired");
}