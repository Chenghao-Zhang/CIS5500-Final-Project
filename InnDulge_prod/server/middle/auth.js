const authMiddle = (req, res, next) => {
  const mUser = req.session.user
  if (mUser) {
    req.user = mUser
    next()
  } else {
    res.status(401).json({ error: "Please log in" });
  }
}

module.exports = authMiddle
