const express = require('express');
const cors = require('cors');
const port=process.env.port||5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const app=express();

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdjvkyg.mongodb.net/?retryWrites=true&w=majority`;
//console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// token function
function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}


async function run(){
    try{
        const addressCollection=client.db('addressBook').collection('addressData');
        
        //JWT implementation
        app.post('/jwt', async (req, res) => {
            const email = req.body.email;
            const pass = req.body.pass;
            if (email=='prome@gmail.com' && pass=='123456') {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });
       
        //Get all address with Pagination
        app.get('/getaddressdata',verifyJWT,async(req,res)=>{
            const page = parseInt(req.query.page);
            const size = parseInt(req.query.size);
            const query={};
            const info=await addressCollection.find(query).skip(page*size).limit(size).toArray();
            const count = await addressCollection.estimatedDocumentCount();
            res.send({count,info});
        })


         

        //phase matching results by name
        app.get('/addressdata',verifyJWT,async(req,res)=>{
            const name=req.query.name;
            const query={};
            const info=await addressCollection.find(query).toArray();
            console.log(info);
            const result=info.filter(p=>p.name.toLowerCase().includes(name.toLowerCase()));
            res.send(result);
        })

        //Get single address by id
        app.get('/getaddress/:id',verifyJWT,async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const info=await addressCollection.findOne(query);
            res.send(info);
        })


        //Add a single address 
        app.post('/addaddress',verifyJWT,async(req,res)=>{
            const addData=req.body;
            const info=await addressCollection.insertOne(addData);
            res.send(info);
        })

        //Update a single address by id
        app.patch('/updateaddress/:id',verifyJWT,async(req,res)=>{
            const id=req.params.id;
            const updateData=req.body;
            const filter={_id:ObjectId(id)};
            const option={upsert:true};
            const updateDoc={
                $set:updateData
            }
            const info=await addressCollection.updateOne(filter,updateDoc,option);
            res.send(info);
        })

          //Delete single address by id
          app.delete('/deleteaddress/:id',verifyJWT,async(req,res)=>{
            const id=req.params.id;
            const query={_id:ObjectId(id)};
            const info=await addressCollection.deleteOne(query);
            res.send(info);
        })

        //add bulk operation

        app.post('/addressbulk',verifyJWT, async(req, res)=>{
            const docs = req.body;        
            let i=0;
            let bulkData=[];
            for (i = 0; i < docs.length; i++) {
               bulkData.push({insertOne:docs[i]})
            }
            console.log(bulkData);
            const result =await addressCollection.bulkWrite(bulkData); 
            res.send(result);
           
                     });
          


      



    }
    finally{

    }
}
run().catch(console.log())



app.get('/',async(req,res)=>{
    res.send('Address book running');
})

app.listen(port,()=>console.log('Address book',port))