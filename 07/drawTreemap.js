// an iteration on
// http://mbostock.github.io/d3/talk/20111018/treemap.html

const w = 1280 - 80;

const h = 800 - 180;
const x = d3.scale.linear().range([0, w]);
const y = d3.scale.linear().range([0, h]);
let root;
let node;
let currentDepth;
let startingDepth;
let maxArea;
let update;

// ************************************************

const materialOrange = '#FC582F';


// http://stackoverflow.com/questions/21734017/d3-js-how-to-decide-both-the-area-and-the-color-of-each-square-by-the-size-of-e

const colorLinearScale = d3.scale.linear()
  .range([0,1]);
// wait to set the domain until we know
// the maxArea for the current child node
// and it's siblings

//colors can be specified as any CSS color string
const colorInterpolator = d3.interpolateHsl('lightgray', materialOrange);

// ************************************************

const treemap = d3.layout.treemap2()
  .round(false)
  .size([w, h])
  .sticky(true)
  .sort((a, b) => a.data.size - b.data.size)
  .value(d => d.data.size);

const svg = d3.select('#body').append('div')
  .attr('class', 'chart')
  .style('width', `${w}px`)
  .style('height', `${h}px`)
  .append('svg:svg')
    .attr('width', w)
    .attr('height', h)
    .append('svg:g')
      .attr('transform', 'translate(.5,.5)');

d3.csv("h2o-3.csv", function(d) {
  d.size = +d.size;
  return d;
}, function(error, data) {
  if (error) throw error;

  const root = d3v4.stratify()
    .id(function(d) { return d.path; })
    .parentId(function(d) { return d.path.substring(0, d.path.lastIndexOf("/")); })
    (data)
    .sum(function(d) { return d.size; })
    .sort(function(a, b) { return b.height - a.height || b.value - a.value; }); // sort by different property instead of value?

  console.log('root produced by d3.stratify()', root);

  node = root;
  currentDepth = 0;
  startingDepth = 0;

  update = (updateRoot, updateDepth) => {
    currentDepth = updateDepth;
    startingDepth = updateDepth;
    const nodes = treemap
      .nodes(updateRoot)
      .filter(d => d.depth > updateDepth && d.depth <= updateDepth + 2);

    const update = svg.selectAll('g')
      .data(nodes);

    const enter = update.enter()
      .append('svg:g');

    const exit = update.exit();

    enter
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', d => {
        //
        // interesting zoom logic here
        //
        // console.log('d.parent from click', d.parent);
        // console.log('node from click', node);
        if (currentDepth >= d.maxDepth) {
          currentDepth = 0;
          return zoom(root);
        } else if (currentDepth === d.parent.depth) {
          currentDepth += 1;
          return zoom(d);
        }
        currentDepth = d.parent.depth;
        return zoom(d.parent);
      });

    enter
      .append('svg:rect')
      .attr('width', d => {
        // console.log('d from append rect', d);
        // console.log('d.maxArea from append rect', d.maxArea);
        if (d.dx >= 1) {
          return d.dx - 1;
        } 
        return d.dx;
      })
      .attr('height', d => {
        if (d.dy >= 1) {
          return d.dy - 1;
        }
        return d.dy;
      })
      .style('fill', d => {
        colorLinearScale.domain([0, d.maxArea]);
        return colorInterpolator(colorLinearScale(d.area));
      });

    enter
      .append('svg:text')
      .attr('x', d => d.dx / 2)
      .attr('y', d => d.dy / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .text(d => {
        if (typeof d.name !== 'undefined') {
          return d.name;
        }
        return d.id;
      })
      .style('opacity', function(d) {
        d.w = this.getComputedTextLength();
        return d.dx > d.w ? 1 : 0
      });

    exit
      .style('fill', 'red')
      .remove();
  }

  // call the update function to draw our treemap
  // the first time
  // update(node, currentDepth);

  const currentNode = node.children[2];
  console.log('currentNode', currentNode);
  console.log('currentNode.id', currentNode.id);
  update(currentNode, currentNode.depth - 1);

  d3.select(window)
    .on('click', () => { 
      update(root, 0);
      // zoom(root); 
    });

  d3.select('select')
    .on('change', function() {
      treemap 
        .value(this.value == 'size' ? size : count)
        .nodes(root);

      zoom(node);
    });
});

function size(d) {
  return d.size;
}

function count(d) {
  return 1;
}

function zoom(d) {
  // console.log('d from zoom', d);

  // if this would be the only node visible
  // if (d.children.length === 1) {
  //   update(d.parent, currentDepth);
  // }
  const kx = w / d.dx;
  const ky = h / d.dy;
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, d.y + d.dy]);

  const t = svg.selectAll('g.cell').transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .attr('transform', d => `translate(${x(d.x)},${y(d.y)})`);

  t.select('rect')
    .attr('width', d => {
      if (d.dx >= 1) {
        return kx * d.dx - 1;
      }
      return kx * d.dx;
    })
    .attr('height', d => {
      if (d.dy >= 1) {
        return ky * d.dy - 1;
      }
      return ky * d.dy;
    })

  t.select('text')
    .attr('x', d => kx * d.dx / 2)
    .attr('y', d => ky * d.dy / 2)
    .style('opacity', d => kx * d.dx > d.w ? 1 : 0);

  node = d;
  if (d !== null) {
    if (
      typeof d.parent !== 'undefined' &&
      d.parent !== null
    ) {
    console.log('d.parent.depth from zoom', d.parent.depth);
    } else {
      console.log('d.depth from zoom', d.depth);
    }
  } else {
    console.log('current depth from zoom', 0);
  }
  
  console.log('node from zoom', node);
  if (typeof d.children !== 'undefined') {
    console.log('# of nodes visible at current zoom level', d.children.length);
  } else {
    console.log('# of nodes visible at current zoom level', 1);
  }
  d3.event.stopPropagation();
}