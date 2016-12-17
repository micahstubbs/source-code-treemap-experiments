an iteration with the h2o-3 csv data.

d3 version 3, es2015

---

updated to [ES2015](https://babeljs.io/learn-es2015/) 

---

a treemap prototype where the 

+ area of the cell 
+ the maxArea of all the cells that share the same depth and same parent with that cell

is used to scale the color on an orange to lightgray colorscale.

the size variable is double-encoded as cell area and cell color.

I extend `d3.layout.treemap` to calculate the maxArea across a set of sibling nodes and call the extended layout `d3.layout.treemap2`

the sort property of the treemap2 layout positions the largest area cell in the top-right of the group.  

`.sort(function(a, b){ return a.value - b.value })`

an iteration on [http://mbostock.github.io/d3/talk/20111018/treemap.html](http://mbostock.github.io/d3/talk/20111018/treemap.html)

and this [StackOverflow Answer](http://stackoverflow.com/questions/21734017/d3-js-how-to-decide-both-the-area-and-the-color-of-each-square-by-the-size-of-e)