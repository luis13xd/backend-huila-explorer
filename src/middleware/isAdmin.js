

const isAdmin = (req, res, next) => {
    if(req.role !== 'admin'){
        return res.status(403).send({success: false, message: 'No estas autorizado con este rol, logeate como administrador'})
    }
    next ()
}

module.exports = isAdmin;

