const socket = io();

document.addEventListener("DOMContentLoaded", () => {

    socket.emit("hello", "world");

    document.getElementById("create").addEventListener("click", ev => {
        socket.emit("create-room", roomId => {
            document.getElementById("id").value = roomId;
        });
    });
    
    document.getElementById("join").addEventListener("click", ev => {
        socket.emit("join-room", document.getElementById("id").value);
    });
});
