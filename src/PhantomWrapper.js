module.exports = function wrapper(fnStr) {
  var args = Array.prototype.slice.call(arguments);
  var rg = /^function\s+([a-zA-Z_$][a-zA-Z_$0-9]*)?\((.*?)\) {/g;
  var a = rg.exec(fnStr);
  var fnArgs = a[2].match(/([^,\s]+)/g) || [];
  var fnBody = fnStr.slice(fnStr.indexOf("{")+1, fnStr.lastIndexOf("}"));
  fnArgs.push(fnBody);
  var scraperFn = Function.apply(this, fnArgs);

  try {
    var gs = args.slice(1);
    gs.unshift($);
    var result = scraperFn.apply(this, gs);
    return {
      error: null,
      result: result
    };
  } catch(e) {
    var errObj = {
      message: e.message
    };
    for(var x in e) {
      errObj[x] = e[x];
    }
    return {
      error: errObj,
      result: null
    };
  }
};
