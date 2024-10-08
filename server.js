const express = require('express')
const app = express()
const PORT = 2007;
app.use(express.static('./pabluc'))
app.get('/',(req, res)=>{
    res.send('hello')
})

app.listen(PORT, ()=>{
    console.log(`i am listening in port ${PORT}`)
})