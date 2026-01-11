const { validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const message = errors.array()[0].msg;
  if (req.accepts('json')) {
    return res.status(400).json({ error: message });
  }

  req.flash('error', message);
  return res.redirect('back');
}

module.exports = { handleValidation };
