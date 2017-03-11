const konnector = require('./trainline')

konnector.fetch(konnector.requiredFields, () => {
  console.log('The konnector has been run')
})
