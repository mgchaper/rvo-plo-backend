const jwt = require("jsonwebtoken");
const { clearScreenDown } = require("readline");

module.exports = checkRole;

function checkRole(roles = []) {
    // roles param can be a single role string (e.g. Role.User or 'User') 
    // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        // authorize based on user role
        (req, res, next) => {
            if (roles.length && !roles.includes(req.userData.role)) {
                // user's role is not authorized
                console.log(roles.length && !roles.includes(req.userData.role));
                console.log(req.userData.role);
                return res.status(401).json({ message: 'Role unauthorized!' });
            }

            //  authorization successful
            next();
        }
    ];
}