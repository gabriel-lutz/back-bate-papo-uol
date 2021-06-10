import express from "express"
import cors from "cors"
import dayjs from "dayjs"


const app = express()
app.use(cors())
app.use(express.json())

const participants = []

const messages = []

app.post("/participants", (req,res)=>{
    const newParticipant = {...req.body, lastStatus: Date.now()}
    if(newParticipant.name.length === 0 || participants.some(p=> p.name === newParticipant.name)){
        res.send(400)
    }else{
        participants.push(newParticipant)
        messages.push({
            from: newParticipant.name,
            to: "Todos",
            text: "entra na sala ...",
            type: "status",
            time: dayjs().format('HH:MM:ss')
        })
        res.sendStatus(200)
    }
})

app.get("/participants", (req,res)=>{
    if(participants.length !== 0){
        res.send(participants)
    }else{
        res.send({})
    }
})

app.post("/messages", (req,res)=>{
    const newMessage = {...req.body, from: req.header("User"), time: dayjs().format('HH:MM:ss')}
    console.log(newMessage)
    if(newMessage.to.length === 0 || newMessage.text.length === 0 || (newMessage.type !== "message" && newMessage.type !== "private_message") || !participants.some(p=> p.name === newMessage.from)){
        res.sendStatus(400)
    }else{
        messages.push(newMessage)
        res.sendStatus(200)
    }
})

app.get("/messages", (req,res)=>{
    const user = req.header("User")
    const numberOfMessages = req.query.limit
    const messagesToReturn = []
    messages.filter(m=>{
        if(numberOfMessages? messagesToReturn.length < numberOfMessages: true){
            if(m.to === user || m.to === "Todos" || m.from === user || m.type === "message" || m.type === "status"){
                messagesToReturn.push(m)
            }
        }
    })
    res.send(messagesToReturn)
})

app.post("/status", (req,res)=>{
    const user = req.header("User")
    const index = participants.findIndex(p=> p.name === user)
    if(index !== -1){
        participants[index].time = Date.now()
        res.sendStatus(200)
    }else{
        res.sendStatus(400)
    }
})

app.listen(4000, ()=>{
    console.log("O servidor está rodando na porta 4000 ...")
})