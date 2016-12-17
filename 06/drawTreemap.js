// an iteration on
// http://mbostock.github.io/d3/talk/20111018/treemap.html

const w = 1280 - 80;

const h = 800 - 180;
const x = d3.scale.linear().range([0, w]);
const y = d3.scale.linear().range([0, h]);
let root;
let node;
let maxArea;

// ************************************************

const materialOrange = "#FC582F";


// http://stackoverflow.com/questions/21734017/d3-js-how-to-decide-both-the-area-and-the-color-of-each-square-by-the-size-of-e

const colorLinearScale = d3.scale.linear()
  .range([0,1]);
// wait to set the domain until we know
// the maxArea for the current child node
// and it's siblings

//colors can be specified as any CSS color string
const colorInterpolator = d3.interpolateHsl("lightgray", materialOrange);

// ************************************************

const treemap = d3.layout.treemap2()
  .round(false)
  .size([w, h])
  .sticky(true)
  .sort((a, b) => a.value - b.value)
  .value(d => d.size);

const svg = d3.select("#body").append("div")
  .attr("class", "chart")
  .style("width", `${w}px`)
  .style("height", `${h}px`)
  .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")
      .attr("transform", "translate(.5,.5)");

d3.json("flare.json", data => {
  node = root = data;

  const nodes = treemap.nodes(root)
    .filter(d => !d.children);

  const cell = svg.selectAll("g")
    .data(nodes)
    .enter().append("svg:g")
      .attr("class", "cell")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .on("click", d => zoom(node == d.parent ? root : d.parent));

  cell.append("svg:rect")
    .attr("width", d => d.dx - 1)
    .attr("height", d => d.dy - 1)
    .style("fill", d => {
      colorLinearScale.domain([0, d.maxArea]);
      return colorInterpolator(colorLinearScale(d.area));
    });

  cell.append("svg:text")
    .attr("x", d => d.dx / 2)
    .attr("y", d => d.dy / 2)
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => d.name)
    .style("opacity", function(d) {
      d.w = this.getComputedTextLength();
      return d.dx > d.w ? 1 : 0
    });

  d3.select(window).on("click", () => { zoom(root); });

  d3.select("select").on("change", function() {
    treemap.value(this.value == "size" ? size : count).nodes(root);
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
  const kx = w / d.dx;
  const ky = h / d.dy;
  x.domain([d.x, d.x + d.dx]);
  y.domain([d.y, d.y + d.dy]);

  const t = svg.selectAll("g.cell").transition()
    .duration(d3.event.altKey ? 7500 : 750)
    .attr("transform", d => `translate(${x(d.x)},${y(d.y)})`);

  t.select("rect")
    .attr("width", d => kx * d.dx - 1)
    .attr("height", d => ky * d.dy - 1)

  t.select("text")
    .attr("x", d => kx * d.dx / 2)
    .attr("y", d => ky * d.dy / 2)
    .style("opacity", d => kx * d.dx > d.w ? 1 : 0);

  node = d;
  d3.event.stopPropagation();
}