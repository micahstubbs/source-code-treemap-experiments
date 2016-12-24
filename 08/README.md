## Zoomable Treemap

Treemaps for visualizing hierarchical data. Click to zoom to the next level.
Click on the top orange band to zoom out. Based on Mike Bostock's
[Zoomable Treemaps](http://bost.ocks.org/mike/treemap/)

This template follows [pigshell](http://pigshell.com)'s convention for "gist
templates":

  * It is supplied data using postMessage(), as a single object of the form
    `{ opts: {...}, data: [...] }`
  * It posts a message to the parent with an object of the form `{ height: <number> }` to enable the framing context to adjust the height of the iframe.
  * If the URL does not contain a hash fragment, it displays sample data from
    the containing gist.

The following options are supported:

    {
        title: "", // Title 
        rootname: "TOP", // Name of top-level entity in case data is an array
        format: ",d", // Format as per d3.format (https://github.com/mbostock/d3/wiki/Formatting)
        field: "data", // Object field to treat as data [default: data]
        width: 960, // Width of SVG
        height: 500, // Height of SVG
        margin: { top: 48, right: 0, bottom: 0, left: 0 } // Margin as per D3 convention
    }

`data` is a tree-like object, or an array of tree-like objects. Each non-leaf
node of the tree must contain a "key" property and an array of "values".
Leaf nodes must contain a "key" and a "value" property.

    [
      {
        "key": "Asia",
        "values": [
        {
          "key": "India",
          "value": 1236670000
        },
        {
          "key": "China",
          "value": 1361170000
        },
        ...
      },
      {
        "key": "Africa",
        "values": [
        {
          "key": "Nigeria",
          "value": 173615000
        },
        {
          "key": "Egypt",
          "value": 83661000
        },
        ...
      },
    ]

Sample data is world population from [countries.git](https://github.com/mledoze/countries.git).

Data may be easily converted to tree form using d3.nest(). See the first
example below.


Examples (to be run in [pigshell](http://pigshell.com)):

    load http://d3js.org/d3.v3.min.js
    cat /usr/share/misc/countries.json | to text | jf 'JSON.parse(x)'| rename -f "name,population" -t "key,value" | jf -g 'd3.nest().key(function(d) {return d.region;}).key(function(d) { return d.subregion; }).entries(x)' | iframe -o title="World Population",rootname="World" -g 'http://bl.ocks.org/ganeshv/raw/6a8e9ada3ab7f2d88022/#wait'
