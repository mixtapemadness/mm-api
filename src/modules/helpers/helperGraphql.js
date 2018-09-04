const customizationOptions = {} // left it empty for simplicity, described below

module.exports = ({TC, isAuthenticated}) => {
  const { schemaComposer } = TC
  return schemaComposer
}
