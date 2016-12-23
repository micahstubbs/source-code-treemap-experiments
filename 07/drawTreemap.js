// an iteration on
// http://mbostock.github.io/d3/talk/20111018/treemap.html

const w = 1280 - 80;

const h = 800 - 180;
const x = d3.scale.linear().range([0, w]);
const y = d3.scale.linear().range([0, h]);
let root;
let node;
let currentDepth;
let maxArea;

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

  const nodes = treemap
    .nodes(root)
    .filter(d => d.depth > 0 && d.depth <= 2);

  //
  // interesting zoom logic here
  //
  const cell = svg.selectAll('g')
    .data(nodes)
    .enter().append('svg:g')
      .attr('class', 'cell')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .on('click', d => {
        // console.log('d.parent from click', d.parent);
        // console.log('node from click', node);
        if (currentDepth >= d.maxDepth) {
          currentDepth = 0;
          return zoom(root);
        } else if (currentDepth < d.parent.depth) {
          currentDepth += 1;
          return zoom(d.parent);
        }
        currentDepth += 1;
        return zoom(d);
      });

  cell.append('svg:rect')
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

  cell.append('svg:text')
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

  d3.select(window)
    .on('click', () => { 
      currentDepth = 0;
      zoom(root); 
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
  console.log('currentDepth from zoom', currentDepth);
  console.log('node from zoom', node);
  d3.event.stopPropagation();
}