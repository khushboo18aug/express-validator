const selectFields = require('./select-fields');

module.exports = (req, context) => {
  const validationErrors = [];
  const promises = selectFields(req, context).map(field => {
    const { location, path, value } = field;
    return context.validators.reduce((promise, validatorCfg) => promise.then(() => {
      const result = validatorCfg.custom ?
        validatorCfg.validator(value, { req, location, path }) :
        validatorCfg.validator(String(value), ...validatorCfg.options);

      return Promise.resolve(result).then(result => {
        if (!result) {
          throw new Error(context.message || 'Invalid value');
        }
      });
    }).catch(err => {
      validationErrors.push({
        location,
        path,
        value,
        message: validatorCfg.message || err.message
      });
    }), Promise.resolve());
  });

  return Promise.all(promises).then(() => validationErrors);
};