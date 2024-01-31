const {Size} = require('../models/size');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const getFields = multer();

router.get(`/`, async (req, res) =>{
    const sizeList = await Size.find();

    if(!sizeList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(sizeList);
})

router.get('/:id', async(req,res)=>{
    const size = await Size.findById(req.params.id);

    if(!size) {
        res.status(500).json({message: 'The size with the given ID was not found.'})
    } 
    res.status(200).send(size);
});

router.post('/', getFields.none(), async (req,res)=>{
    let size = new Size({
        name: req.body.name
    });
    try {
        size = await size.save();
    } catch (error) {
        return res.status(400).send(error)
    }
    if(!size)
        return res.status(400).send('the size cannot be created!')
    res.send(size);
})


router.put('/:id', getFields.none(), async (req, res)=> {
    const size = await Size.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
        },
        { new: true}
    )

    if(!size)
    return res.status(400).send('the size cannot be updated!')

    res.send(size);
})

router.delete('/:id', (req, res)=>{
    Size.findByIdAndRemove(req.params.id).then(size =>{
        if(size) {
            return res.status(200).json({success: true, message: 'the size is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "size not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

module.exports =router;