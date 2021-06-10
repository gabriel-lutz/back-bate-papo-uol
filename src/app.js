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

app.listen(4000, ()=>{
    console.log("O servidor está rodando na porta 4000 ...")
})