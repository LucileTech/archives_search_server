const isContributor = (req, res, next) => {
    // check if the current user is contributor or not
    const isContributor = req.currentUser.isContributor;
    if (isContributor === true) {
        return next();
    } else {
        return res.status(404).render('not-found'); 
    };
};

module.exports = isContributor;