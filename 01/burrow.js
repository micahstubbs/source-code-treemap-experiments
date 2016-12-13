// nest rows with keys array, requires Underscore.js
function burrow(table) {
  // create simple nested object
  var obj = {};
  _(table).each(function(d) {
    var _obj = obj;
    _(d.keys.slice(1)).each(function(key,depth) {
      _obj[key] = _obj[key] || {}
      _obj = _obj[key];
    });
  });

  // recursively create children array
  function descend(obj) {
    var arr = [];
    _(obj).each(function(v,k) {
      var b = {
        name: k,
        children: descend(v)
      };
      arr.push(b);
    });
    return arr;
  };
  
  // nested object
  return {
    name: table[0].keys[0],
    maxDepth: _(table).chain().pluck("keys").pluck("length").max().value(),
    children: descend(obj)
  };
};