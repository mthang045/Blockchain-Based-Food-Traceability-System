const requireUserPrivateKey = (req, res, next) => {
  const headerPrivateKey = req.headers['x-user-private-key'];
  const bodyPrivateKey = req.body?.userPrivateKey;
  const signerPrivateKey = headerPrivateKey || bodyPrivateKey;

  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'userPrivateKey')) {
    delete req.body.userPrivateKey;
  }

  if (!signerPrivateKey || typeof signerPrivateKey !== 'string' || !signerPrivateKey.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Missing user private key. Provide x-user-private-key header or userPrivateKey in request body.'
    });
  }

  req.txSigningOptions = {
    signerPrivateKey: signerPrivateKey.trim()
  };

  next();
};

module.exports = {
  requireUserPrivateKey
};
