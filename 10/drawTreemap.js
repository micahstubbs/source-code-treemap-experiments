window.addEventListener('message', (e) => {
  const opts = e.data.opts;
  const data = e.data.data;

  return main(opts, data);
});

const defaults = {
  margin: { top: 24, right: 0, bottom: 0, left: 0 },
  rootname: 'TOP',
  format: ',d',
  title: '',
  width: 960,
  height: 500,
};

function main(o, data) {
  const opts = deepExtend({}, defaults, o);
  const formatNumber = d3.format(opts.format);
  const rname = opts.rootname;
  const margin = opts.margin;
  const theight = 36 + 16;

  d3.select('#chart')
    .attr('width', opts.width)
    .attr('height', opts.height);

  const width = opts.width - margin.left - margin.right;
  const height = opts.height - margin.top - margin.bottom - theight;
  let transitioning;

  const color = d3.scaleOrdinal(d3.schemeCategory20c);

  let x = d3.scaleLinear()
    .range([0, width]);

  let y = d3.scaleLinear()
    .range([0, height]);

  const nest = d3.nest()
    .key(d => '')   // root
    .key(d => d.region)
    .key(d => d.subregion)
    .key(d => d.key)
    .sortValues((a, b) => b.value - a.value);

  const treemap = d3.treemap()
    .size([width, height])
    .padding(false)
    .padding(1);

  // console.log('treemap()', treemap());

  // const hierarchy = d3.hierarchy()
  //   .children((d, depth) => {
  //     if (depth) {
  //       return null;
  //     }
  //     return d._children;
  //   })
  //   .sort((a, b) => a.value - b.value)
  //   .ratio(height / (width * 0.5 * (1 + Math.sqrt(5))))
  //   .round(false);

  const svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.bottom + margin.top)
    .style('margin-left', `${-margin.left}px`)
    .style('margin.right', `${-margin.right}px`)
    .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .style('shape-rendering', 'crispEdges');

  const grandparent = svg.append('g')
    .attr('class', 'grandparent');

  grandparent.append('rect')
    .attr('y', -margin.top)
    .attr('width', width)
    .attr('height', margin.top);

  grandparent.append('text')
    .attr('x', 6)
    .attr('y', 6 - margin.top)
    .attr('dy', '.75em');

  if (opts.title) {
    // if the options specify a title
    // add the title to the page before the chart div
    const parentNode = document.querySelector('div#chart');
    const newChild = document.createElement('div');
    newChild.innerHTML = `<p class='title'>${opts.title}</p>`;
    const refChild = parentNode.firstElementChild;
    parentNode.insertBefore(newChild, refChild);
  }

  console.log('data right before root', data);

  let root = d3.hierarchy(data, d => d.values)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  // x.domain([0, root.value]);
  // y.domain([0, root.value]);

  x.domain([0, root.value]);
  y.domain([0, root.value]);

  console.log('root', root);

  initialize(root);
  accumulate(root);
  layout(root);
  console.log(root);
  display(root);

  if (window.parent !== window) {
    const myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.parent.postMessage({ height: myheight }, '*');
  }

  function initialize(root) {
    root.x0 = 0;
    root.y0 = 0;
    root.x1 = width;
    root.y1 = height;
    root.depth = 0;
  } 

  // Aggregate the values for internal nodes. This is normally done by the
  // treemap layout, but not here because of our custom implementation.
  // We also take a snapshot of the original children (_children) to avoid
  // the children being overwritten when when layout is computed.
  function accumulate(d) {
    console.log('d from accumulate', d);
    d._children = d.children;
    if (d._children) {
      d.value = d.children.reduce((p, v) => p + accumulate(v), 0);
      return d.value;
    }
    return d.value;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    // console.log('d from layout', d);
    if (d._children) {
      let childrenRoot = d3.hierarchy({ _children: d._children }, d => d._children)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

      treemap(childrenRoot);

      d._children = childrenRoot.children;
      // console.log('childrenRoot from layout', childrenRoot)
      d._children.forEach((c) => {
        // console.log('c from layout', c);
        c.x0 = d.x0 + (c.x0 * d.x1);
        c.y0 = d.y0 + (c.y0 * d.y1);
        c.x1 *= d.x1;
        c.y1 *= d.y1;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
      .datum(d.parent)
      .on('click', transition)
      .select('text')
        .text(name(d));

    const g1 = svg.insert('g', '.grandparent')
      .datum(d)
      .attr('class', 'depth');

    const g = g1.selectAll('g')
      .data(d._children)
      .enter().append('g');

    g.filter(d => d._children)
      .classed('children', true)
      .on('click', transition);

    const children = g.selectAll('.child')
      .data(d => d._children || [d])
      .enter().append('g');

    children.append('rect')
      .attr('class', 'child')
      .call(rect)
      .append('title')
        .text(d => `${d.key} (${formatNumber(d.value)})`);

    children.append('text')
      .attr('class', 'ctext')
      .text(d => d.key)
      .call(text2);

    g.append('rect')
      .attr('class', 'parent')
      .call(rect);

    const t = g.append('text')
      .attr('class', 'ptext')
      .attr('dy', '.75em');

    t.append('tspan')
      .text(d => d.key);

    t.append('tspan')
      .attr('dy', '1.0em')
      .text(d => formatNumber(d.value));

    t.call(text);

    g.selectAll('rect')
      .style('fill', d => color(d.key));

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      const g2 = display(d);
      const t1 = g1.transition().duration(750);
      const t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x0, d.x0 + d.x1]);
      y.domain([d.y0, d.y0 + d.y1]);

      // Enable anti-aliasing during the transition.
      svg.style('shape-rendering', null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll('.depth').sort((a, b) => a.depth - b.depth);

      // Fade-in entering text.
      g2.selectAll('text').style('fill-opacity', 0);

      // Transition to the new view.
      t1.selectAll('.ptext').call(text).style('fill-opacity', 0);
      t1.selectAll('.ctext').call(text2).style('fill-opacity', 0);
      t2.selectAll('.ptext').call(text).style('fill-opacity', 1);
      t2.selectAll('.ctext').call(text2).style('fill-opacity', 1);
      t1.selectAll('rect').call(rect);
      t2.selectAll('rect').call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each('end', () => {
        svg.style('shape-rendering', 'crispEdges');
        transitioning = false;
      });
    }
    return g;
  }

  function text(text) {
    text.selectAll('tspan')
      .attr('x', d => x(d.x0) + 6);

    text.attr('x', d => x(d.x0) + 6)
      .attr('y', d => y(d.y0) + 6)
      .style('opacity', function (d) { return this.getComputedTextLength() < x(d.x0 + d.x1) - x(d.x0) ? 1 : 0; });
  }

  function text2(text) {
    text.attr('x', function (d) { 
      return x(d.x0 + d.x1) - this.getComputedTextLength() - 6; 
    })
      .attr('y', d => y(d.y0 + d.y1) - 6)
      .style('opacity', function (d) { return this.getComputedTextLength() < x(d.x0 + d.x1) - x(d.x0) ? 1 : 0; });
  }

  function rect(rect) {
    rect.attr('x', d => {
      console.log('d from rect', d);
      console.log('d.x0 from rect', d.x0);
      return x(d.x0)
    })
      .attr('y', d => y(d.y0))
      .attr('width', d => x(d.x0 + d.x1) - x(d.x0))
      .attr('height', d => y(d.y0 + d.y1) - y(d.y0));
  }

  // used for navigation bar at the top
  function name(d) {
    if (d.parent) {
      return `${name(d.parent)} / ${d.data.key} (${formatNumber(d.value)})`;
    }
    // used for navigation bar at the top
    return `${d.data.key} (${formatNumber(d.value)})`;
  }

  // a replacement for the jQuery `$.extend(true, {}, objA, objB);`
  // http://youmightnotneedjquery.com/ with search term `extend`
  function deepExtend(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
      var obj = arguments[i];
      if (!obj)
        continue;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object')
            out[key] = deepExtend(out[key], obj[key]);
          else
            out[key] = obj[key];
        }
      }
    }
    return out;
  };
}

if (window.location.hash === '') {
  d3.json('countries.json', (err, response) => {
    if (!err) {
      console.log('response', response);
      const data = d3.nest().key(d => d.region).key(d => d.subregion).entries(response);
      main({ title: 'World Population' }, { key: 'World', values: data });
    }
  });
}
