import express from "express"
import cors from "cors"
import dayjs from "dayjs"
import Joi from "joi"
import {writeFile, readFile} from "fs"

const app = express()
app.use(cors())
app.use(express.json())

let participants = []
let messages = []

readFile('../.participants.txt', (err, data)=>{
    if(err){
        console.log("Sem lista de participantes no sistema. Criando uma nova lista ...")
    }else{
         participants = JSON.parse(data)
    }
})

readFile('../.messages.txt', (err,data)=>{
    if(err){
         console.log("Sem lista de mensagens no sistema. Criando uma nova lista ... ")
    }else{
         messages = JSON.parse(data)
    }
})

function saveToFile(){
    const participantsStringToSave = JSON.stringify(participants)
    const messagesStringToSave = JSON.stringify(messages)
    writeFile('../.participants.txt',participantsStringToSave, ()=>{})
    writeFile('../.messages.txt', messagesStringToSave, ()=>{})
}

const participantsSchema = Joi.object({
    name: Joi.string()
        .min(1)
        .required(),
    lastStatus: Joi.number()
})

const messageSchema = Joi.object({
    to: [Joi.number().min(1),Joi.string().min(1)],
    text: [Joi.number().min(1),Joi.string().min(1)],
    type: Joi.string().valid('message', 'private_message'),
    from: Joi.string(),
    time: [Joi.string(), Joi.number()]

}).or('to', 'text', 'type', 'from', 'time')

app.post("/participants", (req,res)=>{
    const newParticipant = {...req.body, lastStatus: Date.now()}
    if(participantsSchema.validate(newParticipant).error || participants.some(p=> p.name === newParticipant.name)){
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
        saveToFile()
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
    if( messageSchema.validate(newMessage).error || !participants.some(p=> p.name === newMessage.from)){
        res.sendStatus(401)
    }else{
        messages.push(newMessage)
        res.sendStatus(200)
        saveToFile()
    }
})

app.get("/messages", (req,res)=>{
    const user = req.header("User")
    const numberOfMessages = req.query.limit
    const messagesToReturn = []
    const reversedArray = [...messages].reverse()
    reversedArray.filter(m=>{
        if(numberOfMessages? messagesToReturn.length < numberOfMessages: true){
            if(m.to === user || m.to === "Todos" || m.from === user || m.type === "message" || m.type === "status"){
                messagesToReturn.push(m)
            }
        }
    })
    res.send(messagesToReturn.reverse())
})

app.post("/status", (req,res)=>{
    const user = req.header("User")
    const index = participants.findIndex(p=> p.name === user)
    if(index !== -1){
        participants[index].time = Date.now()
        res.sendStatus(200)
        saveToFile()
    }else{
        res.sendStatus(400)
    }
})

setInterval(()=>{
    participants.length > 0 && participants.forEach((p,i)=>{
        if(Date.now() - p.time > 10000){
            participants.splice(i,1)
            messages.push({
                from: p.name,
                to: "Todos",
                text: "Sai da sala...",
                type: "status",
                time: dayjs().format('HH:MM:ss')
            })
            saveToFile()
        }
    })
},[15000])

app.listen(4000, ()=>{
    console.log("O servidor está rodando na porta 4000 ...")
})