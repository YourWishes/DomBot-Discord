const DomBotCompiler = require('./dist/private/compiler/DomBotCompiler').DomBotCompiler;

const compiler = new DomBotCompiler();

module.exports = env => {
  let isDev = !env || !env.production;

  if(isDev) {
    console.log('Compiling Webpack for Development');
  } else {
    console.log('Compiling Webpack for Production');
  }

  let config = compiler.generateConfiguration(isDev);
  return config;
}
