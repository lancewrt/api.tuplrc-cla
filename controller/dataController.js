import { db } from "../config/db.js";

export const college = (req,res)=>{
    const q = 'SELECT * FROM college'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
};

export const course = (req,res)=>{
    const q = 'SELECT * FROM course'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
};

export const departments = (req,res)=>{
    const q = 'SELECT * FROM department'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
};

export const topic = (req,res)=>{
    const q = 'SELECT * FROM topic'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
};

export const publishers = (req,res)=>{
    const q = 'SELECT * FROM publisher'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
};

export const authors = (req,res)=>{
    const q = 'SELECT * FROM author'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
};

export const advisers = (req,res)=>{
    const q = 'SELECT * FROM adviser'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
           return res.json(results)
    })
};


export const type = (req,res)=>{
    const q = 'SELECT * FROM resourcetype'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
};

export const status = (req,res)=>{
    const q = 'SELECT * FROM availability'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
};

export const roles = (req,res)=>{
    const q = 'SELECT * FROM roles'

    db.query(q,(err,results)=>{
        if(err) return res.send(err)
            return res.json(results)
    })
};

