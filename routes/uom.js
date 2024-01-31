const {UoM} = require('../models/uom');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const getFields = multer();

router.get(`/`, async (req, res) =>{
    const uomList = await UoM.find();

    if(!uomList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(uomList);
})

router.get('/:id', async(req,res)=>{
    const uom = await UoM.findById(req.params.id);

    if(!uom) {
        res.status(500).json({message: 'The uom with the given ID was not found.'})
    } 
    res.status(200).send(uom);
});

router.post('/', getFields.none(), async (req,res)=>{
    let uom = new UoM({
        name: req.body.name
    });
    try {
        uom = await uom.save();
    } catch (error) {
        return res.status(400).send(error)
    }
    if(!uom)
        return res.status(400).send('the uom cannot be created!')
    res.send(uom);
})


router.put('/:id', getFields.none(), async (req, res)=> {
    const uom = await UoM.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        },
        { new: true}
    )

    if(!uom)
    return res.status(400).send('the uom cannot be updated!')

    res.send(uom);
})

router.delete('/:id', (req, res)=>{
    UoM.findByIdAndRemove(req.params.id).then(uom =>{
        if(uom) {
            return res.status(200).json({success: true, message: 'the uom is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "uom not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;