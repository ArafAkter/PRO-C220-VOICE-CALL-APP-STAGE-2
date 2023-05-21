const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine", "ejs");
app.use(express.static("public"));

const { v4: uuidv4 } = require("uuid");

const io = require("socket.io")(server, {
    cors: {
        origin: '*'
    }
});

const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});

app.use("/peerjs", peerServer);
var nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    port:587,
    host:"smth.gmail.com",
    auth:{
        user:'dipaaraf@yahoo.com',
        pass:'rrqtejgxgwidfrjy'
    },
    secure:true,
})
app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});
app.post("/send-mail",(req,res)=>{
    const to = req.body.to;
    const url = req.body.url
    const mailData = {
        from:"dipaaraf@yahoo.com",
        to:to,
        subject:"join the video chat with me",
        html:`<p>hey there,</p><p> come and join me for a videochat here-${url}</p>`
    }
    transporter.sendMail(mailData,(error,info)=>{
        if(error){
            return console.log(error)
        }
        res.status(200).send({message:"invitationSend",message_id:info.messageId})
    })
})
app.get("/:room", (req, res) => {
    res.render("index", { roomId: req.params.room });
});

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected",userId)
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
    });
});

server.listen(process.env.PORT || 3030);