const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization');
    if (typeof token !== 'undefined') {
        jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                res.status(403).send('Invalid token');
            } else {
                req.user = decoded.user;
                next();
            }
        });
    } else { res.status(401).send('Unauthorized'); }
};