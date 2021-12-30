"use strict";
const express = require("express");
const { createServer } = require("http"); // HTTP
const { Server } = require("socket.io"); // SOCKET.IO
const { v4: uuidV4 } = require("uuid");
const path = require("path");

const PORT = process.env.PORT || 4000;

const pkg = require("../package.json");
const app = express();

app.use(express.static(path.join(__dirname, "views"))); // link *.css and *.js in room.ejs
app.set("views", path.join(__dirname, "views")); // location directory wiews to "view engine", "ejs"
app.set("view engine", "ejs");

// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

// Expose the js resources as "resources"
// app.use("/resources", express.static("./source"));

// console.log(__dirname);
// console.log(__filename);
// console.log(path.join(__dirname, "views"));

// Server with http and socket.io
const httpServer = createServer(app);
const io = new Server(httpServer); // const io = new Server(httpServer, { /* options */ });
app.set("io", io); // Optional

io.on("connection", (socket) => {
  console.log("NEW CONNECTION SOCKET", socket.id);
  socket.on("join-room", (roomId, userId) => {
    console.log(roomId, userId);
    socket.join(roomId);
    // socket.to(roomId).broadcast.emit('user-connected', userId); // No funciona // Cannot read property 'emit' of undefined
    socket.to(roomId).emit("user-connected", userId);
    // socket.broadcast.emit('user-connected', userId);

    // to all clients in room1
    // io.in("room1").emit(/* ... */);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

// Guardar variables en expres y obtener el valor (Reutilizar recursos)
app.set("pkg_json", pkg);

// Middlewares
app.use(express.json()); // Optional (Test)

// Routes
// app.get("/", (req, res) => {
//   res.json({
//     name: app.get("pkg_json").name,
//     author: app.get("pkg_json").author,
//     descripction: app.get("pkg_json").description,
//     version: app.get("pkg_json").version,
//   });
// });

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// http server
httpServer.listen(PORT, () => {
  console.log("Server Running on", "http://localhost:" + PORT);
});

/**
 *
 *
 *
 *
 *
 *
 *
 */
/*
__dirname se puede utilizar para obtener la ruta absoluta del directorio al que pertenece el módulo de archivo actual. Ambos son dinámicos
__filename se puede usar para obtener la ruta absoluta del archivo actual
*/
