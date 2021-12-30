// const myPeer = new Peer(undefined, {
//   host: "/",
//   port: "3001",
// });

const socket = io("/");
const myPeer = new Peer(); // Generar id
const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");
myVideo.muted = true; // Silenciamos el sonido del video solo para nosotro no para los demas clientes
const peers = {}; // Se almacenara las llamadas de los usuario conectados

// Queremos que el video y el audio se envie a otra persona
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    // Escuchar la llamada de otro usuario y responder a la llamada
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // Nuevo usuario se conecte
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// DISCONNECTED USER
socket.on("user-disconnected", (userId) => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

// socket.emit("join-room", ROOM_ID, 10);

// socket.on("user-connected", (userId) => {
//   console.log("user-connected:", userId);
// });

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");

  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });

  // Si cierra la llamada eliminamos de la lista
  call.on("close", () => {
    video.remove();
  });

  // Se almacena el usuario como clave y la llamada del usuario como valor
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
